import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { getStudentTrainingDashboard } from '@/services/training.service';

/**
 * GET /api/training/dashboard/student - Fetch student-specific training dashboard data
 */
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const dashboardData = await getStudentTrainingDashboard(authResult.id);
 return NextResponse.json(dashboardData);
 } catch (error) {
 console.error('Student training dashboard error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
