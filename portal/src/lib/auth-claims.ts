export type AppRole = "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER"

type TokenRoleClaim = "admin" | "student" | "trainer" | "recruiter"

export function toTokenRoleClaim(role: AppRole): TokenRoleClaim {
  if (role === "ADMIN") return "admin"
  if (role === "TRAINER") return "trainer"
  if (role === "RECRUITER") return "recruiter"
  return "student"
}

export function fromFirebaseRoleClaim(role: unknown): AppRole | null {
  if (role === "admin") return "ADMIN"
  if (role === "trainer") return "TRAINER"
  if (role === "recruiter") return "RECRUITER"
  if (role === "student") return "STUDENT"
  return null
}
