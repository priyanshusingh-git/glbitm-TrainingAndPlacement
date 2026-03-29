import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { authenticate } from "@/lib/auth-middleware"
import { attachRequestContextHeaders } from "@/lib/request-context"
import { createProblemResponse, handleApiError } from "@/lib/problem-details"

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req)
 if (authResult instanceof NextResponse) return authResult

 try {
 const dbUser = await prisma.user.findUnique({
 where: { id: authResult.id },
 select: {
 id: true,
 email: true,
 role: true,
 mustChangePassword: true,
 studentProfile: {
 select: {
 name: true,
 photoUrl: true
 }
 }
 }
 })

 if (!dbUser) {
 return createProblemResponse(req, {
  status: 404,
  code: "USER_NOT_FOUND",
  title: "Resource not found",
  detail: "User not found.",
 })
 }

 return attachRequestContextHeaders(req, NextResponse.json({
 id: dbUser.id,
 email: dbUser.email,
 role: authResult.role,
 mustChangePassword: authResult.mustChangePassword,
 name: dbUser.studentProfile?.name,
 photoUrl: dbUser.studentProfile?.photoUrl
 }))

 } catch (error) {
 return handleApiError(req, error, {
  event: "auth.me.failed",
  message: "Failed to load current user",
  context: {
   userId: authResult.id,
  },
 })
 }
}
