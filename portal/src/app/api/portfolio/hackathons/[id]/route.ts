import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;
 if (!id) return NextResponse.json({ error:"ID required" }, { status: 400 });

 try {
 const hackathon = await prisma.hackathon.findUnique({ where: { id } });
 if (!hackathon) return NextResponse.json({ error:"Hackathon not found" }, { status: 404 });

 const student = await prisma.studentProfile.findUnique({ where: { id: hackathon.studentId } });
 if (student?.userId !== authResult.id && authResult.role !== 'ADMIN') {
 return NextResponse.json({ error:"Forbidden" }, { status: 403 });
 }

 await prisma.hackathon.delete({ where: { id } });
 return NextResponse.json({ message:"Hackathon deleted" });
 } catch (error) {
 return NextResponse.json({ error:"Failed to delete hackathon" }, { status: 500 });
 }
}
