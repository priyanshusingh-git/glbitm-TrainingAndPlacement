import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;
 if (!id) return NextResponse.json({ error:"ID required" }, { status: 400 });

 try {
 // Only allow student to delete their own profile (or admin)
 // Check ownership
 const profile = await prisma.codingProfile.findUnique({ where: { id } });
 if (!profile) return NextResponse.json({ error:"Profile not found" }, { status: 404 });

 // Verify ownership via studentId -> userId
 const student = await prisma.studentProfile.findUnique({ where: { id: profile.studentId } });
 if (student?.userId !== authResult.id && authResult.role !== 'ADMIN') {
 return NextResponse.json({ error:"Forbidden" }, { status: 403 });
 }

 await prisma.codingProfile.delete({ where: { id } });
 return NextResponse.json({ message:"Profile deleted" });

 } catch (error) {
 return NextResponse.json({ error:"Failed to delete coding profile" }, { status: 500 });
 }
}
