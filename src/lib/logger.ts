// Structured logging façade. App code logs through this module, never raw
// console.* — so a reporting provider (Phase 10) can be attached in one place.
// NEVER log: passwords, tokens, private prayers/reflections, full user objects.

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, string | number | boolean | null | undefined>;

const isDev = import.meta.env.DEV;

function emit(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
  if (level === "debug" && !isDev) return;
  const payload = context && Object.keys(context).length > 0 ? context : undefined;
  const args: unknown[] = [`[${level}] ${message}`];
  if (payload) args.push(payload);
  if (error !== undefined) args.push(error);
  console[level === "debug" ? "log" : level](...args);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    emit("error", message, context, error),
};
