import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// GET /api/tests/[id]
export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER', 'STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 const test = await prisma.test.findUnique({
 where: { id },
 include: {
 creator: { select: { name: true, email: true } },
 assignedGroups: { select: { id: true, name: true } },
 questions: {
 include: {
 question: {
 include: {
 options: true
 }
 }
 },
 orderBy: { order: 'asc' }
 }
 }
 });

 if (!test) {
 return NextResponse.json({ error: 'Test not found' }, { status: 404 });
 }

 // Security: Remove isCorrect from options for students
 if (authResult.role === 'STUDENT') {
 (test as any).questions = test.questions.map(tq => ({
 ...tq,
 question: {
 ...tq.question,
 explanation: null, // Hide explanation during test
 options: tq.question.options.map(opt => ({
 id: opt.id,
 text: opt.text
 // isCorrect is omitted
 }))
 }
 }));
 }

 return NextResponse.json(test);
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// PUT /api/tests/[id]
export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 const body = await req.json();
 const { title, type, date, duration, totalMarks, testUrl, platform, groupIds } = body;

 const test = await prisma.test.update({
 where: { id },
 data: {
 title,
 type,
 date: date ? new Date(date) : undefined,
 duration: duration !== undefined ? parseInt(duration) : undefined,
 totalMarks: totalMarks !== undefined ? parseInt(totalMarks) : undefined,
 testUrl,
 platform,
 assignedGroups: groupIds && Array.isArray(groupIds) ? {
 set: groupIds.map((id: string) => ({ id }))
 } : undefined
 },
 include: {
 assignedGroups: true
 }
 });

 return NextResponse.json(test);
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// DELETE /api/tests/[id]
export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;

 await prisma.$transaction(async (tx) => {
 // Delete results first
 await tx.testResult.deleteMany({
 where: { testId: id }
 });
 // Delete test
 await tx.test.delete({
 where: { id }
 });
 });

 return NextResponse.json({ message: 'Test deleted successfully' });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
