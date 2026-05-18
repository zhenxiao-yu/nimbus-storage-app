"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { askAboutWorkspace } from "@/lib/actions/ai.actions";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STARTER_QUESTIONS = [
  "What's my biggest file?",
  "How am I using my storage?",
  "Help me organize my workspace",
];

/**
 * In-memory chat UI for /dashboard/ai. The thread lives only in this
 * component's state — refreshing the page wipes it. That matches the
 * brief (no persistence) and keeps the model honest about answering
 * from the latest workspace snapshot.
 */
export default function AiChat() {
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Keep the latest message in view whenever the thread grows or a
  // turn finishes.
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread, pending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    setError(null);
    const nextThread: ChatMessage[] = [
      ...thread,
      { role: "user", content: trimmed },
    ];
    setThread(nextThread);
    setInput("");
    setPending(true);

    try {
      const result = await askAboutWorkspace({ messages: nextThread });
      setThread([
        ...nextThread,
        { role: "assistant", content: result.assistantMessage },
      ]);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Something went wrong. Try again.";
      setError(message);
      // Roll back the optimistic user turn so the user can re-edit
      // and retry without a phantom dangling question.
      setThread(thread);
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-5">
      <div
        ref={scrollRef}
        className="flex max-h-[60vh] min-h-[260px] flex-col gap-3 overflow-y-auto"
      >
        {thread.length === 0 ? (
          <EmptyState onPick={(q) => send(q)} disabled={pending} />
        ) : (
          thread.map((m, i) => <Bubble key={i} message={m} />)
        )}
        {pending && (
          <div className="flex items-center gap-2 self-start rounded-2xl bg-muted/60 px-4 py-2.5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            Thinking…
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <label htmlFor="ai-input" className="sr-only">
          Ask about your workspace
        </label>
        <textarea
          id="ai-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={2}
          placeholder="Ask about your files… (Enter to send, Shift+Enter for newline)"
          disabled={pending}
          className="ring-focus min-h-[48px] flex-1 resize-none rounded-lg border border-border/60 bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        />
        <Button
          type="submit"
          disabled={pending || !input.trim()}
          className="h-[48px] shrink-0"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Send className="size-4" />
          )}
          Send
        </Button>
      </form>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1 rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isUser
          ? "self-end bg-primary/10 text-foreground"
          : "self-start bg-muted/60 text-foreground",
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {isUser ? "You" : "Claude"}
      </span>
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
    </div>
  );
}

function EmptyState({
  onPick,
  disabled,
}: {
  onPick: (q: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
        <Sparkles aria-hidden="true" className="size-5 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Ask anything about your workspace</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Try a starter question or type your own. Claude sees file metadata
          only — names, sizes, types, dates.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            disabled={disabled}
            className="ring-focus rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
