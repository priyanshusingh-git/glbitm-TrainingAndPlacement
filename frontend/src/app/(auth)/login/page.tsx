"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { MoveRight, Loader2, ArrowLeft, Building2, User, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { loginContent, roles } from "@/data/auth";

type Role = "STUDENT" | "STAFF" | "TRAINER" | "COMPANY";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("STUDENT");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth();

  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      const userRole = user.role.toLowerCase();
      const redirectPath = searchParams.get("redirect") || `/${userRole}`;
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isLoading, user, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.loginId, formData.password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (r: Role) => {
    switch (r) {
      case "STUDENT": return <GraduationIcon className="w-5 h-5 mb-1" />;
      case "STAFF": return <User className="w-5 h-5 mb-1" />;
      case "TRAINER": return <Users className="w-5 h-5 mb-1" />;
      case "COMPANY": return <Building2 className="w-5 h-5 mb-1" />;
    }
  };

  const getRolePlaceholder = (r: Role) => {
    switch (r) {
      case "STUDENT": return "University Roll No.";
      case "STAFF": return "Employee ID";
      case "TRAINER": return "Trainer ID";
      case "COMPANY": return "Company ID or Email";
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[45%_55%] bg-background selection:bg-amber-500/20">
      {/* LEFT PANEL */}
      <div className="bg-brown-900 relative hidden lg:flex flex-col justify-between p-16 overflow-hidden text-white border-r border-white/5">
        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="absolute inset-0 bg-diagonal-lines opacity-20" />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-4 no-underline group">
                       <div className="w-12 h-12 rounded-sm bg-amber-500 grid place-items-center font-display font-bold text-xl text-brown-900 shadow-xl group-hover:scale-110 transition-base">GL</div>
            <div className="text-white font-bold text-lg leading-tight">
              GL Bajaj
              <span className="text-amber-500/60 block text-[10px] tracking-[0.3em] font-bold uppercase mt-1">T&P Portal</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-[440px]">
          <div className="eyebrow-dark mb-8">{loginContent.eyebrow}</div>
          <h1 className="font-display text-[56px] font-bold leading-[1.05] mb-8 tracking-tighter">
            Step into your <br />
            <span className="text-amber-500 italic">future journey.</span>
          </h1>
          <p className="text-white/50 text-xl leading-relaxed font-light mb-12">
            {loginContent.subtitle}
          </p>

          <div className="grid grid-cols-2 gap-6">
            {loginContent.stats.map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-6 backdrop-blur-sm">
                <div className="font-display text-4xl font-bold text-amber-500 leading-none mb-2">{stat.value}</div>
                <div className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/20 text-[10px] font-bold uppercase tracking-widest pt-8 border-t border-white/5">
          <div>{loginContent.footer}</div>
          <a href="mailto:placement@glbitm.org" className="hover:text-amber-500 transition-base">Support</a>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24 relative bg-background">
        <Link href="/" className="absolute top-12 right-12 w-12 h-12 rounded-full border border-border flex items-center justify-center text-brown-900 hover:bg-brown-900 hover:text-white transition-base shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="w-full max-w-[420px] mx-auto">
          <div className="mb-12 text-center">
            <h2 className="section-h2 text-4xl mb-3">Welcome Back</h2>
            <p className="text-muted-foreground text-sm font-light">Select your credentials to access the placement portal.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <Label className="text-[10px] font-bold text-brown-900 uppercase tracking-widest mb-4 block">Accessing As</Label>
              <div className="grid grid-cols-4 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as Role)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-md border transition-base group hover:border-amber-500/50",
                      role === r.id ? "bg-brown-900 border-brown-900 shadow-lg" : "bg-white border-border"
                    )}
                  >
                    <div className={cn("mb-2 transition-base", role === r.id ? "text-amber-500" : "text-brown-900 group-hover:scale-110")}>
                      {getRoleIcon(r.id as Role)}
                    </div>
                    <span className={cn("text-[10.5px] font-bold uppercase tracking-wider", role === r.id ? "text-white/80" : "text-brown-600")}>
                      {r.label.split('/')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loginId" className="text-[10px] font-bold text-brown-900 uppercase tracking-widest pl-1">
                  {role === 'STAFF' ? 'EMPLOYEE' : role} ID
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-amber-600 transition-base">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="loginId"
                    name="loginId"
                    type="text"
                    placeholder={getRolePlaceholder(role)}
                    value={formData.loginId}
                    onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                    required
                    className="pl-12 h-14 bg-white/50 border-border focus:bg-white focus:border-amber-500 transition-base rounded-md font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between pl-1">
                  <Label htmlFor="password" className="text-[10px] font-bold text-brown-900 uppercase tracking-widest">Password</Label>
                  <Link href="/forgot-password" title="Click to recover password" className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:text-amber-500 transition-base">
                    Forgot?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="••••••••"
                  className="h-14 bg-white/50 border-border focus:bg-white focus:border-amber-500 transition-base rounded-md font-medium"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="btn-primary w-full h-14 text-sm">
              {loading ? <Loader2 className="animate-spin" /> : <>Sign In Securely <MoveRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>

          {role === "STUDENT" && (
            <p className="mt-12 text-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Not registered?{" "}
              <Link href="/register/student" className="text-amber-600 hover:text-amber-500 transition-base underline underline-offset-4">
                Enroll Now
              </Link>
            </p>
          )}

          {role === "COMPANY" && (
            <p className="mt-12 text-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
              New Recruiter?{" "}
              <Link href="/register/company" className="text-amber-600 hover:text-amber-500 transition-base underline underline-offset-4">
                Partner Us
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function GraduationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21.42 10.922a2 2 0 0 1-.019 3.138l-8.5 7.107a2 2 0 0 1-2.54 0l-8.5-7.107a2 2 0 0 1-.019-3.138l8.5-7.107a2 2 0 0 1 2.54 0l8.5 7.107Z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
