import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// GET /api/tests
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER', 'STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 let where: any = {};

 // If student, filter by group
 if (authResult.role === 'STUDENT') {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id },
 select: { trainingGroupId: true }
 });

 if (student?.trainingGroupId) {
 where = {
 OR: [
 { assignedGroups: { none: {} } }, // Global tests
 { assignedGroups: { some: { id: student.trainingGroupId } } } // Assigned to student's group
 ]
 };
 } else {
 // If student has no group, show only global tests
 where = { assignedGroups: { none: {} } };
 }
 }

 const tests = await prisma.test.findMany({
 where,
 include: {
 creator: { select: { name: true, email: true } },
 _count: { select: { results: true, submissions: true } },
 assignedGroups: { select: { id: true, name: true } },
 questions: {
 include: { question: { include: { options: true } } },
 orderBy: { order: 'asc' }
 }
 },
 orderBy: { date: 'desc' }
 });
 return NextResponse.json(tests);
 } catch (error: any) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// POST /api/tests
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { title, type, date, duration, totalMarks, testUrl, platform, groupIds, questionIds } = body;

 if (!title || typeof title !== 'string') {
 return NextResponse.json({ error: 'Title is required' }, { status: 400 });
 }
 if (!type || typeof type !== 'string') {
 return NextResponse.json({ error: 'Test type is required' }, { status: 400 });
 }
 if (!date || isNaN(new Date(date).getTime())) {
 return NextResponse.json({ error: 'Valid date is required' }, { status: 400 });
 }
 if (duration !== undefined && (isNaN(Number(duration)) || Number(duration) <= 0)) {
 return NextResponse.json({ error: 'Duration must be a positive number' }, { status: 400 });
 }
 if (!totalMarks || isNaN(Number(totalMarks)) || Number(totalMarks) <= 0) {
 return NextResponse.json({ error: 'Total marks must be a positive number' }, { status: 400 });
 }

 const test = await prisma.test.create({
 data: {
 title,
 type,
 date: new Date(date),
 duration: parseInt(duration) || 0,
 totalMarks: parseInt(totalMarks),
 testUrl,
 platform,
 createdBy: authResult.id,
 assignedGroups: groupIds && Array.isArray(groupIds) ? {
 connect: groupIds.map((id: string) => ({ id }))
 } : undefined,
 questions: questionIds && Array.isArray(questionIds) ? {
 create: questionIds.map((id: string, index: number) => ({
 questionId: id,
 order: index
 }))
 } : undefined
 },
 include: {
 assignedGroups: true,
 questions: { include: { question: true } }
 }
 });
 return NextResponse.json(test, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
