import React from "react"
import { CheckCircle2 } from "lucide-react"

export const authBrandStats = [
  { value: "92%", label: "Placement Rate" },
  { value: "600+", label: "Top Recruiters" },
  { value: "₹58L", label: "Highest CTC" },
]

export const authBrandContent = {
  eyebrow: "Placement Season 2024–25",
  title: (
    <>
      Your Career
      <br />
      Journey Starts
      <br />
      <span className="text-amber-500 italic">Right Here.</span>
    </>
  ),
  description: "Access the GL Bajaj CDC portal for campus placements, training schedules, and recruiter networking.",
}

export const forgotPasswordBrandContent = {
  eyebrow: "Secure Account Recovery",
  title: (
    <>
      Back in minutes,
      <br />
      <span className="text-amber-500 italic">not days</span>
    </>
  ),
  description: "A 6-digit OTP will be sent to your registered email. The entire reset process takes under two minutes and your data stays protected throughout.",
  bottom: (
    <div className="space-y-3 rounded-2xl border border-white/9 bg-white/5 p-5">
      {[
        {
          icon: "🔐",
          title: "OTP expires in 10 minutes",
          description: "Each code is single-use and automatically invalidated after use or expiry.",
        },
        {
          icon: "📧",
          title: "Sent only to your registered email",
          description: "If you don't receive it, check your spam folder or contact the T&P office.",
        },
        {
          icon: "🛡️",
          title: "No password is ever sent by email",
          description: "We only send a code. Your new password is set directly on this page.",
        },
      ].map((item) => (
        <div key={item.title} className="flex items-start gap-3">
          <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg bg-amber-500/12 text-[15px]">
            {item.icon}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-white/75">{item.title}</div>
            <div className="text-[12px] leading-[1.5] text-white/40">{item.description}</div>
          </div>
        </div>
      ))}
    </div>
  ),
}

export const changePasswordBrandContent = {
  eyebrow: "Security Update Required",
  title: (
    <>Strengthen your <span className="text-amber-500 italic">access</span></>
  ),
  description: "To keep your professional profile and internship records secure, we require a one-time password update before you proceed to the placement portal.",
  bottom: (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">Institutional Grade Security</div>
          <div className="text-xs text-white/50">Your account is now protected by campus-wide encryption.</div>
        </div>
      </div>
    </div>
  ),
}
