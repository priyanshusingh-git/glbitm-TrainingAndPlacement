import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/role-cookie';
import { verifyServerSession } from '@/lib/session';

export type AuthUser = {
 id: string;
 email: string;
 role: string;
 mustChangePassword: boolean;
};

export async function authenticate(req: NextRequest): Promise<AuthUser | NextResponse> {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

 try {
 const decodedToken = await verifyServerSession(sessionCookie);
 const firebaseUid = decodedToken.uid;

 const dbUser = await prisma.user.findUnique({
 where: { id: firebaseUid },
 select: { id: true, email: true, role: true, mustChangePassword: true }
 });

 if (!dbUser) {
 return NextResponse.json({ error: 'User not found in database' }, { status: 401 });
 }

 return {
 id: dbUser.id,
 email: dbUser.email,
 role: dbUser.role,
 mustChangePassword: dbUser.mustChangePassword,
 };
 } catch (error: any) {
 return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
 }
}

export async function authorize(req: NextRequest, roles: string[]): Promise<AuthUser | NextResponse> {
 const authResult = await authenticate(req);

 if (authResult instanceof NextResponse) {
 return authResult;
 }

 if (!roles.includes(authResult.role)) {
 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 }

 return authResult;
}
