"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, ArrowLeft, CheckCircle2, Info, Loader2, LockKeyhole, Mail, RefreshCw, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"
import { validateStrongPassword } from "@/lib/validators"
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

type Step = 1 | 2 | 3 | "success"

function Feedback({
  message,
  tone = "error",
}: {
  message: string
  tone?: "error" | "success" | "info"
}) {
  return (
    <div
      className={cn(
        "feedback-message",
        tone === "error" && "feedback-message-error",
        tone === "success" && "feedback-message-success",
        tone === "info" && "border border-amber-500/20 bg-amber-500/5 text-amber-700"
      )}
    >
      {tone === "success" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : tone === "info" ? (
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  )
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const activeIndex = currentStep === "success" ? 3 : currentStep
  const steps = [
    { id: 1, label: "Email" },
    { id: 2, label: "Verify OTP" },
    { id: 3, label: "New Password" },
  ]

  return (
    <div className="mb-9 flex items-start">
      {steps.map((step, index) => {
        const done = activeIndex > step.id
        const active = activeIndex === step.id

        return (
          <div key={step.id} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "grid h-[34px] w-[34px] place-items-center rounded-full border-2 text-[13px] font-bold transition-all",
                  done && "border-brown-800 bg-brown-800 text-white",
                  active && "border-amber-500 bg-amber-500 text-brown-900 shadow-[0_0_0_4px_rgba(232,160,32,0.15)]",
                  !done && !active && "border-brown-100 bg-white text-muted-foreground"
                )}
              >
                {done ? "✓" : step.id}
              </div>
              <div
                className={cn(
                  "text-center text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
                  active && "text-amber-700",
                  done && "text-brown-800"
                )}
              >
                {step.label}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className={cn("mt-4 h-0.5 flex-1 bg-brown-100", activeIndex > step.id && "bg-brown-800")} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ForgotPasswordPage() {
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState("")
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits])

  useEffect(() => {
    if (step === 2) {
      otpRefs.current[0]?.focus()
    }
  }, [step])

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = window.setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendCooldown])

  const startResendCooldown = () => setResendCooldown(30)

  const requestOtp = async () => {
    await api.post("/auth/request-password-reset", { email })
    setStep(2)
    setMessage({
      tone: "info",
      text: `A 6-digit verification code has been sent to ${email}. It expires in 10 minutes.`,
    })
    startResendCooldown()
  }

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await requestOtp()
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: error.message || "Unable to start password recovery right now.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (loading || resendCooldown > 0) return

    setLoading(true)
    setMessage(null)

    try {
      await requestOtp()
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: error.message || "Unable to resend the verification code.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "").slice(-1)

    setOtpDigits((current) => {
      const next = [...current]
      next[index] = value
      return next
    })

    if (value && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("")
    if (!pastedDigits.length) return

    setOtpDigits((current) => current.map((_, index) => pastedDigits[index] || ""))
    otpRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus()
  }

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    if (otpValue.length !== 6) {
      setMessage({ tone: "error", text: "Enter the full 6-digit verification code." })
      setLoading(false)
      return
    }

    try {
      await api.post("/auth/verify-reset-otp", { email, otp: otpValue })
      setStep(3)
      setMessage(null)
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: error.message || "Invalid OTP. Please check the code and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    if (newPassword !== confirmPassword) {
      setMessage({ tone: "error", text: "Passwords do not match." })
      setLoading(false)
      return
    }

    const passwordError = validateStrongPassword(newPassword)
    if (passwordError) {
      setMessage({ tone: "error", text: passwordError })
      setLoading(false)
      return
    }

    try {
      await api.post("/auth/reset-password", {
        email,
        otp: otpValue,
        newPassword,
      })

      setStep("success")
      setMessage(null)
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: error.message || "Unable to reset your password right now.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brown-50 text-foreground lg:grid lg:grid-cols-[1fr_1fr]">
      <AuthBrandPanel
        eyebrow="Secure Account Recovery"
        title={
          <>
            Back in minutes,
            <br />
            <span className="text-amber-500 italic">not days</span>
          </>
        }
        description="A 6-digit OTP will be sent to your registered email. The entire reset process takes under two minutes and your data stays protected throughout."
        bottom={
          <div className="space-y-3 rounded-2xl border border-white/9 bg-white/5 p-5">
            {[
              {
                icon: "🔐",
                title: "OTP expires in 10 minutes",
                description: "Each code is single-use and automatically invalidated after use or expiry.",
              },
              {
                icon: "📧",
                title: "Sent only to your registered email",
                description: "If you don't receive it, check your spam folder or contact the T&P office.",
              },
              {
                icon: "🛡️",
                title: "No password is ever sent by email",
                description: "We only send a code. Your new password is set directly on this page.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg bg-amber-500/12 text-[15px]">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white/75">{item.title}</div>
                  <div className="text-[12px] leading-[1.5] text-white/40">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        }
      />

      <main className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-brown-50 px-6 py-10 md:px-10 lg:px-[5vw]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 w-full max-w-[400px]">
          {step !== "success" && <StepIndicator currentStep={step} />}

          {step === 1 && (
            <section>
              <div className="mb-7">
                <h2 className="mb-1 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
                  Forgot your
                  <br />
                  <span className="text-amber-700 italic">password?</span>
                </h2>
                <p className="text-sm font-light leading-[1.65] text-muted-foreground">
                  Enter the email address registered with your GL Bajaj T&amp;P account and we&apos;ll send you a verification code.
                </p>
              </div>

              {message && <div className="mb-4"><Feedback message={message.text} tone={message.tone} /></div>}

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="auth-label mb-1.5 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                      className="auth-input pl-11"
                      required
                    />
                  </div>
                  <p className="pt-1 text-[11.5px] text-muted-foreground">Use the email address your account was registered with.</p>
                </div>

                <Button type="submit" className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending verification code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>

              <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-brown-800">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </section>
          )}

          {step === 2 && (
            <section>
              <div className="mb-7">
                <h2 className="mb-1 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
                  Check your
                  <br />
                  <span className="text-amber-700 italic">email</span>
                </h2>
                <p className="text-sm font-light leading-[1.65] text-muted-foreground">
                  We sent a 6-digit code to <strong className="font-semibold text-brown-800">{email}</strong>. Enter it below. The code expires in 10 minutes.
                </p>
              </div>

              {message && <div className="mb-4"><Feedback message={message.text} tone={message.tone} /></div>}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="flex justify-center gap-2.5">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        otpRefs.current[index] = node
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleOtpChange(index, event.target.value)}
                      onKeyDown={(event) => handleOtpKeyDown(event, index)}
                      onPaste={handleOtpPaste}
                      className="h-14 w-12 rounded-[10px] border border-brown-100 bg-white text-center font-display text-[26px] font-bold text-brown-900 outline-none transition-all focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(232,160,32,0.15)]"
                    />
                  ))}
                </div>

                <Button type="submit" className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying code...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between text-[12.5px]">
                <span className="text-muted-foreground">Didn&apos;t receive it?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0}
                  className="font-semibold text-amber-700 transition-colors hover:text-brown-800 disabled:cursor-not-allowed disabled:text-muted-foreground"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setMessage(null)
                  setOtpDigits(["", "", "", "", "", ""])
                }}
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-brown-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Change email address
              </button>
            </section>
          )}

          {step === 3 && (
            <section>
              <div className="mb-7">
                <h2 className="mb-1 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
                  Set your new
                  <br />
                  <span className="text-amber-700 italic">password</span>
                </h2>
                <p className="text-sm font-light leading-[1.65] text-muted-foreground">
                  Choose a strong password you haven&apos;t used before. You&apos;ll be redirected to login once it&apos;s saved.
                </p>
              </div>

              {message && <div className="mb-4"><Feedback message={message.text} tone={message.tone} /></div>}

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <Label htmlFor="newPassword" className="auth-label mb-1.5 block">
                    New Password
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-5 z-10 text-brown-400">
                      <LockKeyhole className="h-4 w-4" />
                    </span>
                    <PasswordInput
                      id="newPassword"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Min. 8 characters"
                      className="auth-input pl-11"
                      showStrength
                      required
                    />
                  </div>
                  <p className="pt-1 text-[11.5px] text-muted-foreground">Must be at least 8 characters with uppercase, lowercase, number, and special character.</p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="auth-label mb-1.5 block">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-brown-400">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat your password"
                      className="auth-input pl-11"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </section>
          )}

          {step === "success" && (
            <section className="py-4 text-center">
              <div className="mx-auto mb-6 grid h-[72px] w-[72px] place-items-center rounded-full border-2 border-emerald-500/30 bg-emerald-500/10 text-[30px] text-emerald-600">
                ✓
              </div>
              <h2 className="mb-3 font-display text-[32px] font-bold text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
                Password updated
              </h2>
              <p className="mb-7 text-sm leading-[1.7] text-muted-foreground">
                Your password has been updated successfully.
                <br />
                You can now sign in with your <strong className="font-semibold text-brown-800">new password</strong>.
              </p>
              <Button asChild className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700">
                <Link href="/login">Back to Login</Link>
              </Button>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
