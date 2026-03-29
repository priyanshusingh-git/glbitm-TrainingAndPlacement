import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const { semester } = await req.json();

 const semRecord = await prisma.semesterResult.findFirst({
 where: { studentId: id, semester: parseInt(semester) }
 });

 if (!semRecord) {
 return NextResponse.json({ error: 'Semester record not found' }, { status: 404 });
 }

 await prisma.semesterResult.update({
 where: { id: semRecord.id },
 data: { isLocked: false }
 });

 // Need the student using studentId
 const student = await prisma.studentProfile.findUnique({
 where: { id: semRecord.studentId },
 select: { userId: true }
 });

 if (student) {
 // Create Notification
 await prisma.notification.create({
 data: {
 userId: student.userId,
 title:"Semester Unlocked 🔓",
 message: `Admin has unlocked Semester ${semester}.`,
 type:"SUCCESS"
 }
 });

 // Broadcast Event
 try {
 const { broadcastMessage } = await import('@/lib/realtime');
 await broadcastMessage({
 channel: `profile-updates-${student.userId}`,
 event: 'profile:unlocked',
 payload: { userId: student.userId, section: 'semester', semester: semester }
 });
 } catch (e) {
 console.error("Broadcast failed", e);
 }
 }

 return NextResponse.json({ message: 'Semester unlocked' });

 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
