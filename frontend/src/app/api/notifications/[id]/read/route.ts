import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const notification = await prisma.notification.findUnique({
 where: { id }
 });

 if (!notification) {
 return NextResponse.json({ error:"Notification not found" }, { status: 404 });
 }

 if (notification.userId !== authResult.id) {
 return NextResponse.json({ error:"Unauthorized" }, { status: 403 });
 }

 const updated = await prisma.notification.update({
 where: { id },
 data: { isRead: true }
 });

 return NextResponse.json(updated);
 } catch (error) {
 return NextResponse.json({ error:"Failed to update notification" }, { status: 500 });
 }
}
