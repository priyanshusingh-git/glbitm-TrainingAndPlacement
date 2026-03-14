import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { generateStrongPassword } from '@/lib/password';
import { sendAdminPasswordResetEmail } from '@/services/email.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { id },
 include: { user: true }
 });

 if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

 // Generate temporary password
 const tempPassword = generateStrongPassword(12);

 // 1. Update Password in Firebase Auth
 console.log(`[RESET_PASSWORD] Updating Firebase auth for user ${student.userId}`);
 const { authAdmin } = await import('@/lib/firebase-admin');

 await authAdmin.updateUser(student.userId, {
 password: tempPassword
 });

 console.log(`[RESET_PASSWORD] Firebase auth updated successfully`);

 // 2. Update Local DB (Sync flag)
 await prisma.user.update({
 where: { id: student.userId },
 data: {
 password:"FIREBASE_AUTH", // Ensure placeholder
 mustChangePassword: true
 }
 });
 console.log(`[RESET_PASSWORD] Local DB synced`);

 // Send email
 console.log(`[RESET_PASSWORD] Sending email to ${student.user.email}`);
 const emailSent = await sendAdminPasswordResetEmail(student.user.email, student.user.name ||"Student", tempPassword);

 if (emailSent) {
 console.log(`[RESET_PASSWORD] Email sent successfully`);
 } else {
 console.error(`[RESET_PASSWORD] Failed to send email`);
 return NextResponse.json({
 message: 'Password reset successful, but email failed to send. Please share credentials manually.',
 tempPassword: tempPassword
 }, { status: 200 });
 }

 return NextResponse.json({ message: 'Password reset successfully' });

 } catch (error: any) {
 console.error(`[RESET_PASSWORD] Server Error: ${error.message}`, error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
