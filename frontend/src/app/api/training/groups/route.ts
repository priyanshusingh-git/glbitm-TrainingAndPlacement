import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { broadcastMessage } from '@/lib/realtime';

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const groups = await prisma.trainingGroup.findMany({
 include: {
 trainers: {
 include: {
 trainer: { select: { name: true, email: true, id: true } }
 }
 },
 _count: {
 select: { students: true }
 }
 },
 orderBy: { createdAt: 'desc' }
 });
 return NextResponse.json(groups);
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { name, branch, branches, year, description } = body;

 let targetBranches = branches || (branch ? [branch] : []);
 if (targetBranches.length === 0) {
 return NextResponse.json({ error: 'At least one branch is required' }, { status: 400 });
 }

 const groupsData = targetBranches.map((b: string) => ({
 name,
 branch: b,
 year,
 description
 }));

 await prisma.trainingGroup.createMany({
 data: groupsData,
 skipDuplicates: true
 });

 // Sync with Master list
 await prisma.trainingGroupMaster.upsert({
 where: { name: name },
 update: {}, // No update needed if exists
 create: {
 name: name,
 // Assign order as max + 1 (simplified approach, could be improved)
 order: await prisma.trainingGroupMaster.count()
 }
 });

 const createdGroups = await prisma.trainingGroup.findMany({
 where: {
 name,
 year,
 branch: { in: targetBranches }
 },
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

 // Broadcast creation individually
 for (const group of createdGroups) {
 await broadcastMessage({
 channel: 'admin_updates',
 event: 'training_group_created',
 payload: { groupId: group.id }
 });
 }

 return NextResponse.json(createdGroups.length === 1 && branch ? createdGroups[0] : createdGroups, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
