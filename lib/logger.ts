import { AppwriteException } from "node-appwrite";

type LogContext = Record<string, unknown> | undefined;

const isProd = process.env.NODE_ENV === "production";

export const logError = (
  message: string,
  error: unknown,
  context?: LogContext,
) => {
  const payload = context ? { error, ...context } : error;

  if (isProd) {
    console.error(JSON.stringify({ level: "error", message, payload }));
  } else {
    console.error(`[${message}]`, payload);
  }
};

/**
 * `ActionError` is the only error type server actions should ever throw to
 * the client. It carries a human-safe message + a code; the original
 * underlying error is logged server-side via `logError` but never
 * surfaced verbatim. This prevents leaking Appwrite document IDs,
 * collection names, project IDs, or internal SDK stack traces to callers.
 */
export class ActionError extends Error {
  public readonly code: string;
  constructor(message: string, code = "ACTION_ERROR") {
    super(message);
    this.name = "ActionError";
    this.code = code;
  }
}

/**
 * Map known Appwrite error types to safe, generic, user-facing messages.
 * Anything we don't recognize falls back to the caller-provided message so
 * we never leak raw SDK text.
 */
const sanitizeAppwriteError = (
  error: unknown,
  fallbackMessage: string,
): { message: string; code: string } => {
  if (error instanceof AppwriteException) {
    // Auth / permission classes — these are safe to surface generically.
    if (error.code === 401) {
      return { message: "Not signed in.", code: "UNAUTHENTICATED" };
    }
    if (error.code === 403) {
      return {
        message: "You don't have permission to perform this action.",
        code: "FORBIDDEN",
      };
    }
    if (error.code === 404) {
      return { message: "Not found.", code: "NOT_FOUND" };
    }
    if (error.code === 409) {
      return {
        message: "That action conflicts with the current state. Try again.",
        code: "CONFLICT",
      };
    }
    if (error.code === 429) {
      return {
        message: "Too many requests. Please slow down and retry shortly.",
        code: "RATE_LIMITED",
      };
    }
    // Everything else: don't echo SDK text (it can contain DB IDs).
    return { message: fallbackMessage, code: "APPWRITE_ERROR" };
  }
  return { message: fallbackMessage, code: "UNKNOWN" };
};

/**
 * Log the underlying error server-side and throw a sanitized `ActionError`
 * to the client. Marked `never` so TS treats this as a terminator like
 * `throw` itself.
 */
export const handleActionError = (error: unknown, message: string): never => {
  logError(message, error);

  // Re-raise our own ActionErrors as-is — they already carry safe text.
  if (error instanceof ActionError) {
    throw error;
  }

  const { message: safeMessage, code } = sanitizeAppwriteError(error, message);
  throw new ActionError(safeMessage, code);
};
