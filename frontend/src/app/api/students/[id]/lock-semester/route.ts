import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const { semester } = await req.json(); // number

 // Find the semester record
 const semRecord = await prisma.semesterResult.findFirst({
 where: { studentId: id, semester: parseInt(semester) }
 });

 if (!semRecord) {
 // Create if not exists? Or error. Assuming existing for lock.
 return NextResponse.json({ error: 'Semester record not found' }, { status: 404 });
 }

 await prisma.semesterResult.update({
 where: { id: semRecord.id },
 data: { isLocked: true }
 });

 // Need the student's userId to send notification
 const student = await prisma.studentProfile.findUnique({
 where: { id: semRecord.studentId },
 select: { userId: true }
 });

 if (student) {
 // Create Notification
 await prisma.notification.create({
 data: {
 userId: student.userId,
 title:"Semester Locked 🔒",
 message: `Admin has locked Semester ${semester}.`,
 type:"WARNING"
 }
 });

 // Broadcast Event
 try {
 const { broadcastMessage } = await import('@/lib/realtime');
 await broadcastMessage({
 channel: `profile-updates-${student.userId}`,
 event: 'profile:locked',
 payload: { userId: student.userId, section: 'semester', semester: semester }
 });
 } catch (e) {
 console.error("Broadcast failed", e);
 }
 }

 return NextResponse.json({ message: 'Semester locked' });

 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
