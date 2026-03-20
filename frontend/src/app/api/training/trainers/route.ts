import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { generateStrongPassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/services/email.service';
import { logger } from '@/lib/logger';
import { logAudit } from '@/services/audit.service';

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 // Admin or Staff can list trainers
 if (authResult.role !== 'ADMIN') {
 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 }

 const trainers = await prisma.user.findMany({
 where: { role: 'TRAINER' },
 include: {
 trainerProfile: true
 }
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

 let firebaseUserId: string | null = null;

 try {
 const body = await req.json();
 const {
 name,
 email,
 trainerType,
 specialization,
 department,
 mobileNo,
 experience
 } = body;

 if (!name || !email) {
 return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
 }


 const existingUser = await prisma.user.findUnique({ where: { email } });
 if (existingUser) return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });

 // Always generate a strong random password
 const password = generateStrongPassword(12);

 // 1. Create User in Firebase Auth
 const { authAdmin } = await import('@/lib/firebase-admin');

 const fbUser = await authAdmin.createUser({
 email,
 password,
 emailVerified: true,
 displayName: name,
 });

 firebaseUserId = fbUser.uid;

 // 2. Create User in local DB
 let trainer = await prisma.user.create({
 data: {
 id: firebaseUserId,
 name,
 email,
 password: 'FIREBASE_AUTH',
 role: 'TRAINER',
 mustChangePassword: true,
 trainerProfile: {
 create: { trainerType, specialization, department, mobileNo, experience }
 }
 },
 include: {
 trainerProfile: true
 }
 });


 // 3. Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'CREATE',
 entityType: 'TRAINER',
 entityId: firebaseUserId,
 performedById: authResult.id,
 details: { name, email, trainerType },
 ipAddress,
 userAgent
 });

 // 4. Send welcome email with credentials
 const emailSent = await sendWelcomeEmail(email, name, password);

 return NextResponse.json({
 ...trainer,
 // Return credentials to admin so they can share manually if needed
 credentials: {
 email,
 password
 },
 warning: !emailSent ? 'Trainer created but email failed to send. Please share credentials manually.' : undefined,
 emailSent
 }, { status: 201 });

 } catch (error: any) {
 logger.error('Create Trainer Error:', error);

 // Rollback: Delete Firebase user if DB creation failed
 if (firebaseUserId) {
 try {
 const { authAdmin } = await import('@/lib/firebase-admin');
 await authAdmin.deleteUser(firebaseUserId);
 logger.info(`Rollback: Deleted Firebase user ${firebaseUserId} after DB failure.`);
 } catch (cleanupError) {
 logger.error(`Rollback Failed: Could not delete Firebase user ${firebaseUserId}`, cleanupError);
 }
 }

 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
