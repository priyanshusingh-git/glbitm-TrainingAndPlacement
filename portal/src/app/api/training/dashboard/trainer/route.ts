import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { getTrainerTrainingDashboard } from '@/services/training.service';

/**
 * GET /api/training/dashboard/trainer - Fetch trainer-specific training dashboard data
 */
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['TRAINER']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const dashboardData = await getTrainerTrainingDashboard(authResult.id);
 return NextResponse.json(dashboardData);
 } catch (error) {
 console.error('Trainer training dashboard error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
