import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendPasswordResetEmail } from '@/services/email.service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
 try {
 const body = await req.json();
 const { email } = body;

 if (!email || typeof email !== 'string') {
 return NextResponse.json({ error: 'Email is required' }, { status: 400 });
 }

 // Always return success to prevent email enumeration attacks
 const genericResponse = NextResponse.json({
 message: 'If an account exists with this email, a password reset has been sent.'
 });

 // Find user in database
 const user = await prisma.user.findUnique({
 where: { email: email.trim().toLowerCase() },
 select: { id: true, name: true, email: true, role: true }
 });

 if (!user) {
 return genericResponse;
 }

 // Generate a reset link via Firebase Admin
 const { authAdmin } = await import('@/lib/firebase-admin');
 const resetLink = await authAdmin.generatePasswordResetLink(email.trim().toLowerCase(), {
 url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`
 });

 // Send password reset email with the link (or the standard Firebase email if preferred)
 // For now, we use our custom email service with the Firebase link
 sendPasswordResetEmail(user.email, user.name || 'User', resetLink)
 .catch(err => logger.error('Failed to send password reset email:', err));

 return genericResponse;

 } catch (error) {
 logger.error('Request Password Reset Error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
