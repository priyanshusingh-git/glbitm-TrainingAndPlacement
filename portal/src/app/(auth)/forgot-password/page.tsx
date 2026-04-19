"use client"

import Link from "next/link"
import NextImage from "next/image"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, ArrowLeft, CheckCircle2, Info, Loader2, LockKeyhole, Mail, MoveRight, RefreshCw, ShieldCheck } from "lucide-react"
import { api } from "@/lib/api"
import { getAuthErrorMessage } from "@/lib/auth-ui-messages"
import { validateStrongPassword } from "@/lib/validators"
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel"
import { MobileAuthHeader } from "@/components/layout/mobile-auth-header"
import { forgotPasswordBrandContent } from "@/data/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Small inline hint shown directly below an input field */
function FieldError({ message }: { message?: string | null }) {
  if (!message) return null
  return <p className="mt-1 text-[12px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">{message}</p>
}

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

function ForgotPasswordContent() {
  const searchParams = useSearchParams()
  const otpRefs = useRef<Array<HTMLInputElement | null>>([])

  const [step, setStep] = useState<Step>(1)
  const [email, setEmail] = useState("")

  // Pre-fill email from query param on mount
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: "error" | "success" | "info"; text: string } | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendCount, setResendCount] = useState(0)

  // Field-level validation
  const [emailTouched, setEmailTouched] = useState(false)
  const [emailError, setEmailError] = useState<string | undefined>(undefined)
  const [pwTouched, setPwTouched] = useState({ new: false, confirm: false })
  const [pwErrors, setPwErrors] = useState<{ new?: string; confirm?: string }>({})

  const isEmailValid = EMAIL_REGEX.test(email.trim())

  const validateEmailField = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return "Email address is required."
    if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address."
    return undefined
  }

  const validateNewPw = (value: string) => {
    if (!value) return "New password is required."
    const strongErr = validateStrongPassword(value)
    if (strongErr) return strongErr
    return undefined
  }

  const validateConfirmPw = (pw: string, confirm: string) => {
    if (!confirm) return "Please confirm your password."
    if (pw !== confirm) return "Passwords do not match."
    return undefined
  }

  const handleEmailBlur = () => {
    if (email.trim().length > 0) {
      setEmailTouched(true)
      setEmailError(validateEmailField(email))
    }
  }

  const handlePwBlur = (field: "new" | "confirm") => {
    const value = field === "new" ? newPassword : confirmPassword
    if (value.length > 0) {
      setPwTouched((p) => ({ ...p, [field]: true }))
      const err = field === "new" ? validateNewPw(newPassword) : validateConfirmPw(newPassword, confirmPassword)
      setPwErrors((p) => ({ ...p, [field]: err }))
    }
  }


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

    // Client-side validation first
    const err = validateEmailField(email)
    setEmailTouched(true)
    setEmailError(err)
    if (err) return

    setLoading(true)
    setMessage(null)

    try {
      await requestOtp()
      setResendCount(0)
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: getAuthErrorMessage(error, { flow: "forgot-password" }),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (loading || resendCooldown > 0) return
    if (resendCount >= 3) {
      setMessage({
        tone: "error",
        text: "You have reached the maximum resend attempts for this session.",
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await requestOtp()
      setResendCount((current) => current + 1)
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: getAuthErrorMessage(error, { flow: "forgot-password" }),
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
      const response = await api.post("/auth/verify-reset-otp", { email, otp: otpValue })
      setStep(3)
      setMessage(null)
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: getAuthErrorMessage(error, { flow: "verify-otp" }),
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
        newPassword,
      })

      setStep("success")
      setMessage(null)
    } catch (error: any) {
      setMessage({
        tone: "error",
        text: getAuthErrorMessage(error, { flow: "reset-password" }),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-brown-50 text-foreground lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[1fr_1fr] lg:overflow-hidden">
      <AuthBrandPanel {...forgotPasswordBrandContent} />
<main className="relative min-h-[100svh] overflow-hidden bg-brown-50 px-6 md:px-10 lg:h-full lg:min-h-0 lg:px-[5vw]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 flex min-h-[100svh] w-full items-center justify-center overflow-x-hidden overflow-y-auto py-10 lg:h-full lg:min-h-0 lg:py-6">
        <div className="w-full max-w-[400px]">
          <MobileAuthHeader />

          {/* Header & Step Indicator */}
          <div className="mb-8 animate-fade-up stagger-1 lg:mt-0">
            <h2 className="mb-2 font-display text-[48px] font-bold leading-[1.05] tracking-tight text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
              {step === 3 ? (
                <>Reset <span className="text-amber-700 italic">password</span></>
              ) : (
                <>Recover <span className="text-amber-700 italic">access</span></>
              )}
            </h2>
            <p className="text-[15px] font-medium text-muted-foreground/80 leading-relaxed">
              {step === 1 && "Verify your identity through your registered institutional email."}
              {step === 2 && "Enter the verification code sent to your email address."}
              {step === 3 && "Choose a strong password you haven't used before."}
              {step === "success" && "Your account has been successfully secured."}
            </p>
          </div>

          {step !== "success" && (
            <div className="animate-fade-up stagger-2">
              <StepIndicator currentStep={step} />
            </div>
          )}

          {/* Feedback/Notifications (Self-collapsing) */}
          <div className={cn("overflow-hidden transition-all duration-300", message ? "mb-6 opacity-100" : "h-0 mb-0 opacity-0")}>
            {message && <Feedback message={message.text} tone={message.tone} />}
          </div>

          {step === 1 && (
            <section className="animate-fade-up stagger-3">
              <form onSubmit={handleEmailSubmit} className="space-y-6" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="auth-label text-[13px] font-semibold text-brown-800/80">EMAIL ADDRESS</Label>
                  <div className="relative">
                    <span className={cn(
                      "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors",
                      emailTouched && emailError ? "text-red-400" : "text-brown-400"
                    )}>
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailTouched) setEmailError(validateEmailField(e.target.value))
                      }}
                      onBlur={handleEmailBlur}
                      placeholder="your@email.com"
                      className={cn("auth-input pl-11", emailTouched && emailError && "input-error")}
                      aria-invalid={emailTouched && !!emailError}
                    />
                  </div>
                  <FieldError message={emailTouched ? emailError : null} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "group relative w-full h-[54px] rounded-md overflow-hidden font-bold transition-all duration-400 active:scale-[0.98]",
                    isEmailValid
                      ? "bg-brown-900 text-brown-50 hover:bg-brown-800 shadow-lg shadow-amber-900/15 hover:shadow-amber-500/20 hover:-translate-y-0.5"
                      : "bg-brown-100/50 text-brown-400 border border-brown-200/60 cursor-not-allowed shadow-none"
                  )}
                  disabled={loading || !isEmailValid}
                >
                  {loading ? (
                    <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Sending…</span></div>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <MoveRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              <Link 
                href={email ? `/login?email=${encodeURIComponent(email)}` : "/login"} 
                className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-brown-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </section>
          )}

          {step === 2 && (
            <section className="animate-fade-up stagger-3">
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-2.5">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => { otpRefs.current[index] = node }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={handleOtpPaste}
                      className="h-14 w-12 rounded-[10px] border border-brown-100 bg-white text-center font-display text-[26px] font-bold text-brown-900 outline-none transition-all focus:border-amber-500 focus:shadow-[0_0_0_3px_rgba(232,160,32,0.15)]"
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "group relative w-full h-[54px] rounded-md overflow-hidden font-bold transition-all duration-400 active:scale-[0.98]",
                    otpValue.length === 6
                      ? "bg-brown-900 text-brown-50 hover:bg-brown-800 shadow-lg shadow-amber-900/15 hover:shadow-amber-500/20 hover:-translate-y-0.5"
                      : "bg-brown-100/50 text-brown-400 border border-brown-200/60 cursor-not-allowed shadow-none"
                  )}
                  disabled={loading || otpValue.length !== 6}
                >
                  {loading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying…</span></div> : (
                    <>
                      <span>Verify Code</span>
                      <MoveRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Didn&apos;t receive it?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendCooldown > 0 || resendCount >= 3}
                  className="font-semibold text-amber-700 transition-colors hover:text-brown-800 disabled:opacity-50"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="animate-fade-up stagger-3">
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-1.5">
                  <Label className="auth-label text-[13px] font-semibold text-brown-800/80">NEW PASSWORD</Label>
                  <PasswordInput
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (pwTouched.new) setPwErrors(p => ({ ...p, new: validateNewPw(e.target.value) }))
                    }}
                    onBlur={() => handlePwBlur("new")}
                    showStrength
                    showBreachCheck
                    className={cn("auth-input", pwTouched.new && pwErrors.new && "input-error")}
                  />
                  <FieldError message={pwTouched.new ? pwErrors.new : null} />
                </div>

                <div className="space-y-1.5">
                  <Label className="auth-label text-[13px] font-semibold text-brown-800/80">CONFIRM PASSWORD</Label>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (pwTouched.confirm) setPwErrors(p => ({ ...p, confirm: validateConfirmPw(newPassword, e.target.value) }))
                    }}
                    onBlur={() => handlePwBlur("confirm")}
                    className={cn("auth-input", pwTouched.confirm && pwErrors.confirm && "input-error")}
                  />
                  <FieldError message={pwTouched.confirm ? pwErrors.confirm : null} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={cn(
                    "group relative w-full h-[54px] rounded-md overflow-hidden font-bold transition-all duration-400 active:scale-[0.98]",
                    (newPassword && confirmPassword && !pwErrors.new && !pwErrors.confirm)
                      ? "bg-brown-900 text-brown-50 hover:bg-brown-800 shadow-lg shadow-amber-900/15 hover:shadow-amber-500/20 hover:-translate-y-0.5"
                      : "bg-brown-100/50 text-brown-400 border border-brown-200/60 cursor-not-allowed shadow-none"
                  )}
                  disabled={loading}
                >
                  {loading ? <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Saving…</span></div> : (
                    <>
                      <span>Set New Password</span>
                      <MoveRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </section>
          )}

          {step === "success" && (
            <section className="text-center animate-fade-up stagger-3">
              <div className="mb-6 flex justify-center text-emerald-600">
                <div className="rounded-full bg-emerald-50 p-4">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>
              <h2 className="mb-3 font-display text-[32px] font-bold text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
                Password updated
              </h2>
              <p className="mb-7 text-[15px] leading-relaxed text-muted-foreground">
                Your password has been updated successfully.
                <br />
                You can now sign in with your new credentials.
              </p>
              <Button asChild className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700 shadow-lg active:scale-[0.98] h-[54px] rounded-md font-bold transition-all">
                <Link href="/login">Return to Login</Link>
              </Button>
            </section>
          )}
        </div>
        </div>
      </main>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brown-50">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  )
}
