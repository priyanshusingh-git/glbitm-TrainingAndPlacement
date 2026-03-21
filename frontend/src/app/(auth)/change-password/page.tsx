"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";
import { AlertCircle, CheckCircle2 } from"lucide-react";
import { useAuth } from"@/contexts/auth-context";
import { api } from"@/lib/api";
import { getAuthErrorMessage } from"@/lib/auth-ui-messages";
import { validateStrongPassword } from"@/lib/validators";
import { AuthShell } from"@/components/layout/auth-shell";
import { Button } from"@/components/ui/button";
import { Label } from"@/components/ui/label";
import { PasswordInput } from"@/components/ui/password-input";
import { Spinner } from"@/components/ui/spinner";

function Feedback({ message, success = false }: { message: string; success?: boolean }) {
 return (
 <div
 className={`feedback-message ${
 success ?"feedback-message-success" :"feedback-message-error"
 }`}
 >
 {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
 <span>{message}</span>
 </div>
 )
}

export default function ChangePasswordPage() {
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const { user, logout, updateUser } = useAuth();
 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);
 setSuccess(null);

 if (newPassword !== confirmPassword) {
 setError("New passwords do not match.");
 setLoading(false);
 return;
 }

 const passwordError = validateStrongPassword(newPassword);
 if (passwordError) {
 setError(passwordError);
 setLoading(false);
 return;
 }

 try {
 await api.post("/auth/change-password", { newPassword });
 updateUser({ mustChangePassword: false });
 setSuccess("Password changed successfully. Redirecting...");

 window.setTimeout(() => {
 if (user?.role ==="STUDENT") router.push("/student");
 else if (user?.role ==="ADMIN") router.push("/admin");
 else if (user?.role ==="TRAINER") router.push("/trainer");
 else if (user?.role ==="RECRUITER") router.push("/recruiter");
 else router.push("/");
 }, 1200);
 } catch (err: any) {
 setError(getAuthErrorMessage(err, { flow:"change-password" }));
 } finally {
 setLoading(false);
 }
 };

 return (
 <AuthShell
 title="Change your password"
 description="For security reasons, you need to set a new password before continuing into the platform."
 >
 <form onSubmit={handleSubmit} className="space-y-5">
 {error && <Feedback message={error} />}
 {success && <Feedback message={success} success />}

 <div className="space-y-2">
 <Label htmlFor="new" className="auth-label">New password</Label>
 <PasswordInput
 id="new"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 required
 showStrength
 showBreachCheck
 className="auth-input"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="confirm" className="auth-label">Confirm password</Label>
 <PasswordInput
 id="confirm"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 className="auth-input"
 />
 </div>

 <div className="space-y-3 pt-1">
 <Button type="submit" className="btn-primary w-full" disabled={loading || !!success}>
 {loading ? (
 <>
 <Spinner className="mr-2 h-4 w-4" />
 Updating password
 </>
 ) : (
"Update password"
 )}
 </Button>

 <Button variant="outline" type="button" className="btn-ghost-light w-full justify-center" onClick={logout}>
 Cancel and sign out
 </Button>
 </div>
 </form>
 </AuthShell>
 );
}
