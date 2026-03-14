import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { testId, studentId, marksObtained } = body;

 if (!testId || typeof testId !== 'string') {
 return NextResponse.json({ error: 'Test ID is required' }, { status: 400 });
 }
 if (!studentId || typeof studentId !== 'string') {
 return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
 }
 if (marksObtained === undefined || marksObtained === null || isNaN(Number(marksObtained)) || Number(marksObtained) < 0) {
 return NextResponse.json({ error: 'Marks obtained must be a non-negative number' }, { status: 400 });
 }

 const result = await prisma.testResult.create({
 data: {
 testId,
 studentId,
 marksObtained: parseFloat(marksObtained)
 }
 });
 return NextResponse.json(result, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
