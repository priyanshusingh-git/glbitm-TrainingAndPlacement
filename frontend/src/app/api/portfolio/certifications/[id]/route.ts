import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;
 if (!id) return NextResponse.json({ error:"ID required" }, { status: 400 });

 try {
 const certification = await prisma.certification.findUnique({ where: { id } });
 if (!certification) return NextResponse.json({ error:"Certification not found" }, { status: 404 });

 const student = await prisma.studentProfile.findUnique({ where: { id: certification.studentId } });
 // Check ownership: Student can delete their own, Admin can delete any
 if (student?.userId !== authResult.id && authResult.role !== 'ADMIN') {
 return NextResponse.json({ error:"Forbidden" }, { status: 403 });
 }

 await prisma.certification.delete({ where: { id } });
 return NextResponse.json({ message:"Certification deleted" });
 } catch (error) {
 return NextResponse.json({ error:"Failed to delete certification" }, { status: 500 });
 }
}
