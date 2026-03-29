"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, MoveRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/auth-ui-messages";
import { validateStrongPassword } from "@/lib/validators";
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel";
import { changePasswordBrandContent } from "@/data/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

function Feedback({ message, success = false }: { message: string; success?: boolean }) {
  return (
    <div className={cn("feedback-message", success ? "feedback-message-success" : "feedback-message-error")}>
      {success ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="mt-1 text-[12px] font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-200">{message}</p>;
}

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();

  // Field-level validation
  const [touched, setTouched] = useState({ new: false, confirm: false });
  const [fieldErrors, setFieldErrors] = useState<{ new?: string; confirm?: string }>({});

  const isFormValid = newPassword.length >= 8 && confirmPassword.length >= 1;

  const validateNewPw = (value: string) => {
    if (!value) return "New password is required.";
    const strongErr = validateStrongPassword(value);
    if (strongErr) return strongErr;
    return undefined;
  };

  const validateConfirmPw = (pw: string, confirm: string) => {
    if (!confirm) return "Please confirm your password.";
    if (pw !== confirm) return "Passwords do not match.";
    return undefined;
  };

  const handleNewPwBlur = () => {
    if (newPassword.length > 0) {
      setTouched((p) => ({ ...p, new: true }));
      setFieldErrors((p) => ({ ...p, new: validateNewPw(newPassword) }));
    }
  };

  const handleConfirmBlur = () => {
    if (confirmPassword.length > 0) {
      setTouched((p) => ({ ...p, confirm: true }));
      setFieldErrors((p) => ({ ...p, confirm: validateConfirmPw(newPassword, confirmPassword) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    // Client-side validation
    const newErr = validateNewPw(newPassword);
    const confirmErr = validateConfirmPw(newPassword, confirmPassword);
    setTouched({ new: true, confirm: true });
    setFieldErrors({ new: newErr, confirm: confirmErr });
    if (newErr || confirmErr) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/auth/change-password", { newPassword });
      updateUser({ mustChangePassword: false });
      setSuccess("Password changed successfully. Redirecting…");

      window.setTimeout(() => {
        if (user?.role === "STUDENT") router.push("/student");
        else if (user?.role === "ADMIN") router.push("/admin");
        else if (user?.role === "TRAINER") router.push("/trainer");
        else if (user?.role === "RECRUITER") router.push("/recruiter");
        else router.push("/");
      }, 1200);
    } catch (err: any) {
      setError(getAuthErrorMessage(err, { flow: "change-password" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100svh] overflow-x-hidden bg-brown-50 text-foreground lg:grid lg:h-screen lg:min-h-0 lg:grid-cols-[1fr_1fr] lg:overflow-hidden">
      <AuthBrandPanel {...changePasswordBrandContent} />

      <main className="relative flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-6 animate-fade-up stagger-1">
            <h2 className="mb-2 font-display text-[42px] font-bold leading-[1.05] tracking-tight text-brown-900">
              Change your <span className="text-amber-700 italic">password</span>
            </h2>
            <p className="text-[15px] font-medium text-muted-foreground/80 leading-relaxed">
              Set a new strong password to continue into the platform.
            </p>
          </div>

          {/* Feedback/Notifications */}
          <div className={cn("overflow-hidden transition-all duration-300", (error || success) ? "mb-6 opacity-100" : "h-0 mb-0 opacity-0")}>
            {error && <Feedback message={error} />}
            {success && <Feedback message={success} success />}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-up stagger-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="new" className="auth-label text-[13px] font-semibold text-brown-800/80">NEW PASSWORD</Label>
              <PasswordInput
                id="new"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (touched.new) setFieldErrors((p) => ({ ...p, new: validateNewPw(e.target.value) }));
                }}
                onBlur={handleNewPwBlur}
                showStrength
                showBreachCheck
                className={cn("auth-input", touched.new && fieldErrors.new && "input-error")}
                aria-invalid={touched.new && !!fieldErrors.new}
              />
              <FieldError message={touched.new ? fieldErrors.new : null} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="auth-label text-[13px] font-semibold text-brown-800/80">CONFIRM PASSWORD</Label>
              <PasswordInput
                id="confirm"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirm) setFieldErrors((p) => ({ ...p, confirm: validateConfirmPw(newPassword, e.target.value) }));
                }}
                onBlur={handleConfirmBlur}
                className={cn("auth-input", touched.confirm && fieldErrors.confirm && "input-error")}
                aria-invalid={touched.confirm && !!fieldErrors.confirm}
              />
              <FieldError message={touched.confirm ? fieldErrors.confirm : null} />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className={cn(
                  "group relative w-full h-[54px] rounded-xl overflow-hidden font-bold transition-all duration-400 active:scale-[0.98]",
                  success
                    ? "bg-emerald-600 text-white"
                    : isFormValid
                      ? "bg-brown-900 text-brown-50 hover:bg-brown-800 shadow-lg shadow-amber-900/15 hover:shadow-amber-500/20 hover:-translate-y-0.5"
                      : "bg-brown-100/50 text-brown-400 border border-brown-200/60 cursor-not-allowed shadow-none"
                )}
                disabled={loading || !!success}
              >
                {success ? (
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /><span>Updated</span></div>
                ) : loading ? (
                  <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Updating…</span></div>
                ) : (
                  <>
                    <span>Update Password</span>
                    <MoveRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <Button variant="outline" type="button" className="w-full h-[50px] rounded-xl border-brown-100 text-brown-600 hover:bg-brown-50 transition-colors font-medium" onClick={logout}>
                Cancel and sign out
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
