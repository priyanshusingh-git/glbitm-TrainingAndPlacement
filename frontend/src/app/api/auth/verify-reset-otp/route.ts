import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { hashOtp } from "@/lib/otp"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = body?.email?.trim?.().toLowerCase?.()
  const otp = body?.otp?.trim?.()

  if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
    return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      otp: true,
      otpExpires: true,
    },
  })

  if (!user?.otp || !user.otpExpires) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
  }

  const isExpired = user.otpExpires.getTime() < Date.now()
  const isMatch = user.otp === hashOtp(otp)

  if (isExpired || !isMatch) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
  }

  return NextResponse.json({ message: "Verification successful" })
}
