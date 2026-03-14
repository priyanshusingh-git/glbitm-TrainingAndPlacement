"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";
import { useAuth } from"@/contexts/auth-context";
import { api } from"@/lib/api";
import { Button } from"@/components/ui/button";
import { Label } from"@/components/ui/label";
import { PasswordInput } from"@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from"@/components/ui/card";
import { AlertCircle, CheckCircle2 } from"lucide-react";
import { validateStrongPassword } from"@/lib/validators"

export default function ChangePasswordPage() {
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);
 const [loading, setLoading] = useState(false);
 const { logout, updateUser } = useAuth();
 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError(null);
 setSuccess(null);

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
 await api.post("/auth/change-password", { newPassword });
 updateUser({ mustChangePassword: false }); // Update local state immediately
 setSuccess("Password changed successfully! Redirecting...");
 setTimeout(() => {
 router.push("/student");
 }, 2000);
 } catch (err: any) {
 setError(err.message ||"Failed to change password");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
 <Card className="w-full max-w-md">
 <CardHeader className="space-y-1 text-center">
 <CardTitle className="text-2xl font-bold text-warning-foreground">Change Password Required</CardTitle>
 <CardDescription>
 For security reasons, you must change your password before proceeding.
 </CardDescription>
 </CardHeader>
 <form onSubmit={handleSubmit}>
 <CardContent className="space-y-4">
 {error && (
 <div className="flex items-center gap-2 rounded-md bg-destructive/15 border border-destructive/20 p-3 text-sm text-destructive">
 <AlertCircle className="h-4 w-4" />
 {error}
 </div>
 )}
 {success && (
 <div className="flex items-center gap-2 rounded-md bg-success/15 border border-success/20 p-3 text-sm text-success">
 <CheckCircle2 className="h-4 w-4" />
 {success}
 </div>
 )}
 <div className="space-y-2">
 <Label htmlFor="new">New Password</Label>
 <PasswordInput
 id="new"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 required
 showStrength={true}
 placeholder="Enter strong password"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="confirm">Confirm New Password</Label>
 <PasswordInput
 id="confirm"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 placeholder="Confirm new password"
 />
 </div>
 </CardContent>
 <CardFooter className="flex flex-col space-y-2">
 <Button type="submit" className="w-full" disabled={loading}>
 {loading ?"Updating..." :"Update Password"}
 </Button>
 <Button variant="ghost" type="button" className="w-full" onClick={logout}>
 Cancel & Logout
 </Button>
 </CardFooter>
 </form>
 </Card>
 </div>
 );
}
