import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const certifications = await prisma.certification.findMany({
 where: { studentId: student.id },
 orderBy: { issueDate: 'desc' }
 });
 return NextResponse.json(certifications);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch certifications" }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { title, issuer, issueDate, credentialUrl, credentialId } = body;

 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const certification = await prisma.certification.create({
 data: {
 studentId: student.id,
 name: title, // Map title to name as per schema
 issuer,
 issueDate: new Date(issueDate),
 expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
 credentialUrl,
 credentialId
 }
 });
 return NextResponse.json(certification, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error:"Failed to add certification" }, { status: 500 });
 }
}
