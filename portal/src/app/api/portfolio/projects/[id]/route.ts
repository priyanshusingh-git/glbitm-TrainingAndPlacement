import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;
 if (!id) return NextResponse.json({ error:"ID required" }, { status: 400 });

 try {
 const project = await prisma.project.findUnique({ where: { id } });
 if (!project) return NextResponse.json({ error:"Project not found" }, { status: 404 });

 const student = await prisma.studentProfile.findUnique({ where: { id: project.studentId } });
 if (student?.userId !== authResult.id && authResult.role !== 'ADMIN') {
 return NextResponse.json({ error:"Forbidden" }, { status: 403 });
 }

 await prisma.project.delete({ where: { id } });
 return NextResponse.json({ message:"Project deleted" });
 } catch (error) {
 return NextResponse.json({ error:"Failed to delete project" }, { status: 500 });
 }
}
