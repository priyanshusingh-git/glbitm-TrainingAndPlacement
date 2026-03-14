"use client"

import { Suspense, useEffect, useState } from"react"
import Link from"next/link"
import { useSearchParams } from"next/navigation"
import { AlertCircle, CheckCircle2, ArrowRight } from"lucide-react"
import { api } from"@/lib/api"
import { validateStrongPassword } from"@/lib/validators"
import { AuthShell } from"@/components/layout/auth-shell"
import { Button } from"@/components/ui/button"
import { Label } from"@/components/ui/label"
import { PasswordInput } from"@/components/ui/password-input"
import { Spinner } from"@/components/ui/spinner"

function Feedback({ message, success = false }: { message: string; success?: boolean }) {
 return (
 <div
 className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
 success ?"border-emerald-200 bg-emerald-50 text-emerald-700" :"border-destructive/20 bg-destructive/5 text-destructive"
 }`}
 >
 {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
 <span>{message}</span>
 </div>
 )
}

function ResetPasswordContent() {
 const searchParams = useSearchParams()
 const token = searchParams.get("token")

 const [status, setStatus] = useState<"form" |"success">("form")
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [newPassword, setNewPassword] = useState("")
 const [confirmPassword, setConfirmPassword] = useState("")

 useEffect(() => {
 if (!token) setError("Invalid or missing reset token.")
 }, [token])

 const handleResetPassword = async (e: React.FormEvent) => {
 e.preventDefault()
 setLoading(true)
 setError(null)

 if (!token) {
 setError("Missing reset token.")
 setLoading(false)
 return
 }

 if (newPassword !== confirmPassword) {
 setError("Passwords do not match.")
 setLoading(false)
 return
 }

 const passwordError = validateStrongPassword(newPassword)
 if (passwordError) {
 setError(passwordError)
 setLoading(false)
 return
 }

 try {
 await api.post("/auth/reset-password", { token, newPassword })
 setStatus("success")
 } catch (err: any) {
 setError(err.message ||"Failed to reset password. The link may have expired.")
 } finally {
 setLoading(false)
 }
 }

 if (!token) {
 return (
 <AuthShell title="Invalid reset link" description="This password reset link is missing or has already expired.">
 <div className="space-y-4">
 {error && <Feedback message={error} />}
 <Button asChild className="h-11 w-full">
 <Link href="/forgot-password">Request a new link</Link>
 </Button>
 </div>
 </AuthShell>
 )
 }

 return (
 <AuthShell
 title={status ==="success" ?"Password updated" :"Reset password"}
 description={
 status ==="success"
 ?"Your password has been updated successfully. Continue to sign in with the new credentials."
 :"Create a new password that meets the platform security requirements."
 }
 >
 {status ==="form" ? (
 <form onSubmit={handleResetPassword} className="space-y-5">
 {error && <Feedback message={error} />}

 <div className="space-y-2">
 <Label htmlFor="newPassword">New password</Label>
 <PasswordInput
 id="newPassword"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 placeholder="Create a strong password"
 required
 showStrength
 className="h-11"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="confirmPassword">Confirm password</Label>
 <PasswordInput
 id="confirmPassword"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 placeholder="Repeat your password"
 required
 className="h-11"
 />
 </div>

 <Button type="submit" className="h-11 w-full" disabled={loading}>
 {loading ? (
 <>
 <Spinner className="mr-2 h-4 w-4" />
 Updating password
 </>
 ) : (
"Set new password"
 )}
 </Button>
 </form>
 ) : (
 <div className="space-y-4">
 <Feedback message="Your password has been reset successfully." success />
 <Button asChild className="h-11 w-full">
 <Link href="/login">
 Sign in now <ArrowRight className="h-4 w-4" />
 </Link>
 </Button>
 </div>
 )}
 </AuthShell>
 )
}

export default function ResetPasswordPage() {
 return (
 <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Spinner className="h-8 w-8 text-brown-800" /></div>}>
 <ResetPasswordContent />
 </Suspense>
 )
}
