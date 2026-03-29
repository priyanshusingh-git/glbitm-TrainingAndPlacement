import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/training/questions
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { searchParams } = new URL(req.url);
 const category = searchParams.get('category');
 const difficulty = searchParams.get('difficulty');
 const type = searchParams.get('type');
 const search = searchParams.get('search');

 const questions = await prisma.question.findMany({
 where: {
 category: category || undefined,
 difficulty: difficulty || undefined,
 type: type || undefined,
 text: search ? { contains: search, mode: 'insensitive' } : undefined
 },
 include: {
 options: true,
 _count: { select: { tests: true } }
 },
 orderBy: { createdAt: 'desc' }
 });

 return NextResponse.json(questions);
 } catch (error) {
 logger.error('GET Questions Error:', error);
 return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
 }
}

// POST /api/training/questions
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { text, type, difficulty, category, options, explanation } = body;

 if (!text || !category || !options || !Array.isArray(options)) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 // Use transaction to ensure both question and options are created
 const question = await prisma.$transaction(async (tx) => {
 const newQuestion = await tx.question.create({
 data: {
 text,
 type: type || 'MCQ',
 difficulty: difficulty || 'MEDIUM',
 category,
 explanation
 }
 });

 if (options.length > 0) {
 await tx.questionOption.createMany({
 data: options.map((opt: any) => ({
 questionId: newQuestion.id,
 text: opt.text,
 isCorrect: opt.isCorrect || false
 }))
 });
 }

 return tx.question.findUnique({
 where: { id: newQuestion.id },
 include: { options: true }
 });
 });

 return NextResponse.json(question, { status: 201 });
 } catch (error) {
 logger.error('POST Question Error:', error);
 return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
 }
}
