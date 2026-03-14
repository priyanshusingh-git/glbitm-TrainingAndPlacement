import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/training/questions/[id]
export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const question = await prisma.question.findUnique({
 where: { id },
 include: { options: true }
 });

 if (!question) {
 return NextResponse.json({ error: 'Question not found' }, { status: 404 });
 }

 return NextResponse.json(question);
 } catch (error) {
 logger.error('GET Question ID Error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// PUT /api/training/questions/[id]
export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const body = await req.json();
 const { text, type, difficulty, category, options, explanation } = body;

 const updatedQuestion = await prisma.$transaction(async (tx) => {
 // Update question info
 await tx.question.update({
 where: { id },
 data: {
 text,
 type,
 difficulty,
 category,
 explanation
 }
 });

 // Update options: simplest way is to delete and recreate
 if (options && Array.isArray(options)) {
 await tx.questionOption.deleteMany({ where: { questionId: id } });
 await tx.questionOption.createMany({
 data: options.map((opt: any) => ({
 questionId: id,
 text: opt.text,
 isCorrect: opt.isCorrect || false
 }))
 });
 }

 return tx.question.findUnique({
 where: { id },
 include: { options: true }
 });
 });

 return NextResponse.json(updatedQuestion);
 } catch (error) {
 logger.error('PUT Question Error:', error);
 return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
 }
}

// DELETE /api/training/questions/[id]
export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 await prisma.question.delete({ where: { id } });
 return NextResponse.json({ message: 'Question deleted successfully' });
 } catch (error) {
 logger.error('DELETE Question Error:', error);
 return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
 }
}
