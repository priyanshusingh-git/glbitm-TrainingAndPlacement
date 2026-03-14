import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { driveId } = body;

 const student = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id }
 });

 if (!student) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

 // Check if already applied
 const existing = await prisma.application.findUnique({
 where: {
 driveId_studentId: {
 studentId: student.id,
 driveId
 }
 }
 });
 if (existing) return NextResponse.json({ error: 'Already applied' }, { status: 400 });

 const application = await prisma.application.create({
 data: {
 driveId,
 studentId: student.id,
 status: 'applied'
 }
 });

 return NextResponse.json(application, { status: 201 });

 } catch (error) {
 logger.error("Apply Drive Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
