import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { studentId, sessionId, status } = body;

 const attendance = await prisma.attendance.upsert({
 where: {
 studentId_sessionId: {
 studentId,
 sessionId
 }
 },
 update: { status, date: new Date() },
 create: {
 studentId,
 sessionId,
 status,
 date: new Date()
 }
 });
 return NextResponse.json(attendance);
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
