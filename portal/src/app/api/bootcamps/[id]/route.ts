import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// PUT /api/bootcamps/[id]
export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 const body = await req.json();
 const { title, description, date, groupIds } = body;

 const updatedBootcamp = await prisma.bootcamp.update({
 where: { id },
 data: {
 title,
 description,
 date: date ? new Date(date) : undefined,
 assignedGroups: groupIds ? {
 set: groupIds.map((id: string) => ({ id }))
 } : undefined
 }
 });

 return NextResponse.json(updatedBootcamp);
 } catch (error) {
 console.error(error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// DELETE /api/bootcamps/[id]
export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 await prisma.bootcamp.delete({ where: { id } });
 return NextResponse.json({ message: 'Bootcamp deleted successfully' });
 } catch (error) {
 console.error(error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
