import { NextRequest, NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import prisma from '@/lib/db';

export type AuthUser = {
 id: string;
 email: string;
 role: string;
};

export async function authenticate(req: NextRequest): Promise<AuthUser | NextResponse> {
 const token = req.headers.get('Authorization')?.replace('Bearer ', '');

 if (!token) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 try {
 const decodedToken = await authAdmin.verifyIdToken(token);
 const firebaseUid = decodedToken.uid;

 const dbUser = await prisma.user.findUnique({
 where: { id: firebaseUid },
 select: { id: true, email: true, role: true }
 });

 if (!dbUser) {
 return NextResponse.json({ error: 'User not found in database' }, { status: 401 });
 }

 return {
 id: dbUser.id,
 email: dbUser.email,
 role: dbUser.role
 };
 } catch (error: any) {
 console.error('Firebase Auth Error:', error);
 return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
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
