import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';
import { getStudents, createStudent } from '@/services/student.service';

/**
 * GET /api/students - Fetch all students
 */
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const students = await getStudents();
 return NextResponse.json(students);
 } catch (error) {
 logger.error("Get All Students Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

/**
 * POST /api/students - Create a new student profile and auth account
 */
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const student = await createStudent(body);

 return NextResponse.json({
 message: 'Student created successfully',
 student,
 warning: !student.emailSent ? 'Email failed to send' : undefined
 }, { status: 201 });

 } catch (error: any) {
 logger.error("Create Student Error:", error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
