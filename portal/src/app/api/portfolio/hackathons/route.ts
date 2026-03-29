import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const hackathons = await prisma.hackathon.findMany({
 where: { studentId: student.id },
 orderBy: { date: 'desc' }
 });
 return NextResponse.json(hackathons);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch hackathons" }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { name, organizer, date, mode, teamName, role, problemStatement, solution, techStack, position, photoUrl, certificateUrl, achievement, description: rawDescription } = body;
 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 let description = rawDescription || '';
 if (problemStatement) description += `\n\nProblem Statement: ${problemStatement}`;
 if (solution) description += `\n\nSolution: ${solution}`;
 if (role) description += `\n\nRole: ${role}`;
 if (teamName) description += `\n\nTeam: ${teamName}`;
 if (techStack && Array.isArray(techStack)) description += `\n\nTech Stack: ${techStack.join(', ')}`;

 let achievementText = achievement || '';
 if (position) achievementText = position + (achievementText ? ` - ${achievementText}` : '');

 const hackathon = await prisma.hackathon.create({
 data: {
 studentId: student.id,
 name,
 organizer,
 date: new Date(date),
 mode,
 description,
 achievement: achievementText,
 certificateUrl: certificateUrl || photoUrl
 }
 });
 return NextResponse.json(hackathon, { status: 201 });
 } catch (error) {
 return NextResponse.json({ error:"Failed to add hackathon" }, { status: 500 });
 }
}
