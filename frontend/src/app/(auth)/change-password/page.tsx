"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";
import { AlertCircle, CheckCircle2 } from"lucide-react";
import { updatePassword } from"firebase/auth";
import { useAuth } from"@/contexts/auth-context";
import { api } from"@/lib/api";
import { auth } from"@/lib/firebase";
import { validateStrongPassword } from"@/lib/validators";
import { AuthShell } from"@/components/layout/auth-shell";
import { Button } from"@/components/ui/button";
import { Label } from"@/components/ui/label";
import { PasswordInput } from"@/components/ui/password-input";
import { Spinner } from"@/components/ui/spinner";

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
 if (!auth.currentUser) throw new Error("No authenticated user found. Please log in again.");

 await updatePassword(auth.currentUser, newPassword);
 await api.post("/auth/change-password", { action:"confirm" });

 updateUser({ mustChangePassword: false });
 setSuccess("Password changed successfully. Redirecting...");

 window.setTimeout(() => {
 if (user?.role ==="STUDENT") router.push("/student");
 else if (user?.role ==="ADMIN" || user?.role ==="STAFF") router.push("/admin");
 else if (user?.role ==="TRAINER") router.push("/trainer");
 else router.push("/");
 }, 1200);
 } catch (err: any) {
 setError(err.message ||"Failed to change password");
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
 <Label htmlFor="new">New password</Label>
 <PasswordInput
 id="new"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 required
 showStrength
 className="h-11"
 />
 </div>

 <div className="space-y-2">
 <Label htmlFor="confirm">Confirm password</Label>
 <PasswordInput
 id="confirm"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 className="h-11"
 />
 </div>

 <div className="space-y-3 pt-1">
 <Button type="submit" className="h-11 w-full" disabled={loading || !!success}>
 {loading ? (
 <>
 <Spinner className="mr-2 h-4 w-4" />
 Updating password
 </>
 ) : (
"Update password"
 )}
 </Button>

 <Button variant="outline" type="button" className="h-11 w-full" onClick={logout}>
 Cancel and sign out
 </Button>
 </div>
 </form>
 </AuthShell>
 );
}
