import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function PUT(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 await prisma.notification.updateMany({
 where: {
 userId: authResult.id,
 isRead: false
 },
 data: { isRead: true }
 });

 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error:"Failed to update notifications" }, { status: 500 });
 }
}
