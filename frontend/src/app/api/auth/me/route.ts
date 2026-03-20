import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authenticate } from '@/lib/auth-middleware';

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

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
 });

 if (!dbUser) {
 return NextResponse.json({ error: 'User not found' }, { status: 404 });
 }

 return NextResponse.json({
 id: dbUser.id,
 email: dbUser.email,
 role: dbUser.role,
 mustChangePassword: dbUser.mustChangePassword,
 name: dbUser.studentProfile?.name,
 photoUrl: dbUser.studentProfile?.photoUrl
 });

 } catch {
 return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
 }
}
