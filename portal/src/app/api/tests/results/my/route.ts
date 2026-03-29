import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id },
 select: { id: true }
 });

 if (!student) {
 return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
 }

 const results = await prisma.testResult.findMany({
 where: { studentId: student.id },
 include: {
 test: {
 select: {
 id: true,
 title: true,
 type: true,
 date: true,
 duration: true,
 totalMarks: true
 }
 }
 }
 });

 return NextResponse.json(results);
 } catch (error) {
 console.error("[GET /api/tests/results/my] Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
