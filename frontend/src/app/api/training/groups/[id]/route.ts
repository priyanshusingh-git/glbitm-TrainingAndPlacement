import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { broadcastMessage } from '@/lib/realtime';

export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 const group = await prisma.trainingGroup.findUnique({
 where: { id },
 include: {
 trainers: {
 include: {
 trainer: { select: { name: true, email: true, id: true } }
 }
 },
 students: {
 include: {
 user: { select: { email: true } },
 batch: true
 }
 },
 _count: {
 select: { students: true }
 }
 }
 });

 if (!group) {
 return NextResponse.json({ error: 'Group not found' }, { status: 404 });
 }

 return NextResponse.json(group);
 } catch (error: any) {
 logger.error('GET Group Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 const body = await req.json();
 const { name, branch, year, description } = body;

 const group = await prisma.trainingGroup.update({
 where: { id },
 data: { name, branch, year, description },
 include: {
 trainers: {
 include: {
 trainer: { select: { name: true, email: true, id: true } }
 }
 },
 _count: {
 select: { students: true }
 }
 }
 });

 // Broadcast update
 await broadcastMessage({
 channel: 'admin_updates',
 event: 'training_group_updated',
 payload: { groupId: id }
 });

 return NextResponse.json(group);
 } catch (error: any) {
 logger.error('UPDATE Group Error:', error);
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
 const { id } = await params;

 // Start a transaction to handle associated records
 await prisma.$transaction(async (tx: any) => {
 // 1. Delete associated trainer assignments
 await tx.trainerAssignment.deleteMany({
 where: { groupId: id }
 });

 // 2. Unassign students from this group
 await tx.studentProfile.updateMany({
 where: { trainingGroupId: id },
 data: { trainingGroupId: null }
 });

 // 3. Finally delete the group
 await tx.trainingGroup.delete({
 where: { id }
 });
 });

 // Broadcast deletion
 await broadcastMessage({
 channel: 'admin_updates',
 event: 'training_group_deleted',
 payload: { groupId: id }
 });

 return NextResponse.json({ message: 'Group deleted successfully' });
 } catch (error: any) {
 logger.error('DELETE Group Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
