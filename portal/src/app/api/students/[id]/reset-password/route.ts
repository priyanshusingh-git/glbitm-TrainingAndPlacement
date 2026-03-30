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

    // Generate magic token instead of password
    const magicToken = crypto.randomUUID();
    const magicTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // Update in Postgres directly
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        magicToken,
        magicTokenExpires,
        mustChangePassword: true
      }
    });

    // Send email with magic link
    const emailSent = await sendAdminPasswordResetEmail(
      student.user.email,
      student.user.name || "Student",
      magicToken
    );

    if (emailSent) {
      return NextResponse.json({ message: 'Password reset link sent successfully' });
    } else {
      return NextResponse.json({
        message: 'Reset initialized, but email failed to send. Please share the recovery link manually.',
        magicLink: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/magic?token=${magicToken}`
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error(`[RESET_PASSWORD] Server Error: ${error.message}`, error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
