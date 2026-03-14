import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { markBulkAttendance } from '@/services/training.service';

/**
 * POST /api/training/attendance/bulk - Mark attendance for multiple students in a session
 */
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { sessionId, records } = body;

 if (!sessionId || !Array.isArray(records)) {
 return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
 }

 const count = await markBulkAttendance(sessionId, records);
 return NextResponse.json({ success: true, count: count.length });
 } catch (error: any) {
 console.error('[BULK_ATTENDANCE_ERROR]', error);
 return NextResponse.json({ error: error.message || 'Server error during bulk update' }, { status: 500 });
 }
}
