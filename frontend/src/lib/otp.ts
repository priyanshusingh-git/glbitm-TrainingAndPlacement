import crypto from "crypto"
import { SignJWT, jwtVerify } from "jose"

export function generateOtp(length = 6) {
  let otp = ""

  for (let index = 0; index < length; index += 1) {
    otp += crypto.randomInt(0, 10).toString()
  }

  return otp
}

export function hashOtp(otp: string) {
  return crypto
    .createHash("sha256")
    .update(`${otp}${process.env.OTP_HASH_SECRET}`)
    .digest("hex")
}

const resetSecret = () => new TextEncoder().encode(process.env.RESET_TOKEN_SECRET)

export async function createPasswordResetToken(payload: {
  uid: string
  email: string
}) {
  return new SignJWT({
    uid: payload.uid,
    email: payload.email,
    purpose: "password-reset",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.uid)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(resetSecret())
}

export async function verifyPasswordResetToken(token: string) {
  const { payload } = await jwtVerify(token, resetSecret())

  if (payload.purpose !== "password-reset") {
    throw new Error("Invalid token purpose")
  }

  return {
    uid: String(payload.uid),
    email: String(payload.email),
  }
}
