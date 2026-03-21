import crypto from "crypto"
import { Prisma } from "@prisma/client"
import prisma from "@/lib/db"
import { logger } from "@/lib/logger"

export type AuthAuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_ROLE_MISMATCH"
  | "RATE_LIMITED"
  | "BOT_HONEYPOT"
  | "OTP_SENT"
  | "OTP_VERIFIED"
  | "OTP_FAILED"
  | "OTP_EXPIRED"
  | "PASSWORD_RESET_SUCCESS"
  | "SESSION_CREATED"
  | "SESSION_REVOKED"
  | "ACCOUNT_SUSPENDED"
  | "CREDENTIAL_STUFFING"

function hashEmail(email: string) {
  return crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
}

export async function logAuthEvent(params: {
  action: AuthAuditAction
  ip: string
  userId?: string | null
  email?: string | null
  userAgent?: string | null
  fingerprint?: string | null
  metadata?: Record<string, unknown> | null
}) {
  try {
    await prisma.authAuditLog.create({
      data: {
        userId: params.userId ?? null,
        emailHash: params.email ? hashEmail(params.email) : null,
        action: params.action,
        ip: params.ip,
        userAgent: params.userAgent ?? null,
        fingerprint: params.fingerprint ?? null,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    })
  } catch (error) {
    logger.error("Auth audit logging failed:", error)
  }
}
