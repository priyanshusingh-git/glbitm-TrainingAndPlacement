import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
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

    // Hash it natively with bcrypt (Firebase removed)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Update in Postgres directly
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    });

    // Send email with temp password
    const emailSent = await sendAdminPasswordResetEmail(
      student.user.email,
      student.user.name || "Student",
      tempPassword
    );

    if (emailSent) {
      return NextResponse.json({ message: 'Password reset successfully' });
    } else {
      return NextResponse.json({
        message: 'Password reset successful, but email failed to send. Please share credentials manually.',
        tempPassword: tempPassword
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error(`[RESET_PASSWORD] Server Error: ${error.message}`, error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
