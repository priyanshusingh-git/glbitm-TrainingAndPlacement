"use client";

import { useEffect, useState } from"react";
import Link from"next/link";
import { useRouter, useSearchParams } from"next/navigation";
import { signInWithEmailAndPassword, updatePassword } from"firebase/auth";
import { AlertCircle, CheckCircle2 } from"lucide-react";
import { auth } from"@/lib/firebase";
import { api } from"@/lib/api";
import { useAuth } from"@/contexts/auth-context";
import { validateStrongPassword } from"@/lib/validators";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { PasswordInput } from"@/components/ui/password-input";
import { Spinner } from"@/components/ui/spinner";
import { useToast } from"@/components/ui/use-toast";
import { AuthShell } from"@/components/layout/auth-shell";

function Feedback({ message, variant ="error" }: { message: string; variant?:"error" |"success" }) {
 return (
 <div
 className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
 variant ==="error"
 ?"border-destructive/20 bg-destructive/5 text-destructive"
 :"border-emerald-200 bg-emerald-50 text-emerald-700"
 }`}
 >
 {variant ==="error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
 <span>{message}</span>
 </div>
 );
}

export function LoginForm() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const { user, updateUser } = useAuth();
 const { toast } = useToast();

 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);

 const [requiresChangePassword, setRequiresChangePassword] = useState(false);
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [changePwSuccess, setChangePwSuccess] = useState<string | null>(null);

 useEffect(() => {
 if (typeof window !=="undefined") {
 const sessionExpired = sessionStorage.getItem("sessionExpired");
 if (sessionExpired) {
 toast({
 title:"Session expired",
 description:"Please sign in again to continue.",
 variant:"destructive",
 });
 sessionStorage.removeItem("sessionExpired");
 }
 }

 if (!user) return;

 if (user.mustChangePassword) {
 setRequiresChangePassword(true);
 setLoading(false);
 return;
 }

 setLoading(false);
 if (user.role ==="STUDENT") router.push("/student");
 else if (user.role ==="ADMIN" || user.role ==="STAFF") router.push("/admin");
 else if (user.role ==="TRAINER") router.push("/trainer");
 else router.push("/");
 }, [router, searchParams, toast, user]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (loading) return;

 setLoading(true);
 setError(null);

 try {
 await signInWithEmailAndPassword(auth, email, password);
 } catch (err: any) {
 setError(err.message ||"Invalid email or password");
 setLoading(false);
 }
 };

 const handleChangePasswordSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);

 if (newPassword !== confirmPassword) {
 setError("New passwords do not match");
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
 const firebaseUser = auth.currentUser;
 if (!firebaseUser) throw new Error("No authenticated user found");

 await updatePassword(firebaseUser, newPassword);
 await api.post("/auth/change-password", { action:"confirm" });

 updateUser({ mustChangePassword: false });
 setChangePwSuccess("Password changed successfully. Redirecting...");

 window.setTimeout(() => {
 setRequiresChangePassword(false);
 setLoading(false);
 }, 900);
 } catch (err: any) {
 setError(err.message ||"Failed to change password");
 setLoading(false);
 }
 };

 if (requiresChangePassword) {
 return (
 <AuthShell
 title="Update your password"
 description="Your account requires a stronger password before access is granted."
 >
 <form onSubmit={handleChangePasswordSubmit} className="space-y-5">
 {error && <Feedback message={error} />}
 {changePwSuccess && <Feedback message={changePwSuccess} variant="success" />}

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
 placeholder="Repeat your new password"
 required
 className="h-11"
 />
 </div>

 <Button type="submit" className="h-11 w-full" disabled={loading || !!changePwSuccess}>
 {loading ? (
 <>
 <Spinner className="mr-2 h-4 w-4" />
 Updating password
 </>
 ) : (
"Update password"
 )}
 </Button>
 </form>
 </AuthShell>
 );
 }

 return (
 <AuthShell
 title="Welcome back"
 description="Sign in to continue managing placements, training, analytics, and student workflows."
 >
 <form onSubmit={handleSubmit} className="space-y-5">
 {error && <Feedback message={error} />}

 <div className="space-y-2">
 <Label htmlFor="email">Email address</Label>
 <Input
 id="email"
 type="email"
 placeholder="name@example.com"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 required
 className="h-11"
 />
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between gap-3">
 <Label htmlFor="password">Password</Label>
 <Link href="/forgot-password" className="text-sm font-medium text-brown-800 hover:underline">
 Forgot password?
 </Link>
 </div>
 <PasswordInput
 id="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 className="h-11"
 />
 </div>

 <Button type="submit" className="h-11 w-full" disabled={loading}>
 {loading ? (
 <>
 <Spinner className="mr-2 h-4 w-4" />
 Signing in
 </>
 ) : (
"Sign in"
 )}
 </Button>
 </form>
 </AuthShell>
 );
}
