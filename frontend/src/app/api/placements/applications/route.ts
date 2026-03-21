import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/placements/applications
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { searchParams } = new URL(req.url);
 const driveId = searchParams.get('driveId');
 const status = searchParams.get('status');

 const applications = await prisma.application.findMany({
 where: {
 driveId: driveId || undefined,
 status: status || undefined
 },
 include: {
 student: {
 include: {
 user: { select: { name: true, email: true } }
 }
 },
 drive: {
 include: { company: { select: { name: true } } }
 }
 },
 orderBy: { appliedAt: 'desc' }
 });

 return NextResponse.json(applications);
 } catch (error) {
 logger.error('GET Placement Applications Error:', error);
 return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
 }
}
