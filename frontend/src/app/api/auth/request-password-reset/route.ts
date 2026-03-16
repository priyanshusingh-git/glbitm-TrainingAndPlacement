import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/email.service';
import { logger } from '@/lib/logger';
import { generateOtp, hashOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const { email } = body;

 if (!email || typeof email !== 'string') {
 return NextResponse.json({ error: 'Email is required' }, { status: 400 });
 }

 // Always return success to prevent email enumeration attacks
 const genericResponse = NextResponse.json({
 message: 'If an account exists with this email, a verification code has been sent.'
 });

 // Find user in database
 const user = await prisma.user.findUnique({
 where: { email: email.trim().toLowerCase() },
 select: { id: true, name: true, email: true, role: true }
 });

 if (!user) {
 return genericResponse;
 }

 const otp = generateOtp();
 const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

 await prisma.user.update({
 where: { id: user.id },
 data: {
 otp: hashOtp(otp),
 otpExpires,
 }
 });

 sendPasswordResetEmail(user.email, user.name || 'User', otp)
 .catch(err => logger.error('Failed to send password reset OTP email:', err));

 return genericResponse;

 } catch (error) {
 logger.error('Request Password Reset Error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
