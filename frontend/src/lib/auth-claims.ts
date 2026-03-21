import { authAdmin } from "@/lib/firebase-admin"
import { signInWithCustomTokenServer } from "@/lib/firebase-rest"

export type AppRole = "ADMIN" | "STUDENT" | "TRAINER" | "RECRUITER"

type FirebaseRoleClaim = "admin" | "student" | "trainer" | "recruiter"

export function toFirebaseRoleClaim(role: AppRole): FirebaseRoleClaim {
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

export function buildUserClaims(role: AppRole, mustChangePassword: boolean) {
  return {
    role: toFirebaseRoleClaim(role),
    mustChangePassword,
  }
}

export async function syncUserAuthClaims(params: {
  uid: string
  role: AppRole
  mustChangePassword: boolean
}) {
  const user = await authAdmin.getUser(params.uid)
  const nextClaims = buildUserClaims(params.role, params.mustChangePassword)
  const currentClaims = user.customClaims ?? {}

  if (
    currentClaims.role === nextClaims.role &&
    Boolean(currentClaims.mustChangePassword) === nextClaims.mustChangePassword
  ) {
    return nextClaims
  }

  await authAdmin.setCustomUserClaims(params.uid, nextClaims)
  return nextClaims
}

export async function createRoleBoundIdToken(params: {
  uid: string
  role: AppRole
  mustChangePassword: boolean
}) {
  const claims = await syncUserAuthClaims(params)
  const customToken = await authAdmin.createCustomToken(params.uid, claims)
  const signInResult = await signInWithCustomTokenServer(customToken)

  return {
    idToken: signInResult.idToken,
    role: fromFirebaseRoleClaim(claims.role) ?? params.role,
    mustChangePassword: claims.mustChangePassword,
  }
}
