"use client"

import { Suspense, useCallback, useEffect, useRef, useState } from "react"
import NextImage from "next/image"
import HCaptcha from "@hcaptcha/react-hcaptcha"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole, Mail, MoveRight, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { api, getCsrfState } from "@/lib/api"
import { consumeSessionExpiredFlag, getAuthErrorMessage } from "@/lib/auth-ui-messages"
import { generateDeviceFingerprint } from "@/lib/fingerprint"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel"
import { MobileAuthHeader } from "@/components/layout/mobile-auth-header"
import { authBrandContent, authBrandStats } from "@/data/auth"

// ── Helpers ─────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

function Feedback({ message, success = false }: { message: string; success?: boolean }) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-md border p-4 text-[14px] leading-snug animate-fade-in shadow-sm",
      success 
        ? "border-emerald-100 bg-emerald-50/50 text-emerald-800 shadow-emerald-500/5" 
        : "border-red-100 bg-red-50/50 text-red-800 shadow-red-500/5"
    )}>
      {success ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
      )}
      <div className="flex-1 font-medium">{message}</div>
    </div>
  )
}

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null
  return <p className="mt-1 text-[12px] font-medium text-red-500 animate-fade-in duration-200">{message}</p>
}

function getDashboardPath(role?: string) {
  if (role === "STUDENT") return "/student"
  if (role === "ADMIN") return "/admin"
  if (role === "TRAINER") return "/trainer"
  if (role === "RECRUITER") return "/recruiter"
  return "/"
}

// ── Main Component ──────────────────────────────────
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, user, login } = useAuth()
  const captchaRef = useRef<any>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  // Form state
  const [rememberMe, setRememberMe] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("") // honeypot
  const [fingerprint, setFingerprint] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [captchaToken, setCaptchaToken] = useState("")
  const [captchaKey, setCaptchaKey] = useState(0)

  // Pre-fill email from query param on mount
  useEffect(() => {
    const emailParam = searchParams.get("email") || searchParams.get("e")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ code?: string; message: string } | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ success: boolean; text: string } | null>(null)
  const [shaking, setShaking] = useState(false)

  // Field-level validation (shown on blur and on submit)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

  // ── Field validation ──────────────────────────────
  const validateEmail = useCallback((value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return "Email address is required."
    if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address."
    return undefined
  }, [])

  const validatePassword = useCallback((value: string) => {
    if (!value) return "Password is required."
    if (value.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    return undefined
  }, [])

  const handleEmailBlur = () => {
    // Only mark as touched and show error if the user has actually interacted/typed something.
    // If they just clicked in and out without typing, we don't "shame" them with a required message.
    if (email.trim().length > 0) {
      setTouched((prev) => ({ ...prev, email: true }))
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
    }
  }

  const handlePasswordBlur = () => {
    if (password.length > 0) {
      setTouched((prev) => ({ ...prev, password: true }))
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }))
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }))
    }
    setError(null)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      setFieldErrors((prev) => ({ ...prev, password: validatePassword(value) }))
    }
    setError(null)
  }

  const handleEmailKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      const emailErr = validateEmail(email)
      setTouched((prev) => ({ ...prev, email: true }))
      setFieldErrors((prev) => ({ ...prev, email: emailErr }))
      if (emailErr) return
      passwordRef.current?.focus()
    }
  }

  const triggerShake = useCallback(() => {
    setShaking(true)
    const timer = window.setTimeout(() => setShaking(false), 400)
    return () => window.clearTimeout(timer)
  }, [])

  // ── Redirects ─────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || isLoading || !user) return
    if (user.mustChangePassword) {
      router.replace("/change-password")
      return
    }
    const requestedPath = searchParams.get("redirect")
    router.replace(requestedPath || getDashboardPath(user.role))
  }, [isAuthenticated, isLoading, router, searchParams, user])

  // ── Security bootstrap ────────────────────────────
  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setError({ message: "Your session has expired. Please sign in again." })
    }

    let active = true
    const bootstrapSecurity = async () => {
      try {
        const [deviceFingerprint, csrfState] = await Promise.all([
          generateDeviceFingerprint(),
          getCsrfState(true),
        ])
        if (!active) return
        setFingerprint(deviceFingerprint)
        setCsrfToken(csrfState.csrfToken)
        setCaptchaRequired(Boolean(csrfState.captchaRequired))
      } catch {
        if (!active) return
        setCaptchaRequired(false)
      }
    }
    void bootstrapSecurity()
    return () => { active = false }
  }, [])

  // ── Submit ────────────────────────────────────────
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading || success) return

    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    setTouched({ email: true, password: true })
    setFieldErrors({ email: emailErr, password: passwordErr })

    if (emailErr || passwordErr) {
      if (emailErr) emailRef.current?.focus()
      else passwordRef.current?.focus()
      triggerShake()
      return
    }

    if (captchaRequired && hcaptchaSiteKey && !captchaToken) {
      setError({ message: "Please complete the security challenge before signing in." })
      triggerShake()
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setResendMessage(null)

    try {
      const response = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
        username,
        fingerprint,
        csrfToken,
        hcaptchaToken: captchaToken || undefined,
      }, { skipRedirect: true })
      login(response.user)
      setSuccess("Login successful! Redirecting to your dashboard…")
      const requestedPath = searchParams.get("redirect")
      router.replace(response.redirectUrl || requestedPath || getDashboardPath(response.user.role))
    } catch (err: any) {
      const nextCaptchaRequired = Boolean(err.captchaRequired || err.code === "CAPTCHA_REQUIRED")
      if (nextCaptchaRequired) {
        setCaptchaRequired(true)
        setCaptchaToken("")
        setCaptchaKey((current) => current + 1)
        captchaRef.current?.resetCaptcha()
      }
      if (err.code === "CSRF_INVALID") {
        try {
          const nextCsrfState = await getCsrfState(true)
          setCsrfToken(nextCsrfState.csrfToken)
          setCaptchaRequired(Boolean(nextCsrfState.captchaRequired) || nextCaptchaRequired)
        } catch {}
      }
      setError({ code: err.code, message: getAuthErrorMessage(err, { flow: "login" }) })
      setSuccess(null)
      triggerShake()
      emailRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendInduction = async () => {
    if (!email || validateEmail(email)) {
      setTouched((prev) => ({ ...prev, email: true }))
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))
      return
    }

    setResendLoading(true)
    setResendMessage(null)

    try {
      const response = await api.post("/auth/resend-induction", { email })
      setResendMessage({ success: true, text: response.message })
    } catch (err: any) {
      setResendMessage({ 
        success: false, 
        text: getAuthErrorMessage(err, { flow: "forgot-password" }) 
      })
    } finally {
      setResendLoading(false)
    }
  }

  const isFormFilled = EMAIL_REGEX.test(email.trim()) && password.length >= MIN_PASSWORD_LENGTH

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-brown-50 text-foreground lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[1fr_1fr] lg:overflow-hidden font-sans">
      <AuthBrandPanel
        {...authBrandContent}
        bottom={
          <div className="flex gap-4 p-1.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-xl">
            {authBrandStats.map((stat) => (
              <div key={stat.label} className="flex-1 py-4 text-center rounded-md transition-colors hover:bg-white/5">
                <div className="font-display text-[26px] font-bold leading-none text-amber-500">{stat.value}</div>
                <div className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        }
      />

      <main className="relative min-h-[100svh] overflow-hidden bg-brown-50 px-6 md:px-10 lg:h-full lg:min-h-0 lg:px-[6vw]">
        {/* Background Accents */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.06)_0%,transparent_70%)]" />
        <div className="absolute top-[20%] right-8 h-px w-32 bg-gradient-to-l from-brown-200 to-transparent opacity-40" />

        <div className="relative z-10 flex min-h-[100svh] w-full items-center justify-center overflow-x-hidden overflow-y-auto py-12 lg:h-full lg:min-h-0 lg:py-6">
          <div className="w-full max-w-[380px]">
            <MobileAuthHeader />

            {/* ── Heading ── */}
            <div className="mb-8 animate-fade-up stagger-1 lg:mt-0">
            <h2 className="mb-2 font-display text-[48px] font-bold leading-[1.05] tracking-tight text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
              Welcome <span className="text-amber-700 italic">back</span>
            </h2>
            <p className="text-[15px] font-medium text-muted-foreground/80 leading-relaxed">
              Sign in with your registered email to continue to your placement dashboard.
            </p>
          </div>

          {/* API Notifications (Self-collapsing) */}
          <div className={cn("overflow-hidden transition-all duration-300", error || success ? "mb-6 opacity-100" : "h-0 mb-0 opacity-0")}>
            {error && error.message && (
              <div className="space-y-3">
                <Feedback message={error.message} />
                {error.code === "INDUCTION_PENDING" && (
                  <button
                    type="button"
                    onClick={handleResendInduction}
                    disabled={resendLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50/30 py-2 text-[12px] font-bold text-red-700 transition-colors hover:bg-red-50/50"
                  >
                    {resendLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Resend Induction Link →"
                    )}
                  </button>
                )}
              </div>
            )}
            {success && success.length > 0 && <Feedback message={success} success />}
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className={cn("space-y-8", shaking && "form-shake")}
          >
            {/* ── Email field ── */}
              <div className="space-y-1.5 animate-fade-up stagger-2">
                <Label htmlFor="email" className="auth-label text-[13px] font-semibold text-brown-800/80">
                  EMAIL ADDRESS
                </Label>
              <div className="relative">
                <span className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300",
                  touched.email && fieldErrors.email ? "text-red-500" : "text-brown-400"
                )}>
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => handleEmailChange(event.target.value)}
                  onBlur={handleEmailBlur}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="name@example.com"
                  className={cn(
                    "auth-input pl-11",
                    touched.email && fieldErrors.email && "input-error"
                  )}
                  aria-invalid={touched.email && !!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                />
              </div>
              <div id="email-error" aria-live="polite">
                <FieldError message={touched.email ? fieldErrors.email : null} />
              </div>
            </div>

            {/* ── Password field ── */}
              <div className="space-y-1.5 animate-fade-up stagger-3">
                <Label htmlFor="password" className="auth-label text-[13px] font-semibold text-brown-800/80">
                  PASSWORD
                </Label>
              <div className="relative">
                <span className={cn(
                  "pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-colors duration-300",
                  touched.password && fieldErrors.password ? "text-red-500" : "text-brown-400"
                )}>
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <PasswordInput
                  ref={passwordRef}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => handlePasswordChange(event.target.value)}
                  onBlur={handlePasswordBlur}
                  placeholder="Enter your security password"
                  className={cn(
                    "auth-input pl-11",
                    touched.password && fieldErrors.password && "input-error"
                  )}
                  aria-invalid={touched.password && !!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
              </div>
              <div id="password-error" aria-live="polite">
                <FieldError message={touched.password ? fieldErrors.password : null} />
              </div>
            </div>

            {/* ── Secondary Controls ── */}
            <div className="flex items-center justify-between animate-fade-up stagger-4">
              <label className="flex cursor-pointer items-center gap-2.5 group">
                <div className="relative flex h-4.5 w-4.5 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="peer appearance-none h-4.5 w-4.5 cursor-pointer rounded border border-brown-200 bg-white shadow-sm transition-all checked:bg-brown-800 checked:border-brown-800 focus:outline-none"
                  />
                  <ShieldCheck className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-[13px] font-medium text-muted-foreground group-hover:text-brown-900 transition-colors">Remember device</span>
              </label>

              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-[13px] font-bold text-brown-800 transition-all hover:text-amber-700 hover:tracking-tight"
                tabIndex={0}
              >
                Reset Access
              </Link>
            </div>

            {/* ── Resend Feedback ── */}
            {resendMessage && resendMessage.text && (
              <div className="mb-6 animate-fade-in shadow-sm rounded-lg">
                <Feedback message={resendMessage.text} success={resendMessage.success} />
              </div>
            )}

            {/* ── Captcha ── */}
            {captchaRequired && hcaptchaSiteKey ? (
              <div className="mb-6 flex justify-center animate-fade-in stagger-5">
                <HCaptcha
                  key={captchaKey}
                  ref={captchaRef}
                  sitekey={hcaptchaSiteKey}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken("")}
                  onError={() => setCaptchaToken("")}
                />
              </div>
            ) : null}

            {/* ── Submit button ── */}
            <Button
              type="submit"
              size="lg"
              className={cn(
                "group relative w-full h-[54px] rounded-md overflow-hidden font-bold transition-all duration-400 active:scale-[0.98] animate-fade-up stagger-5",
                success
                  ? "bg-emerald-600 text-white"
                  : isFormFilled
                    ? "bg-brown-900 text-brown-50 hover:bg-brown-800 shadow-lg shadow-amber-900/15 hover:shadow-amber-500/20 hover:-translate-y-0.5"
                    : "bg-brown-100/50 text-brown-400 border border-brown-200/60 cursor-not-allowed shadow-none"
              )}
              disabled={loading || !!success || (captchaRequired && !!hcaptchaSiteKey && !captchaToken) || !isFormFilled}
            >
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {success ? (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    <span>Access Granted</span>
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Authorizing…</span>
                  </>
                ) : (
                  <>
                    <span>Enter Portal Securely</span>
                    <MoveRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </div>
              {isFormFilled && !loading && !success && (
                <div className="absolute inset-0 bg-shimmer opacity-20 pointer-events-none" />
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-[13px] font-medium text-muted-foreground/60 animate-fade-up stagger-6">
            Authorized access only.{" "}
            <a href="mailto:tnp@glbitm.org" className="text-brown-800 transition-colors hover:text-amber-700 border-b border-brown-200 hover:border-amber-700 pb-0.5">
              T&amp;P Support Desk
            </a>
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brown-50">
          <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
