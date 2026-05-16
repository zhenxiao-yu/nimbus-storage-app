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

export const handleActionError = (error: unknown, message: string): never => {
  logError(message, error);
  throw error;
};
