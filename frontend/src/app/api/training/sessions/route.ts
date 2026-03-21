import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import { getTrainingSessions, createTrainingSessions } from '@/services/training.service';

/**
 * GET /api/training/sessions - Fetch training sessions with filters
 */
export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { searchParams } = new URL(req.url);
 const groupId = searchParams.get('groupId') || undefined;
 const trainerId = searchParams.get('trainerId') || undefined;

 try {
 const sessions = await getTrainingSessions({ groupId, trainerId });
 return NextResponse.json(sessions);
 } catch (error: any) {
 console.error('Session fetch error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

/**
 * POST /api/training/sessions - Create training sessions (optionally recurring)
 */
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const createdSessions = await createTrainingSessions(body);
 return NextResponse.json(createdSessions, { status: 201 });
 } catch (error: any) {
 console.error('Session creation error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
