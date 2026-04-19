import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authorize(req, ['ADMIN', 'STUDENT']);
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

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { id: semRecord.studentId },
      select: { userId: true }
    });

    if (!studentProfile) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

    // Ownership Check
    if (authResult.role === 'STUDENT' && studentProfile.userId !== authResult.id) {
       return NextResponse.json({ error: 'You do not have permission to lock this profile' }, { status: 403 });
    }

    await prisma.semesterResult.update({
      where: { id: semRecord.id },
      data: { isLocked: true }
    });

    if (authResult.role === 'ADMIN') {
      const notification = await prisma.notification.create({
        data: {
          userId: studentProfile.userId,
          title: "Semester Results Locked 🔒",
          message: `Admin has officially finalized and locked your Semester ${semester} results.`,
          type: "WARNING"
        }
      });

      // Broadcast Event
      try {
        const { broadcastMessage } = await import('@/lib/realtime');
        await broadcastMessage({
          channel: `student-${studentProfile.userId}`,
          event: 'data-update',
          payload: { type: 'LOCK_SEMESTER', semester }
        });

        await broadcastMessage({
          channel: `user-${studentProfile.userId}`,
          event: 'notification',
          payload: notification
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
