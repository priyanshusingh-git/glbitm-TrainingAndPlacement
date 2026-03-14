import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { newPassword, action } = body;

 // If action is 'confirm', we skip the Auth update and only update the DB flag
 if (action === 'confirm') {
 await prisma.user.update({
 where: { id: authResult.id },
 data: { mustChangePassword: false }
 });
 return NextResponse.json({ message: 'Password change confirmed' });
 }

 if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
 return NextResponse.json(
 { error: 'New password must be at least 8 characters long' },
 { status: 400 }
 );
 }

 // Update password in Firebase Auth
 const { authAdmin } = await import('@/lib/firebase-admin');
 try {
 await authAdmin.updateUser(authResult.id, {
 password: newPassword,
 });
 } catch (authError: any) {
 logger.error('Firebase change password error:', authError);
 return NextResponse.json(
 { error: 'Failed to update password in Auth' },
 { status: 500 }
 );
 }

 // Clear the mustChangePassword flag
 await prisma.user.update({
 where: { id: authResult.id },
 data: { mustChangePassword: false }
 });

 return NextResponse.json({ message: 'Password changed successfully' });

 } catch (error) {
 logger.error('Change Password Error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
