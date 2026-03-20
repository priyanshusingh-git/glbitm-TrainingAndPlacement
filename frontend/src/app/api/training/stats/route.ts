import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { getTrainingStats } from '@/services/training.service';

/**
 * GET /api/training/stats - Fetch high-level training statistics
 */
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const stats = await getTrainingStats();
 return NextResponse.json(stats);
 } catch (error) {
 console.error('Training stats error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
