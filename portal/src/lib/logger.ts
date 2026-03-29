type LogLevel = "debug" | "info" | "warn" | "error"

const SERVICE_NAME = "glbitm-training-and-placement"
const MAX_DEPTH = 5
const MAX_ARRAY_ITEMS = 25
const MAX_OBJECT_KEYS = 50
const MAX_STRING_LENGTH = 1000

const REDACTED_VALUE = "[Redacted]"
const TRUNCATED_VALUE = "[Truncated]"

const SENSITIVE_KEY_PARTS = [
  "password",
  "passwd",
  "secret",
  "token",
  "cookie",
  "authorization",
  "otp",
  "privatekey",
  "private_key",
  "accesskey",
  "access_key",
  "refresh",
  "session",
  "credential",
  "csrf",
  "hcaptcha",
  "smtp_pass",
  "email_pass",
]

type LogContext = Record<string, unknown> | unknown

function isSensitiveKey(key: string) {
  const normalized = key.toLowerCase().replace(/[\s_-]/g, "")
  return SENSITIVE_KEY_PARTS.some((part) => normalized.includes(part.replace(/[\s_-]/g, "")))
}

function truncateString(value: string) {
  if (value.length <= MAX_STRING_LENGTH) {
    return value
  }

  return `${value.slice(0, MAX_STRING_LENGTH)}…`
}

function serializeError(error: Error, depth: number, seen: WeakSet<object>) {
  return {
    name: error.name,
    message: truncateString(error.message),
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    ...(error.cause ? { cause: sanitize(error.cause, depth + 1, seen) } : {}),
    ...Object.fromEntries(
      Object.entries(error).map(([key, value]) => [
        key,
        isSensitiveKey(key) ? REDACTED_VALUE : sanitize(value, depth + 1, seen),
      ])
    ),
  }
}

function sanitize(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value == null) {
    return value
  }

  if (typeof value === "string") {
    return truncateString(value)
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value
  }

  if (typeof value === "bigint") {
    return value.toString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof URL) {
    return value.toString()
  }

  if (value instanceof Error) {
    return serializeError(value, depth, seen)
  }

  if (typeof Headers !== "undefined" && value instanceof Headers) {
    return sanitize(Object.fromEntries(value.entries()), depth + 1, seen)
  }

  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) {
      return TRUNCATED_VALUE
    }

    return value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitize(item, depth + 1, seen))
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]"
    }

    if (depth >= MAX_DEPTH) {
      return TRUNCATED_VALUE
    }

    seen.add(value)

    const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS)
    const next: Record<string, unknown> = {}

    for (const [key, item] of entries) {
      next[key] = isSensitiveKey(key) ? REDACTED_VALUE : sanitize(item, depth + 1, seen)
    }

    return next
  }

  return String(value)
}

function normalizeContext(context?: LogContext) {
  if (context === undefined) {
    return undefined
  }

  if (
    context !== null &&
    typeof context === "object" &&
    !Array.isArray(context) &&
    !(context instanceof Error)
  ) {
    return sanitize(context)
  }

  return {
    data: sanitize(context),
  }
}

function writeLog(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    environment: process.env.NODE_ENV ?? "development",
    level,
    severity: level.toUpperCase(),
    message,
    ...(normalizeContext(context) ?? {}),
  }

  const line = JSON.stringify(payload)

  switch (level) {
    case "error":
      console.error(line)
      break
    case "warn":
      console.warn(line)
      break
    default:
      console.log(line)
      break
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      writeLog("debug", message, context)
    }
  },
  info(message: string, context?: LogContext) {
    writeLog("info", message, context)
  },
  warn(message: string, context?: LogContext) {
    writeLog("warn", message, context)
  },
  error(message: string, context?: LogContext) {
    writeLog("error", message, context)
  },
}
