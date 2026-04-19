import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { broadcastMessage } from '@/lib/realtime';

export async function GET(req: NextRequest) {
  const authResult = await authenticate(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: authResult.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authorize(req, ['ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const { userId, title, message, type } = body;

    if (!userId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'INFO'
      }
    });

    // Push real-time notification to the student's personal channel
    await broadcastMessage({
      channel: `user-${userId}`,
      event: 'notification',
      payload: notification
    });

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
