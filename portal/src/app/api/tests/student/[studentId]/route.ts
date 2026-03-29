import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { studentId } = await params;

 try {
 // Access control: Admin, Trainer, or the Student themselves
 // If student, check if studentId matches their profile id
 if (authResult.role === 'STUDENT') {
 const profile = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!profile || profile.id !== studentId) {
 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 }
 }

 const results = await prisma.testResult.findMany({
 where: { studentId: String(studentId) },
 include: { test: true }
 });
 return NextResponse.json(results);
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
