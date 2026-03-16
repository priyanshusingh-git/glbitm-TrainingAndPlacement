"use client"

import Link from "next/link"
import { AlertCircle, ArrowRight } from "lucide-react"
import { AuthShell } from "@/components/layout/auth-shell"
import { Button } from "@/components/ui/button"

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Reset flow updated"
      description="Password recovery now uses a 6-digit verification code sent to your registered email. Continue through the secure OTP flow to set a new password."
      asideTitle="Recovery Update"
      asideDescription="Legacy reset links are no longer the primary recovery path. The platform now verifies password recovery through short-lived OTP codes."
    >
      <div className="space-y-5">
        <div className="feedback-message feedback-message-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>This page no longer accepts token-based reset links. Start a new OTP-based recovery request instead.</span>
        </div>

        <Button asChild className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700">
          <Link href="/forgot-password">
            Continue to secure recovery
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <p className="text-center text-[12px] leading-[1.7] text-muted-foreground">
          If you still have an older reset email, you can ignore that link and request a fresh verification code from the recovery page.
        </p>
      </div>
    </AuthShell>
  )
}
