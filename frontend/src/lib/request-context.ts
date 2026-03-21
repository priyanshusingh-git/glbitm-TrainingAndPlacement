import type { NextRequest, NextResponse } from "next/server"

type RequestLike = Pick<NextRequest, "headers"> & {
  nextUrl?: {
    pathname: string
  }
  url?: string
  method?: string
}

export function getIpAddress(request: RequestLike) {
  return (request.headers.get("x-forwarded-for") ?? "127.0.0.1")
    .split(",")[0]
    .trim()
}

export function getUserAgent(request: RequestLike) {
  return request.headers.get("user-agent") ?? "unknown"
}

export function getRequestId(request: RequestLike) {
  return request.headers.get("x-request-id") ?? "unknown"
}

export function getRequestPath(request: RequestLike) {
  if (request.nextUrl?.pathname) {
    return request.nextUrl.pathname
  }

  if (request.url) {
    try {
      return new URL(request.url).pathname
    } catch {
      return request.url
    }
  }

  return "unknown"
}

export function getRequestMethod(request: RequestLike) {
  return request.method ?? "UNKNOWN"
}

export function attachRequestContextHeaders(
  request: RequestLike,
  response: NextResponse
) {
  const requestId = getRequestId(request)

  if (requestId && requestId !== "unknown") {
    response.headers.set("x-request-id", requestId)
  }

  return response
}
