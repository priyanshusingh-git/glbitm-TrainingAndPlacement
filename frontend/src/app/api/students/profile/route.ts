import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { broadcastMessage } from '@/lib/realtime';

const studentProfileUpdateSchema = z.object({
 name: z.string().optional(),
 rollNo: z.string().optional().nullable(),
 branch: z.string().optional().nullable(),
 year: z.string().optional().nullable(),
 course: z.string().optional().nullable(),
 studentType: z.string().optional().nullable(),
 currentSemester: z.number().optional().nullable(),

 class10School: z.string().optional().nullable(),
 class10Board: z.string().optional().nullable(),
 class10Percentage: z.number().optional().nullable(),
 class10Year: z.number().optional().nullable(),

 class12School: z.string().optional().nullable(),
 class12Board: z.string().optional().nullable(),
 class12Percentage: z.number().optional().nullable(),
 class12PcmPercentage: z.number().optional().nullable(),
 class12MathPercentage: z.number().optional().nullable(),
 class12Year: z.number().optional().nullable(),

 diplomaInstitute: z.string().optional().nullable(),
 diplomaBranch: z.string().optional().nullable(),
 diplomaPercentage: z.number().optional().nullable(),
 diplomaYear: z.number().optional().nullable(),

 photoUrl: z.string().optional().nullable(),

 isBasicInfoLocked: z.boolean().optional(),
 isClass10Locked: z.boolean().optional(),
 isClass12Locked: z.boolean().optional(),
 isDiplomaLocked: z.boolean().optional(),

 semesterResults: z.array(z.object({
 semester: z.number(),
 sgpa: z.number(),
 backlogs: z.number().optional(),
 credits: z.number().optional(),
 totalMarks: z.number().optional(),
 obtainedMarks: z.number().optional(),
 isLocked: z.boolean().optional()
 })).optional()
});

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id },
 include: {
 batch: true,
 results: { include: { test: true } },
 attendances: true,
 semesterResults: { orderBy: { semester: 'asc' } }
 }
 });

 if (!student) {
 return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
 }

 return NextResponse.json(student);
 } catch (error) {
 logger.error("Get Profile Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

export async function PUT(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();

 const validation = studentProfileUpdateSchema.safeParse(body);
 if (!validation.success) {
 return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
 }

 const value = validation.data;

 const currentProfile = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id }
 });

 if (!currentProfile) {
 return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
 }

 if (currentProfile.isProfileLocked) {
 return NextResponse.json({ error:"Your profile is locked. Contact admin to make changes." }, { status: 403 });
 }

 const { semesterResults, photoUrl, ...otherFields } = value;

 // @ts-ignore
 delete otherFields.isProfileLocked;

 // @ts-ignore
 if (otherFields.isBasicInfoLocked !== true) delete otherFields.isBasicInfoLocked;
 // @ts-ignore
 if (otherFields.isClass10Locked !== true) delete otherFields.isClass10Locked;
 // @ts-ignore
 if (otherFields.isClass12Locked !== true) delete otherFields.isClass12Locked;
 // @ts-ignore
 if (otherFields.isDiplomaLocked !== true) delete otherFields.isDiplomaLocked;

 const basicInfoFields = ['name', 'rollNo', 'admissionId', 'branch', 'year', 'currentSemester', 'course', 'studentType'];
 const class10Fields = ['class10School', 'class10Board', 'class10Percentage', 'class10Year'];
 const class12Fields = ['class12School', 'class12Board', 'class12Percentage', 'class12PcmPercentage', 'class12MathPercentage', 'class12Year'];
 const diplomaFields = ['diplomaInstitute', 'diplomaBranch', 'diplomaPercentage', 'diplomaYear'];

 const hasFieldUpdate = (fields: string[]) => fields.some(f => (otherFields as any)[f] !== undefined);

 if (currentProfile.isBasicInfoLocked && hasFieldUpdate(basicInfoFields)) {
 return NextResponse.json({ error:"Basic info section is locked." }, { status: 403 });
 }
 if (currentProfile.isClass10Locked && hasFieldUpdate(class10Fields)) {
 return NextResponse.json({ error:"Class 10 section is locked." }, { status: 403 });
 }
 if (currentProfile.isClass12Locked && hasFieldUpdate(class12Fields)) {
 return NextResponse.json({ error:"Class 12 section is locked." }, { status: 403 });
 }
 if (currentProfile.isDiplomaLocked && hasFieldUpdate(diplomaFields)) {
 return NextResponse.json({ error:"Diploma section is locked." }, { status: 403 });
 }

 const updateData: any = { ...otherFields };
 if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

 const student = await prisma.studentProfile.update({
 where: { userId: authResult.id },
 data: updateData
 });

 if (semesterResults && Array.isArray(semesterResults)) {
 if (currentProfile.currentSemester) {
 const invalidSemester = semesterResults.find(r => r.semester > (currentProfile.currentSemester as number));
 if (invalidSemester) {
 return NextResponse.json({
 error: `Cannot add results for Semester ${invalidSemester.semester}. Your current semester is ${currentProfile.currentSemester}.`
 }, { status: 400 });
 }
 }

 for (const result of semesterResults) {
 await prisma.semesterResult.upsert({
 where: { studentId_semester: { studentId: student.id, semester: result.semester } },
 update: {
 sgpa: result.sgpa,
 backlogs: result.backlogs || 0,
 credits: result.credits,
 totalMarks: result.totalMarks,
 obtainedMarks: result.obtainedMarks
 },
 create: {
 studentId: student.id,
 semester: result.semester,
 sgpa: result.sgpa,
 backlogs: result.backlogs || 0,
 credits: result.credits,
 totalMarks: result.totalMarks,
 obtainedMarks: result.obtainedMarks
 }
 });
 }
 }

 // Broadcast real-time update
 await broadcastMessage({
 channel: `profile-updates-${authResult.id}`,
 event: 'profile:updated',
 payload: { userId: authResult.id, name: student.name }
 });

 await broadcastMessage({
 channel: 'admin-student-updates',
 event: 'student:updated',
 payload: { userId: authResult.id, student }
 });

 return NextResponse.json(student);

 } catch (error) {
 logger.error("Update Profile Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
