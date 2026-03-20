import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// GET /api/training/sessions/[id]/attendance
// Returns students in the group with their attendance status for this session
export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id: sessionId } = await params;

 // 1. Get the session and linked groups
 const session = await prisma.trainingSession.findUnique({
 where: { id: sessionId },
 include: {
 sessionGroups: {
 include: {
 students: {
 select: {
 id: true,
 name: true,
 admissionId: true,
 branch: true,
 user: { select: { email: true } }
 },
 orderBy: { admissionId: 'asc' }
 }
 }
 }
 }
 });

 if (!session) {
 return NextResponse.json({ error: 'Session not found' }, { status: 404 });
 }

 if (session.sessionGroups.length === 0) {
 return NextResponse.json({ error: 'No groups assigned to this session' }, { status: 400 });
 }

 // 2. Flatten and dedupe students across all linked groups
 const studentsMap = new Map<string, any>();
 for (const group of session.sessionGroups) {
 for (const student of group.students) {
 if (!studentsMap.has(student.id)) {
 studentsMap.set(student.id, student);
 }
 }
 }
 const students = Array.from(studentsMap.values());

 // 3. Get existing attendance records for this session
 const existingAttendance = await prisma.attendance.findMany({
 where: { sessionId }
 });

 // 4. Merge students with attendance
 const attendanceList = students.map(student => {
 const attendance = existingAttendance.find(a => a.studentId === student.id);
 return {
 ...student,
 attendance: attendance ? {
 id: attendance.id,
 status: attendance.status
 } : null
 };
 });

 return NextResponse.json(attendanceList);
 } catch (error) {
 console.error(error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// POST /api/training/sessions/[id]/attendance
// Marks attendance for students in bulk
export async function POST(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id: sessionId } = await params;
 const body = await req.json();
 const { attendances } = body; // Expected array: { studentId: string, status: string }

 if (!Array.isArray(attendances)) {
 return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
 }

 const session = await prisma.trainingSession.findUnique({
 where: { id: sessionId },
 select: { date: true }
 });

 if (!session) {
 return NextResponse.json({ error: 'Session not found' }, { status: 404 });
 }

 // Perform bulk upsert in a transaction
 await prisma.$transaction(
 attendances.map(a =>
 prisma.attendance.upsert({
 where: {
 studentId_sessionId: {
 studentId: a.studentId,
 sessionId: sessionId
 }
 },
 update: {
 status: a.status,
 date: session.date
 },
 create: {
 studentId: a.studentId,
 sessionId: sessionId,
 status: a.status,
 date: session.date
 }
 })
 )
 );

 return NextResponse.json({ message: 'Attendance marked successfully' });
 } catch (error) {
 console.error(error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
