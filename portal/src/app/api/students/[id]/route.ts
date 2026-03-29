import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';
import { getStudentById, updateStudent, deleteStudent } from '@/services/student.service';

/**
 * GET /api/students/[id] - Fetch a single student profile
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const student = await getStudentById(id);
 if (!student) {
 return NextResponse.json({ error: 'Student not found' }, { status: 404 });
 }
 return NextResponse.json(student);
 } catch (error: any) {
 logger.error('Get Student Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

/**
 * PUT /api/students/[id] - Update a student profile
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const body = await req.json();
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;

 const student = await updateStudent(id, body, authResult.id, { ipAddress, userAgent });
 return NextResponse.json(student);
 } catch (error: any) {
 logger.error('Update Student Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

/**
 * DELETE /api/students/[id] - Delete a student profile and auth account
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const result = await deleteStudent(id);
 return NextResponse.json(result);
 } catch (error: any) {
 logger.error('Delete Student Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

