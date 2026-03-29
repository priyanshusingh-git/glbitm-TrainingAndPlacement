const fs = require('fs');
const file = './src/app/api/students/bulk-import/route.ts';

const newContent = `import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import * as xlsx from 'xlsx';
import { generateStrongPassword } from '@/lib/password';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

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
    const rawData: any[] = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    const normalizeKey = (key: string) => key?.toString().toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Initial Parsing and Deduplication
    const parsedRows = [];
    const internalEmails = new Set();
    const internalAdmissionIds = new Set();

    let processedCount = 0;
    for (const row of rawData) {
      processedCount++;
      const keys = Object.keys(row);
      const admissionKey = keys.find(k => {
        const norm = normalizeKey(k);
        return norm === 'admissionno' || norm === 'admissionid';
      });
      const emailKey = keys.find(k => {
        const norm = normalizeKey(k);
        if (['officialemailid', 'email', 'officialemail', 'collegeemail', 'instituteemail', 'emailid', 'emailaddress', 'emial', 'e-mail'].includes(norm)) return true;
        if (norm.includes('email') && !norm.includes('personal') && !norm.includes('alternate')) return true;
        return false;
      });

      const admissionId = admissionKey ? row[admissionKey]?.toString().trim() : null;
      let email = emailKey ? row[emailKey]?.toString().trim() : null;

      if (!email) {
        if (Object.values(row).every(v => !v)) continue;
        results.failed++;
        results.errors.push(\`Row \${processedCount} missing Email. Keys: \${keys.join(', ')}\`);
        continue;
      }
      
      email = email.toLowerCase();

      if (internalEmails.has(email)) {
        results.failed++;
        results.errors.push(\`Row \${processedCount} Duplicate Email within file: \${email}\`);
        continue;
      }
      internalEmails.add(email);

      if (admissionId) {
        if (internalAdmissionIds.has(admissionId)) {
            results.failed++;
            results.errors.push(\`Row \${processedCount} Duplicate Admission ID within file: \${admissionId}\`);
            continue;
        }
        internalAdmissionIds.add(admissionId);
      }

      parsedRows.push({ email, admissionId, originalRowIndex: processedCount });
    }

    if (parsedRows.length === 0) {
      return NextResponse.json({ message: 'No valid rows found to process.', results });
    }

    // 2. Bulk Database Lookups (Extremely Fast)
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: Array.from(internalEmails) as string[] } },
      select: { email: true }
    });
    const dbExistingEmails = new Set(existingUsers.map(u => u.email));

    const existingProfiles = await prisma.studentProfile.findMany({
      where: { admissionId: { in: Array.from(internalAdmissionIds) as string[] } },
      select: { admissionId: true }
    });
    const dbExistingAdmissionIds = new Set(existingProfiles.map(p => p.admissionId));

    // 3. Filter Final Valid Rows
    const validRows = [];
    for (const row of parsedRows) {
        if (dbExistingEmails.has(row.email)) {
            results.failed++;
            results.errors.push(\`Row \${row.originalRowIndex}: Email \${row.email} already exists in database.\`);
            continue;
        }
        if (row.admissionId && dbExistingAdmissionIds.has(row.admissionId)) {
            results.failed++;
            results.errors.push(\`Row \${row.originalRowIndex}: Admission ID \${row.admissionId} already exists in database.\`);
            continue;
        }
        validRows.push(row);
    }

    if (validRows.length === 0) {
        return NextResponse.json({ message: 'No new records to insert.', results });
    }

    // 4. Compute Password Hashes & Generate IDs efficiently
    const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const usersToInsert = [];
    const profilesToInsert = [];
    const emailsToInsert = [];

    // Promise.all to compute hashes concurrently
    await Promise.all(validRows.map(async (row) => {
        const rawPassword = generateStrongPassword(12);
        const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);
        const userId = randomUUID();

        usersToInsert.push({
            id: userId,
            email: row.email,
            password: hashedPassword,
            role: 'STUDENT',
            mustChangePassword: true,
            name: 'Student'
        });

        profilesToInsert.push({
            userId: userId,
            admissionId: row.admissionId,
            name: 'Student',
            skills: []
        });

        emailsToInsert.push({
            to: row.email,
            subject: "Welcome to Scorlo Training & Placement Portal",
            payload: JSON.stringify({ name: 'Student', email: row.email, rawPassword }),
            status: "PENDING"
        });
    }));

    // 5. Bulk Matrix Insert against Database
    await prisma.$transaction(async (tx) => {
        await tx.user.createMany({ data: usersToInsert, skipDuplicates: true });
        await tx.studentProfile.createMany({ data: profilesToInsert, skipDuplicates: true });
        await tx.emailQueue.createMany({ data: emailsToInsert, skipDuplicates: true });
    });

    results.success = usersToInsert.length;

    return NextResponse.json({ message: 'Import processing complete', results });

  } catch (error) {
    logger.error("Bulk Import Error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
`;

fs.writeFileSync(file, newContent);
console.log("Rewrote bulk-import route");
