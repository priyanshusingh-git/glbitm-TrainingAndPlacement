import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// GET /api/bootcamps
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF', 'TRAINER', 'STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const bootcamps = await prisma.bootcamp.findMany({
 include: {
 createdBy: { select: { name: true, email: true } },
 assignedGroups: { select: { id: true, name: true } }
 },
 orderBy: { date: 'desc' }
 });
 return NextResponse.json(bootcamps);
 } catch (error) {
 console.error(error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// POST /api/bootcamps
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { title, description, date, groupIds } = body;

 if (!title || !description || !date) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 const bootcamp = await prisma.bootcamp.create({
 data: {
 title,
 description,
 date: new Date(date),
 createdById: authResult.id,
 assignedGroups: groupIds && groupIds.length > 0 ? {
 connect: groupIds.map((id: string) => ({ id }))
 } : undefined
 },
 include: {
 createdBy: { select: { name: true } },
 assignedGroups: true
 }
 });

 return NextResponse.json(bootcamp);
 } catch (error) {
 console.error(error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
