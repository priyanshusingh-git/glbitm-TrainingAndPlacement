import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { broadcastMessage } from '@/lib/realtime';

export async function POST(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id: groupId } = await params;
 const { studentIds } = await req.json();

 if (!studentIds || !Array.isArray(studentIds)) {
 return NextResponse.json({ error: 'Invalid studentIds' }, { status: 400 });
 }

 // Update all students to this group
 const updateCount = await prisma.studentProfile.updateMany({
 where: {
 admissionId: { in: studentIds }
 },
 data: {
 trainingGroupId: groupId
 }
 });

 // Broadcast update
 await broadcastMessage({
 channel: 'admin_updates',
 event: 'training_group_updated',
 payload: { groupId }
 });

 return NextResponse.json({
 message: `Successfully assigned ${updateCount.count} students.`,
 count: updateCount.count
 });
 } catch (error: any) {
 logger.error('ASSIGN Students Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id: groupId } = await params;
 const { studentIds } = await req.json();

 if (!studentIds || !Array.isArray(studentIds)) {
 return NextResponse.json({ error: 'Invalid studentIds' }, { status: 400 });
 }

 // Unassign students (set trainingGroupId to null)
 const updateCount = await prisma.studentProfile.updateMany({
 where: {
 admissionId: { in: studentIds },
 trainingGroupId: groupId // Ensure we only remove if they are in THIS group
 },
 data: {
 trainingGroupId: null
 }
 });

 // Broadcast update
 await broadcastMessage({
 channel: 'admin_updates',
 event: 'training_group_updated',
 payload: { groupId }
 });

 return NextResponse.json({
 message: `Successfully unassigned ${updateCount.count} students.`,
 count: updateCount.count
 });
 } catch (error: any) {
 logger.error('UNASSIGN Students Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
