"use server";

import Groq from "groq-sdk";
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
 * Backed by Groq's OpenAI-compatible chat completions API. The default model
 * is Llama 3.1 8B Instant — fastest Groq tier, well within the free quota
 * (30 req/min) and good enough quality for the short summary + workspace
 * Q&A tasks here.
 *
 * No prompt caching layer (Groq doesn't expose one); the system prompts are
 * kept compact to fit comfortably under the free-tier 6000 tokens/min cap
 * on Llama 3.1 8B.
 */

export async function isAiEnabled(): Promise<boolean> {
  return AI_ENABLED;
}

const MODEL = "llama-3.1-8b-instant";
const MAX_TOKENS = 1024;

// Trimmed from the Anthropic version's 50KB cap because Groq's free tier
// has a tighter per-minute token budget. ~25KB ≈ ~6.5k tokens, leaving
// headroom for the system prompt and completion within a single request.
const SUMMARY_CONTENT_BYTES = 25 * 1024;

const SUMMARIZABLE_EXTENSIONS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "log",
]);

function getClient(): Groq {
  if (!AI_ENABLED) {
    throw new ActionError(
      "AI is not configured on this deploy.",
      "AI_DISABLED",
    );
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function handleGroqError(error: unknown, fallback: string): never {
  if (error instanceof Groq.APIError) {
    if (error.status === 429) {
      logError("groq.rate_limited", error);
      throw new ActionError(
        "AI is rate-limited, try again in a moment.",
        "AI_RATE_LIMITED",
      );
    }
    if (error.status === 503) {
      logError("groq.overloaded", error);
      throw new ActionError(
        "AI is temporarily unavailable, try again in a moment.",
        "AI_OVERLOADED",
      );
    }
    if (error.status === 401 || error.status === 403) {
      logError("groq.auth", error);
      throw new ActionError(
        "AI is not configured on this deploy.",
        "AI_DISABLED",
      );
    }
  }
  handleActionError(error, fallback);
  throw new ActionError(fallback);
}

const SUMMARY_SYSTEM_PROMPT = `You are the summarizer inside Nimbus, a modern cloud-storage workspace. Users hit a "Summarize with AI" button on a file's preview modal and want a fast, factual read.

Produce a 3-5 sentence summary. Rules:
- Concrete and factual. Cite specific numbers, names, dates, or sections that appear in the text. No vague phrases like "this document discusses various topics".
- CSV: mention column headers and approximate row count.
- JSON: mention top-level keys and rough shape.
- Log files: surface error patterns, time range, anomaly counts.
- Markdown / text notes: give the gist plus 1-2 standout details.
- Never invent content. If the content was truncated, say so once at the end.
- Plain prose. No headings. No bullets unless the source is a list. No preamble like "Here's a summary:" — go straight in.
- Under ~120 words.`;

const WORKSPACE_SYSTEM_PROMPT = `You are the AI assistant inside Nimbus, a cloud-storage workspace. The user is asking questions about their files; you only see metadata (not contents).

Data model:
- Each file has: name, type (document/image/video/audio/other), extension, size in bytes, $createdAt (ISO), folderId (string or null — null means root).
- "document" includes PDFs and office files. "video" and "audio" share the "media" tab.
- folderId values are opaque IDs unless a folder name is supplied; if so, use the name.
- The list is capped at the 200 most-recent files by $createdAt and is the only source of truth.

How to answer:
- Direct and concrete. Lead with the answer, then supporting numbers in one short sentence.
- Format sizes using KB / MB / GB (base-1024). Round to one decimal.
- When asked to organize, suggest concrete folder names grouped by file type or by name prefixes you can see. Don't suggest a folder unless at least 3 files fit it.
- No JSON, code blocks, or markdown headings. Short paragraphs and the occasional bullet list are fine.
- If the workspace is empty, say so and offer one upload suggestion.
- If a question can't be answered from the metadata (e.g. "what does file X say?"), explain that you only see metadata, not contents, and point to the Summarize button in the preview modal.
- Never claim to have taken an action — you only answer questions. You cannot create folders, rename, or move files.`;

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
    const content = truncated ? raw.slice(0, SUMMARY_CONTENT_BYTES) : raw;

    const fileName = (file.name as string) ?? "file";

    const client = getClient();
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        {
          role: "user",
          content:
            `File name: ${fileName}\n` +
            `Extension: .${extension}\n` +
            `Size: ${file.size ?? "unknown"} bytes\n` +
            (truncated
              ? `Note: the content below was truncated to the first ${SUMMARY_CONTENT_BYTES} bytes.\n`
              : "") +
            `\n--- BEGIN FILE CONTENT ---\n${content}\n--- END FILE CONTENT ---`,
        },
      ],
    });

    const text =
      response.choices[0]?.message?.content?.toString().trim() ?? "";

    if (!text) {
      throw new ActionError(
        "AI returned an empty summary. Try again.",
        "AI_EMPTY",
      );
    }

    return { summary: text };
  } catch (error) {
    if (error instanceof ActionError) throw error;
    handleGroqError(error, "Failed to summarize file.");
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

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

    const trimmed = messages.slice(-10);
    if (trimmed[trimmed.length - 1].role !== "user") {
      throw new ActionError(
        "The last message must be from the user.",
        "AI_BAD_THREAD",
      );
    }

    const fileList = await getFiles({
      types: [],
      searchText: "",
      sort: "$createdAt-desc",
      limit: 200,
    });

    const docs = ((fileList?.documents ?? []) as Models.DefaultDocument[])
      .slice(0, 200);

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

    const apiMessages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: WORKSPACE_SYSTEM_PROMPT },
      ...trimmed.map((m, idx) => {
        if (idx === trimmed.length - 1 && m.role === "user") {
          return {
            role: "user" as const,
            content: `${m.content}\n\n--- Workspace metadata ---\n${workspaceBlock}`,
          };
        }
        return { role: m.role, content: m.content };
      }),
    ];

    const client = getClient();
    const response = await client.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: apiMessages,
    });

    const text =
      response.choices[0]?.message?.content?.toString().trim() ?? "";

    if (!text) {
      throw new ActionError(
        "AI returned an empty response. Try again.",
        "AI_EMPTY",
      );
    }

    return { assistantMessage: text };
  } catch (error) {
    if (error instanceof ActionError) throw error;
    handleGroqError(error, "Failed to ask AI about workspace.");
  }
}
