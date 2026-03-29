import { ZodError } from "zod"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import {
  attachRequestContextHeaders,
  getIpAddress,
  getRequestId,
  getRequestMethod,
  getRequestPath,
  getUserAgent,
} from "@/lib/request-context"

type LogLevel = "warn" | "error"

type ProblemExtensions = Record<string, unknown>

const PROBLEM_BASE_URL = "https://glbitm.org/problems"

export class ApiError extends Error {
  status: number
  code: string
  title: string
  detail?: string
  type: string
  expose: boolean
  extensions?: ProblemExtensions
  logLevel: LogLevel

  constructor(options: {
    status: number
    code: string
    title: string
    detail?: string
    type?: string
    expose?: boolean
    extensions?: ProblemExtensions
    logLevel?: LogLevel
    cause?: unknown
  }) {
    super(options.detail ?? options.title, options.cause ? { cause: options.cause } : undefined)
    this.name = "ApiError"
    this.status = options.status
    this.code = options.code
    this.title = options.title
    this.detail = options.detail
    this.type = options.type ?? `${PROBLEM_BASE_URL}/${options.code.toLowerCase().replace(/_/g, "-")}`
    this.expose = options.expose ?? options.status < 500
    this.extensions = options.extensions
    this.logLevel = options.logLevel ?? (options.status >= 500 ? "error" : "warn")
  }
}

export function createProblemResponse(
  request: NextRequest,
  options: {
    status: number
    code: string
    title: string
    detail?: string
    type?: string
    expose?: boolean
    headers?: HeadersInit
    extensions?: ProblemExtensions
  }
) {
  const response = NextResponse.json(
    {
      type: options.type ?? `${PROBLEM_BASE_URL}/${options.code.toLowerCase().replace(/_/g, "-")}`,
      title: options.title,
      status: options.status,
      detail: options.expose === false ? undefined : options.detail ?? options.title,
      instance: getRequestPath(request),
      code: options.code,
      requestId: getRequestId(request),
      error: options.expose === false ? options.title : options.detail ?? options.title,
      ...(options.extensions ?? {}),
    },
    {
      status: options.status,
      headers: options.headers,
    }
  )

  response.headers.set("Content-Type", "application/problem+json; charset=utf-8")
  return attachRequestContextHeaders(request, response)
}

export function badRequestError(
  code: string,
  detail: string,
  extensions?: ProblemExtensions
) {
  return new ApiError({
    status: 400,
    code,
    title: "Invalid request",
    detail,
    extensions,
  })
}

export function unauthorizedError(
  code: string,
  detail: string,
  extensions?: ProblemExtensions
) {
  return new ApiError({
    status: 401,
    code,
    title: "Authentication failed",
    detail,
    extensions,
  })
}

export function forbiddenError(
  code: string,
  detail: string,
  extensions?: ProblemExtensions
) {
  return new ApiError({
    status: 403,
    code,
    title: "Access denied",
    detail,
    extensions,
  })
}

export function rateLimitError(
  detail: string,
  retryAfter: number,
  extensions?: ProblemExtensions
) {
  return new ApiError({
    status: 429,
    code: "RATE_LIMITED",
    title: "Too many requests",
    detail,
    extensions: {
      retryAfter,
      ...(extensions ?? {}),
    },
  })
}

export function serviceUnavailableError(
  code: string,
  detail: string,
  extensions?: ProblemExtensions
) {
  return new ApiError({
    status: 503,
    code,
    title: "Service temporarily unavailable",
    detail,
    extensions,
  })
}

function fromZodError(error: ZodError) {
  return new ApiError({
    status: 400,
    code: "VALIDATION_ERROR",
    title: "Invalid request",
    detail: "Request validation failed.",
    extensions: {
      errors: error.flatten(),
    },
  })
}

function normalizeError(error: unknown) {
  if (error instanceof ApiError) {
    return error
  }

  if (error instanceof ZodError) {
    return fromZodError(error)
  }

  return new ApiError({
    status: 500,
    code: "INTERNAL_ERROR",
    title: "Request failed",
    detail: "We could not process your request right now. Please try again later.",
    expose: true,
    logLevel: "error",
    cause: error,
  })
}

export function handleApiError(
  request: NextRequest,
  error: unknown,
  options: {
    event: string
    message: string
    context?: Record<string, unknown>
  }
) {
  const normalized = normalizeError(error)
  const logContext = {
    event: options.event,
    requestId: getRequestId(request),
    method: getRequestMethod(request),
    path: getRequestPath(request),
    ip: getIpAddress(request),
    userAgent: getUserAgent(request),
    status: normalized.status,
    code: normalized.code,
    ...(options.context ?? {}),
    error,
  }

  if (normalized.logLevel === "error") {
    logger.error(options.message, logContext)
  } else {
    logger.warn(options.message, logContext)
  }

  return createProblemResponse(request, {
    status: normalized.status,
    code: normalized.code,
    title: normalized.title,
    detail: normalized.expose ? normalized.detail : undefined,
    type: normalized.type,
    expose: normalized.expose,
    extensions: normalized.extensions,
  })
}
