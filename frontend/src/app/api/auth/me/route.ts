import { NextRequest, NextResponse } from 'next/server';
import { authAdmin } from '@/lib/firebase-admin';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
 const token = req.headers.get('Authorization')?.replace('Bearer ', '');

 if (!token) {
 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 }

 try {
 const decodedToken = await authAdmin.verifyIdToken(token);
 const firebaseUid = decodedToken.uid;

 const dbUser = await prisma.user.findUnique({
 where: { id: firebaseUid },
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

 } catch (err: any) {
 logger.error('Error fetching user profile:', err);
 return NextResponse.json({ error: 'Auth failed' }, { status: 401 });
 }
}
