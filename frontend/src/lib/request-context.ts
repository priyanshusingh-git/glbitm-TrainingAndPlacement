import type { NextRequest } from "next/server"

type RequestLike = Pick<NextRequest, "headers">

export function getIpAddress(request: RequestLike) {
  return (request.headers.get("x-forwarded-for") ?? "127.0.0.1")
    .split(",")[0]
    .trim()
}

export function getUserAgent(request: RequestLike) {
  return request.headers.get("user-agent") ?? "unknown"
}
