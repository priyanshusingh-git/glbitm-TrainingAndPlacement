import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// --- PROJECTS ---
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const projects = await prisma.project.findMany({
 where: { studentId: student.id },
 orderBy: { createdAt: 'desc' }
 });
 return NextResponse.json(projects);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch projects" }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { title, description, techStack, githubLink, liveLink, status, featured } = body;

 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const project = await prisma.project.create({
 data: {
 studentId: student.id,
 title,
 description,
 techStack: Array.isArray(techStack) ? techStack : [],
 githubLink,
 liveLink,
 status,
 featured: Boolean(featured)
 }
 });
 return NextResponse.json(project, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error:"Failed to add project" }, { status: 500 });
 }
}
