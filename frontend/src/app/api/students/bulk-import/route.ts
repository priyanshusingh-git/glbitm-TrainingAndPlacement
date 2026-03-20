import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import * as xlsx from 'xlsx';
import { sendWelcomeEmail } from '@/services/email.service';
import { generateStrongPassword } from '@/lib/password';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const formData = await req.formData();
 const file = formData.get('file') as File;

 if (!file) {
 return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
 }

 const buffer = Buffer.from(await file.arrayBuffer());

 let workbook;
 try {
 workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
 } catch (readErr) {
 return NextResponse.json({ error: 'Could not read file.' }, { status: 400 });
 }

 const sheetName = workbook.SheetNames[0];
 const sheet = workbook.Sheets[sheetName];
 const rawData: any[] = xlsx.utils.sheet_to_json(sheet, { defval:"" });

 const results = {
 success: 0,
 failed: 0,
 errors: [] as string[]
 };

 const normalizeKey = (key: string) => key?.toLowerCase().replace(/[^a-z0-9]/g, '');

 // Progress notifications (Realtime removed, using console for now)
 const emitProgress = async (step: string, progress: number, details?: string) => {
 console.log(`[Import Progress ${progress}%] ${step}: ${details || ''}`);
 };

 await emitProgress('Validating file...', 5);

 let processedCount = 0;
 const totalRows = rawData.length;

 for (const row of rawData) {
 processedCount++;
 const progress = 10 + Math.floor((processedCount / totalRows) * 80);

 // Find keys
 const keys = Object.keys(row);
 const admissionKey = keys.find(k => {
 const norm = normalizeKey(k);
 return norm === 'admissionno' || norm === 'admissionid';
 });
 const emailKey = keys.find(k => {
 const norm = normalizeKey(k);
 return norm === 'officialemailid' || norm === 'email' || norm === 'officialemail';
 });

 const admissionId = admissionKey ? row[admissionKey]?.toString().trim() : null;
 const email = emailKey ? row[emailKey]?.toString().trim() : null;

 if (!admissionId || !email) {
 if (Object.values(row).every(v => !v)) continue;
 results.failed++;
 results.errors.push(`Missing Admission No or Email. Found keys: ${keys.join(', ')}`);
 await emitProgress('Processing...', progress, `Skipped invalid row ${processedCount}`);
 continue;
 }

 await emitProgress('Processing...', progress, `Processing ${email}...`);

 try {
 // Check existence
 const existingUser = await prisma.user.findUnique({ where: { email } });
 if (existingUser) {
 results.failed++;
 results.errors.push(`Email ${email} already exists`);
 continue;
 }
 const existingProfile = await prisma.studentProfile.findUnique({ where: { admissionId } });
 if (existingProfile) {
 results.failed++;
 results.errors.push(`Admission ID ${admissionId} already exists`);
 continue;
 }

 const password = generateStrongPassword(12);

 // 1. Create User in Firebase Auth
 const { authAdmin } = await import('@/lib/firebase-admin');

 const fbUser = await authAdmin.createUser({
 email,
 password,
 emailVerified: true,
 displayName: 'Student',
 });

 const userId = fbUser.uid;
 await authAdmin.setCustomUserClaims(userId, {
  role: 'student',
  mustChangePassword: true
 });

 await prisma.$transaction(async (tx: any) => {
 const user = await tx.user.create({
 data: {
 id: userId, // Ensure ID matches Firebase UID
 email,
 password:"FIREBASE_AUTH", // Placeholder
 role: 'STUDENT',
 name: 'Student',
 mustChangePassword: true
 }
 });

 await tx.studentProfile.create({
 data: {
 userId: user.id,
 admissionId: admissionId,
 name: 'Student',
 skills: []
 }
 });
 });

 const emailSent = await sendWelcomeEmail(email, 'Student', password);
 if (emailSent) {
 results.success++;
 } else {
 results.failed++;
 results.errors.push(`Created user ${email} but failed to send email.`);
 }

 } catch (err: any) {
 results.failed++;
 results.errors.push(`Error processing ${email}: ${err.message}`);
 }
 }

 await emitProgress('Finalizing...', 100, 'Import complete!');

 return NextResponse.json({ message: 'Import processing complete', results });

 } catch (error) {
 logger.error("Bulk Import Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
