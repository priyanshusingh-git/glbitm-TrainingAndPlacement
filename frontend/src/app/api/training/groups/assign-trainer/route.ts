import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { groupId, trainerId, type } = body;
 const assignment = await prisma.trainerAssignment.upsert({
 where: {
 groupId_type: {
 groupId,
 type
 }
 },
 update: { trainerId },
 create: { groupId, trainerId, type }
 });
 return NextResponse.json(assignment);
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

export async function DELETE(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { searchParams } = new URL(req.url);
 const assignmentId = searchParams.get('id');

 if (!assignmentId) {
 return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 });
 }

 await prisma.trainerAssignment.delete({
 where: { id: assignmentId }
 });

 return NextResponse.json({ message: 'Assignment removed' });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
