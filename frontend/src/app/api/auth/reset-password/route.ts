import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { authAdmin } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';
import { hashOtp } from '@/lib/otp';
import { validateStrongPassword } from '@/lib/validators';
import { sendPasswordChangedEmail } from '@/services/email.service';

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const email = body?.email?.trim?.().toLowerCase?.();
 const otp = body?.otp?.trim?.();
 const newPassword = body?.newPassword;

 if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string' || typeof newPassword !== 'string') {
 return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
 }

 const passwordError = validateStrongPassword(newPassword);
 if (passwordError) {
 return NextResponse.json({ error: passwordError }, { status: 400 });
 }

 const user = await prisma.user.findUnique({
 where: { email },
 select: {
 id: true,
 email: true,
 name: true,
 otp: true,
 otpExpires: true,
 }
 });

 if (!user?.otp || !user.otpExpires) {
 return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
 }

 const isExpired = user.otpExpires.getTime() < Date.now();
 const isMatch = user.otp === hashOtp(otp);

 if (isExpired || !isMatch) {
 return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
 }

 await authAdmin.updateUser(user.id, {
 password: newPassword,
 });

 await prisma.user.update({
 where: { id: user.id },
 data: {
 otp: null,
 otpExpires: null,
 mustChangePassword: false,
 }
 });

 sendPasswordChangedEmail(user.email, user.name || 'User')
 .catch(error => logger.error('Failed to send password changed email:', error));

 return NextResponse.json({ message: 'Password reset successfully' });
 } catch (error) {
 logger.error('Reset Password Error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
