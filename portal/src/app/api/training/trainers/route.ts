import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';
import { generateStrongPassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/services/email.service';
import { logger } from '@/lib/logger';
import { logAudit } from '@/services/audit.service';

export async function GET(req: NextRequest) {
  const authResult = await authenticate(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    if (authResult.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const trainers = await prisma.user.findMany({
      where: { role: 'TRAINER' },
      include: { trainerProfile: true }
    });

    return NextResponse.json(trainers);
  } catch (error: any) {
    logger.error('GET Trainers Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authorize(req, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { name, email, trainerType, specialization, department, mobileNo, experience } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });

    const password = generateStrongPassword(12);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User natively in Postgres (Firebase removed)
    let trainer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TRAINER',
        mustChangePassword: true,
        trainerProfile: {
          create: { trainerType, specialization, department, mobileNo, experience }
        }
      },
      include: { trainerProfile: true }
    });

    // Audit Log
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;
    await logAudit({
      action: 'CREATE',
      entityType: 'TRAINER',
      entityId: trainer.id,
      performedById: authResult.id,
      details: { name, email, trainerType },
      ipAddress,
      userAgent
    });

    // Send welcome email
    const emailSent = await sendWelcomeEmail(email, name, password);

    return NextResponse.json({
      ...trainer,
      credentials: { email, password },
      warning: !emailSent ? 'Trainer created but email failed to send.' : undefined,
      emailSent
    }, { status: 201 });

  } catch (error: any) {
    logger.error('Create Trainer Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
