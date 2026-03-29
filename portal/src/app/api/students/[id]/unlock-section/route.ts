import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// Map frontend section names to Prisma field names
const sectionFieldMap: Record<string, string> = {
 basic: 'isBasicInfoLocked',
 class10: 'isClass10Locked',
 class12: 'isClass12Locked',
 diploma: 'isDiplomaLocked',
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const { section } = await req.json();
 const field = sectionFieldMap[section];

 if (!field) {
 return NextResponse.json(
 { error: `Invalid section '${section}'. Allowed: ${Object.keys(sectionFieldMap).join(', ')}` },
 { status: 400 }
 );
 }

 const data: any = {};
 data[field] = false;

 const updatedProfile = await prisma.studentProfile.update({
 where: { id },
 data,
 select: { userId: true }
 });

 // Create Notification
 await prisma.notification.create({
 data: {
 userId: updatedProfile.userId,
 title:"Section Unlocked 🔓",
 message: `Admin has unlocked the ${section} section of your profile.`,
 type:"SUCCESS" // Use SUCCESS for positive action
 }
 });

 // Broadcast Event
 try {
 const { broadcastMessage } = await import('@/lib/realtime');
 await broadcastMessage({
 channel: `profile-updates-${updatedProfile.userId}`,
 event: 'profile:unlocked',
 payload: { userId: updatedProfile.userId, section }
 });
 } catch (e) {
 console.error("Broadcast failed", e);
 }

 return NextResponse.json({ message: `${section} section unlocked` });

 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
