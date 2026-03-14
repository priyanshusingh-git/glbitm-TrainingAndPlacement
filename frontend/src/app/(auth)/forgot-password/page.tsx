"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, RefreshCw, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { AuthShell } from "@/components/layout/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { forgotPasswordContent } from "@/data/auth"

function Feedback({ message, success = false }: { message: string; success?: boolean }) {
  return (
    <div
      className={`flex items-start gap-4 rounded-md border p-4 text-sm font-medium transition-base ${
        success ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600" : "border-red-500/20 bg-red-500/5 text-red-600"
      }`}
    >
      {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{message}</span>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "success">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [captchaAnswer, setCaptchaAnswer] = useState("")

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1)
    setNum2(Math.floor(Math.random() * 10) + 1)
    setCaptchaAnswer("")
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (parseInt(captchaAnswer, 10) !== num1 + num2) {
      setError("Security check failed. Please verify the sum.")
      setLoading(false)
      generateCaptcha()
      return
    }

    try {
      await api.post("/auth/request-password-reset", { email })
      setStep("success")
    } catch (err: any) {
      setError(err.message || "Reset request failed. Please valid email or try again later.")
      generateCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={step === "email" ? forgotPasswordContent.title : forgotPasswordContent.successTitle}
      description={
        step === "email"
          ? forgotPasswordContent.description
          : forgotPasswordContent.successDescription(email)
      }
    >
      {step === "email" ? (
        <form onSubmit={handleRequestReset} className="space-y-8">
          {error && <Feedback message={error} />}

          <div className="space-y-2 pl-1">
            <Label htmlFor="email" className="text-[10px] font-bold text-brown-900 uppercase tracking-widest">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="id@glbitm.org"
              className="h-14 bg-white/50 border-border focus:bg-white focus:border-amber-500 transition-base rounded-md font-medium"
              required
            />
          </div>

          <div className="space-y-2 pl-1">
            <Label htmlFor="captcha" className="text-[10px] font-bold text-brown-900 uppercase tracking-widest">Security check</Label>
            <div className="grid gap-3 grid-cols-[1fr_100px_56px]">
              <div className="flex h-14 items-center justify-center rounded-md border border-border bg-brown-900 text-amber-500 text-lg font-display font-bold">
                {num1} + {num2}
              </div>
              <Input
                id="captcha"
                type="number"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="?"
                className="h-14 text-center bg-white border-border focus:border-amber-500 focus:ring-amber-500 transition-base rounded-md font-bold text-xl"
                required
              />
              <Button type="button" variant="outline" className="h-14 w-14 border-border hover:bg-primary/10 hover:text-primary transition-base rounded-md" onClick={generateCaptcha}>
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="btn-primary h-14 w-full text-sm font-bold uppercase tracking-widest" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <Feedback message={`Verification link sent to ${email}. Please check your spam folder if not found.`} success />
          <Button asChild className="btn-primary h-14 w-full uppercase tracking-widest">
            <Link href="/login">Back to Sign In</Link>
          </Button>
          <button type="button" className="w-full text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] hover:text-amber-500 transition-base" onClick={() => setStep("email")}>
            Try another email address
          </button>
        </div>
      )}
    </AuthShell>
  )
}
