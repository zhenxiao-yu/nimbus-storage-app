"use server";

import Anthropic from "@anthropic-ai/sdk";
import { Models, Query } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { getFiles } from "@/lib/actions/file.query";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { AI_ENABLED } from "@/lib/env";
import {
  ActionError,
  handleActionError,
  logError,
} from "@/lib/logger";

/**
 * AI Workspace server actions.
 *
 * Talks to Anthropic's Messages API using the Haiku 4.5 model — fastest +
 * cheapest tier, enough headroom for short summaries and metadata Q&A.
 *
 * Prompt caching is applied via `cache_control: { type: "ephemeral" }` on
 * the system block. Both surfaces share long, descriptive system prompts;
 * caching them means follow-up turns and repeat summaries skip the prompt
 * re-tokenization on Anthropic's side and reduce billed input tokens.
 */

/**
 * Cheap server-callable feature flag probe for client components that
 * can't import `lib/env.ts` directly (it would leak the secret name into
 * the client bundle). Returns a plain boolean so callers can hide UI.
 */
export async function isAiEnabled(): Promise<boolean> {
  return AI_ENABLED;
}

const MODEL = "claude-haiku-4-5";
const MAX_TOKENS = 1024;

// Cap on raw text we send to the model when summarizing — keeps a single
// request well under context limits and avoids dragging huge .log/.csv files
// through the wire.
const SUMMARY_CONTENT_BYTES = 50 * 1024;

const SUMMARIZABLE_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "log",
]);

/**
 * Lazy SDK construction — letting the module-level `new Anthropic()` run
 * even when the key is missing would throw at import time and break the
 * route group for unconfigured deploys.
 */
function getClient(): Anthropic {
  if (!AI_ENABLED) {
    throw new ActionError(
      "AI is not configured on this deploy.",
      "AI_DISABLED",
    );
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

/**
 * Map Anthropic SDK errors to safe user-facing messages. Rate-limit /
 * quota responses (HTTP 429 + overloaded_error) get a dedicated retry
 * hint; everything else falls back to a generic message.
 */
function handleAnthropicError(error: unknown, fallback: string): never {
  if (error instanceof Anthropic.APIError) {
    if (error.status === 429) {
      logError("anthropic.rate_limited", error);
      throw new ActionError(
        "AI is rate-limited, try again in a moment.",
        "AI_RATE_LIMITED",
      );
    }
    if (error.status === 529 || error.status === 503) {
      logError("anthropic.overloaded", error);
      throw new ActionError(
        "AI is rate-limited, try again in a moment.",
        "AI_OVERLOADED",
      );
    }
    if (error.status === 401 || error.status === 403) {
      logError("anthropic.auth", error);
      throw new ActionError(
        "AI is not configured on this deploy.",
        "AI_DISABLED",
      );
    }
  }
  // `handleActionError` itself is `never`, but TS can't see the call
  // through this wrapper without an explicit re-throw at the end.
  handleActionError(error, fallback);
  throw new ActionError(fallback);
}

const SUMMARY_SYSTEM_PROMPT = `You are the summarizer inside Nimbus, a modern cloud-storage workspace built on Appwrite + Next.js. Users drop in markdown notes, plain-text snippets, CSV exports, JSON dumps, and log files; they then hit a "Summarize with AI" button in the file preview modal because they want a fast, factual read on what's actually in the document — not marketing fluff.

Your job: produce a 3-5 sentence summary of the provided file content. Rules:
- Be concrete and factual. Cite specific numbers, names, dates, or sections that appear in the text. Avoid vague phrases like "this document discusses various topics".
- If the file is CSV, mention the column headers and approximate row count if discernible. If it's JSON, mention top-level keys and rough shape.
- If it's a log file, surface error patterns, time range, and any obvious anomaly counts.
- If it's a markdown / text note, give the gist plus 1-2 standout details.
- Never invent content not present in the file. If the content was truncated (the user will be told), say so once at the end of the summary.
- Output plain prose. No headings. No bullet lists unless the source is itself a list. No preamble like "Here's a summary:" — go straight into it.
- Keep it under ~120 words.`;

const WORKSPACE_SYSTEM_PROMPT = `You are the AI assistant inside Nimbus, a cloud-storage workspace built on Appwrite. The user is asking factual questions about the files in their workspace — they cannot see file contents through you, only metadata.

Data model you can rely on:
- Each file has: name, type (one of document/image/video/audio/other), extension, size in bytes, $createdAt (ISO timestamp of upload), folderId (string or null — null means it lives at the workspace root).
- File types are bucketed broadly. "document" includes PDFs and office files. "video" and "audio" share the "media" tab in the UI.
- folderId values are opaque Appwrite IDs; you don't have folder names. If the user asks about a specific folder, explain that and answer in terms of "files in folder <id>" or "files at the root".
- The list you receive is capped at the 200 most-recent files by $createdAt and is the *only* source of truth for your answers. Don't speculate about files you don't see.

How to answer:
- Be direct and concrete. Lead with the answer, then the supporting numbers in one short sentence.
- Format sizes using KB / MB / GB (base-1024). Round to one decimal.
- When asked to organize, suggest concrete folder names grouped by file type or name prefixes you can actually see in the metadata. Don't suggest a folder unless at least 3 files fit it.
- Do not output JSON, code blocks, or markdown headings. Short paragraphs and the occasional bullet list are fine.
- If the workspace is empty, say so plainly and offer one upload suggestion.
- If a question can't be answered from the metadata (e.g. "what does file X say?"), explain that you only see metadata, not contents, and point to the Summarize button in the preview modal.
- Never claim to have taken an action — you only answer questions. You cannot create folders, rename, or move files.`;

/**
 * Summarize a single text-y file owned by (or shared with) the current
 * user. Hard-fails for non-text file types because Anthropic can't read
 * binary content over this code path and we don't want to silently send
 * a PDF as raw bytes.
 */
export async function summarizeFile({
  fileId,
}: {
  fileId: string;
}): Promise<{ summary: string }> {
  if (!AI_ENABLED) {
    throw new ActionError(
      "AI is not configured on this deploy.",
      "AI_DISABLED",
    );
  }

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new ActionError("Not signed in.", "UNAUTHENTICATED");
    }

    const { databases } = await createAdminClient();
    const file = (await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    )) as Models.DefaultDocument;

    // Verify ownership / sharing access. The admin client bypasses
    // per-document permissions, so we re-check manually.
    const ownerId =
      typeof file.owner === "object" && file.owner !== null
        ? ((file.owner as { $id?: string }).$id ?? "")
        : (file.owner as string);
    const sharedEmails = (file.users as string[] | undefined) ?? [];
    const isOwner = ownerId === currentUser.$id;
    const isShared = sharedEmails.includes(currentUser.email);
    if (!isOwner && !isShared) {
      throw new ActionError("Not found.", "NOT_FOUND");
    }

    const extension = ((file.extension as string) ?? "").toLowerCase();
    if (!SUMMARIZABLE_EXTENSIONS.has(extension)) {
      throw new ActionError(
        "AI summary is only available for text files (md, txt, csv, json, log).",
        "AI_UNSUPPORTED_TYPE",
      );
    }

    const url = file.url as string | undefined;
    if (!url) {
      throw new ActionError(
        "File is missing a download URL.",
        "AI_NO_URL",
      );
    }

    let raw: string;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`fetch failed with status ${res.status}`);
      }
      raw = await res.text();
    } catch (fetchErr) {
      logError("summarizeFile.fetch", fetchErr, { fileId });
      throw new ActionError(
        "Couldn't fetch the file to summarize.",
        "AI_FETCH_FAILED",
      );
    }

    const truncated = raw.length > SUMMARY_CONTENT_BYTES;
    const content = truncated
      ? raw.slice(0, SUMMARY_CONTENT_BYTES)
      : raw;

    const fileName = (file.name as string) ?? "file";

    const client = getClient();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: SUMMARY_SYSTEM_PROMPT,
          // Prompt caching: the system block is identical on every
          // summarize call, so Anthropic can serve it from cache.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `File name: ${fileName}\n` +
                `Extension: .${extension}\n` +
                `Size: ${file.size ?? "unknown"} bytes\n` +
                (truncated
                  ? `Note: the content below was truncated to the first ${SUMMARY_CONTENT_BYTES} bytes.\n`
                  : "") +
                `\n--- BEGIN FILE CONTENT ---\n${content}\n--- END FILE CONTENT ---`,
            },
          ],
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new ActionError(
        "AI returned an empty summary. Try again.",
        "AI_EMPTY",
      );
    }

    return { summary: text };
  } catch (error) {
    if (error instanceof ActionError) throw error;
    handleAnthropicError(error, "Failed to summarize file.");
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Format a number of bytes as KB/MB/GB for the model. The model is told
 * to format sizes itself, but pre-formatting also keeps token counts down
 * relative to feeding raw byte numbers.
 */
function fmtSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Q&A over the user's workspace metadata. The thread is in-memory on the
 * client; we receive the whole transcript on each turn, cap it at 10
 * turns, and serialize the file list into a compact text block tacked
 * onto the latest user message.
 */
export async function askAboutWorkspace({
  messages,
}: {
  messages: ChatMessage[];
}): Promise<{ assistantMessage: string }> {
  if (!AI_ENABLED) {
    throw new ActionError(
      "AI is not configured on this deploy.",
      "AI_DISABLED",
    );
  }

  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new ActionError("No message to send.", "AI_EMPTY_INPUT");
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new ActionError("Not signed in.", "UNAUTHENTICATED");
    }

    // Drop oldest turns past 10 messages, but always keep the most
    // recent user message at the tail.
    const trimmed = messages.slice(-10);
    if (trimmed[trimmed.length - 1].role !== "user") {
      throw new ActionError(
        "The last message must be from the user.",
        "AI_BAD_THREAD",
      );
    }

    // Pull workspace metadata — capped at 200 most-recent files. We use
    // the existing getFiles helper so permissions + filtering stay
    // consistent with the rest of the app (sharing, soft-delete, etc).
    const fileList = await getFiles({
      types: [],
      searchText: "",
      sort: "$createdAt-desc",
      limit: 200,
    });

    const docs = ((fileList?.documents ?? []) as Models.DefaultDocument[])
      .slice(0, 200);

    // Pull folder names to make answers about organization more useful.
    // Best-effort — if the folders collection isn't configured, skip.
    let folderLabels: Record<string, string> = {};
    if (appwriteConfig.foldersCollectionId) {
      try {
        const { databases } = await createAdminClient();
        const folders = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.foldersCollectionId,
          [
            Query.equal("owner", [currentUser.$id]),
            Query.isNull("deletedAt"),
            Query.limit(100),
          ],
        );
        folderLabels = Object.fromEntries(
          folders.documents.map((f) => [f.$id, (f.name as string) ?? "—"]),
        );
      } catch (folderErr) {
        logError("askAboutWorkspace.folders", folderErr);
      }
    }

    const totalSize = docs.reduce(
      (acc, f) => acc + ((f.size as number) ?? 0),
      0,
    );

    const fileLines = docs.map((f, i) => {
      const folderId = (f.folderId as string | null | undefined) ?? null;
      const folderHint = folderId
        ? `folder=${folderLabels[folderId] ? `"${folderLabels[folderId]}"` : folderId}`
        : "folder=root";
      return `${i + 1}. ${f.name} | type=${f.type} | ext=.${f.extension ?? ""} | size=${fmtSize((f.size as number) ?? 0)} | created=${f.$createdAt} | ${folderHint}`;
    });

    const workspaceBlock =
      `Workspace snapshot for user ${currentUser.email}:\n` +
      `- Total files visible: ${docs.length} (capped at 200 most-recent)\n` +
      `- Total size of visible files: ${fmtSize(totalSize)}\n` +
      `- Folders configured: ${Object.keys(folderLabels).length}\n\n` +
      `Files:\n${fileLines.join("\n") || "(no files yet)"}`;

    // Inject the metadata block into the latest user message. Earlier
    // turns stay clean — the model can still re-read older context.
    const apiMessages: Anthropic.MessageParam[] = trimmed.map((m, idx) => {
      if (idx === trimmed.length - 1 && m.role === "user") {
        return {
          role: "user",
          content: [
            {
              type: "text",
              text: `${m.content}\n\n--- Workspace metadata ---\n${workspaceBlock}`,
            },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const client = getClient();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: "text",
          text: WORKSPACE_SYSTEM_PROMPT,
          // Prompt caching: identical system prompt across every chat
          // turn → cached on Anthropic's side after the first request.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: apiMessages,
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new ActionError(
        "AI returned an empty response. Try again.",
        "AI_EMPTY",
      );
    }

    return { assistantMessage: text };
  } catch (error) {
    if (error instanceof ActionError) throw error;
    handleAnthropicError(error, "Failed to ask AI about workspace.");
  }
}
