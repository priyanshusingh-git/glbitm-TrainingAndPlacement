"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole, Mail, MoveRight } from "lucide-react"
import { auth } from "@/lib/firebase"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel"

type Role = "STUDENT" | "STAFF" | "TRAINER" | "COMPANY"

const ROLE_CONFIG: Record<
  Role,
  {
    icon: string
    label: string
    context: string
    hint: string
    emailLabel: string
    emailPlaceholder: string
  }
> = {
  STUDENT: {
    icon: "🎓",
    label: "Student",
    context: "Sign in with your institutional email and password.",
    hint: "Use your institutional or registered email address.",
    emailLabel: "Institutional Email",
    emailPlaceholder: "student@glbitm.ac.in",
  },
  STAFF: {
    icon: "🛠",
    label: "T&P Admin",
    context: "Access admin controls, analytics, and drive operations.",
    hint: "Use your staff email registered on the portal.",
    emailLabel: "Official Email",
    emailPlaceholder: "staff@glbitm.ac.in",
  },
  TRAINER: {
    icon: "📚",
    label: "CDC Trainer",
    context: "Manage training groups, attendance, and assessments.",
    hint: "Use the trainer email mapped to your account.",
    emailLabel: "Trainer Email",
    emailPlaceholder: "trainer@glbitm.ac.in",
  },
  COMPANY: {
    icon: "🏢",
    label: "Recruiter",
    context: "Manage recruiter-facing access with your registered company email.",
    hint: "Use the recruiter email approved by the T&P office.",
    emailLabel: "Recruiter Email",
    emailPlaceholder: "hr@company.com",
  },
}

const BRAND_STATS = [
  { value: "92%", label: "Placement Rate" },
  { value: "600+", label: "Companies" },
  { value: "₹58L", label: "Highest CTC" },
]

function Feedback({ message, success = false }: { message: string; success?: boolean }) {
  return (
    <div className={cn("feedback-message", success ? "feedback-message-success" : "feedback-message-error")}>
      {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{message}</span>
    </div>
  )
}

function getDashboardPath(role?: string) {
  if (role === "STUDENT") return "/student"
  if (role === "ADMIN" || role === "STAFF") return "/admin"
  if (role === "TRAINER") return "/trainer"
  return "/"
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading, user } = useAuth()

  const [role, setRole] = useState<Role>("STUDENT")
  const [rememberMe, setRememberMe] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const activeRole = ROLE_CONFIG[role]

  useEffect(() => {
    if (!isAuthenticated || isLoading || !user) return

    if (user.mustChangePassword) {
      router.replace("/change-password")
      return
    }

    const requestedPath = searchParams.get("redirect")
    router.replace(requestedPath || getDashboardPath(user.role))
  }, [isAuthenticated, isLoading, router, searchParams, user])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      setSuccess("Login successful! Redirecting to your dashboard...")

      if (!rememberMe && typeof window !== "undefined") {
        sessionStorage.removeItem("token")
      }
    } catch (err: any) {
      if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized in Firebase. Please add your deployment URL to Authorized Domains.")
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid credentials. Please check your email and password.")
      } else {
        setError(err.message || "Unable to sign in right now. Please try again.")
      }
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brown-50 text-foreground lg:grid lg:grid-cols-[1fr_1fr]">
      <AuthBrandPanel
        eyebrow="Placement Season 2024–25 is Live"
        title={
          <>
            Your Career
            <br />
            Journey Starts
            <br />
            <span className="text-amber-500 italic">Right Here.</span>
          </>
        }
        description="One portal for students, trainers, recruiters and administrators — everything you need to track, train, and place."
        bottom={
          <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-[14px]">
            {BRAND_STATS.map((stat, index) => (
              <div key={stat.label} className={cn("border border-white/8 bg-white/5 px-4 py-[18px] text-center", index === 0 && "rounded-l-[14px]", index === BRAND_STATS.length - 1 && "rounded-r-[14px]")}>
                <div className="font-display text-[32px] font-bold leading-none text-amber-500">{stat.value}</div>
                <div className="mt-1.5 text-[11px] text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        }
      />

      <main className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-brown-50 px-6 py-12 md:px-10 lg:px-[5vw]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="mb-1 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
              Welcome <span className="text-amber-700 italic">back</span>
            </h2>
            <p className="text-[14.5px] font-light text-muted-foreground">Select your role and sign in to your portal</p>
          </div>

          <div className="mb-5 grid grid-cols-4 gap-2 max-[420px]:grid-cols-2">
            {(Object.keys(ROLE_CONFIG) as Role[]).map((roleId) => {
              const config = ROLE_CONFIG[roleId]
              const isActive = role === roleId

              return (
                <button
                  key={roleId}
                  type="button"
                  onClick={() => setRole(roleId)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-[10px] border border-brown-800/15 bg-white px-2 py-3 transition-all duration-200",
                    !isActive && "hover:border-brown-800/35 hover:bg-brown-100",
                    isActive && "border-brown-800 bg-brown-800 shadow-lg shadow-brown-900/10 hover:border-brown-800 hover:bg-brown-800",
                  )}
                >
                  <div
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-[9px] bg-brown-100 text-lg transition-colors",
                      isActive && "bg-white/15"
                    )}
                  >
                    {config.icon}
                  </div>
                  <span className={cn("text-center text-[10.5px] font-semibold leading-[1.3] text-muted-foreground", isActive && "text-white/85")}>
                    {config.label}
                  </span>
                  {isActive && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-500" />}
                </button>
              )
            })}
          </div>

          <div className="mb-5 flex items-center gap-2.5 rounded-lg border border-amber-500/30 bg-amber-100 px-4 py-2.5 text-[13px] text-brown-800">
            <div className="text-lg">{activeRole.icon}</div>
            <p className="font-medium">
              {activeRole.context}
            </p>
          </div>

          {error && <div className="mb-4"><Feedback message={error} /></div>}
          {success && <div className="mb-4"><Feedback message={success} success /></div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <Label htmlFor="email" className="auth-label mb-1.5 block">
                {activeRole.emailLabel}
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-400">
                  <Mail className="h-4 w-4" />
                </span>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={activeRole.emailPlaceholder}
                  className="auth-input pl-11"
                />
              </div>
              <p className="pl-0.5 pt-1 text-[11.5px] text-muted-foreground">{activeRole.hint}</p>
            </div>

            <div className="mb-4">
              <Label htmlFor="password" className="auth-label mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-brown-400">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="auth-input pl-11"
                />
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-brown-800"
                />
                <span>Remember me</span>
              </label>

              <Link href="/forgot-password" className="text-[13px] font-semibold text-brown-800 transition-colors hover:text-amber-700">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full bg-brown-800 text-brown-50 hover:bg-brown-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In Securely</span>
                  <MoveRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 text-center text-[13px] text-muted-foreground">
            Need help accessing the portal?{" "}
            <a href="mailto:tnp@glbitm.org" className="font-semibold text-brown-800 transition-colors hover:text-amber-700">
              Contact T&amp;P support
            </a>
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
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
