export const loginContent = {
  eyebrow: "Placement Portal 2024",
  title: "Step into your future.",
  subtitle: "Access training modules, apply for campus drives, track your placement progress, and connect with top recruiters.",
  stats: [
    { label: "Placement Rate", value: "94%" },
    { label: "Hiring Partners", value: "500+" }
  ],
  footer: "© 2024 GL Bajaj Institute. All rights reserved."
};

export const forgotPasswordContent = {
  title: "Forgot password",
  description: "Enter your registered email address and complete the security check.",
  successTitle: "Check your inbox",
  successDescription: (email: string) => `If an account exists for ${email}, a reset link has been sent. The link expires in 15 minutes.`
};

export const roles = [
  { id: "STUDENT", label: "Student" },
  { id: "RECRUITER", label: "Recruiter" },
  { id: "ADMIN", label: "Admin" },
  { id: "TRAINER", label: "Trainer" }
];
