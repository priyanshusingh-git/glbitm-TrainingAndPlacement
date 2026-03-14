import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

// GET /api/placements/stats
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const totalDrives = await prisma.placementDrive.count();
 const ongoingDrives = await prisma.placementDrive.count({ where: { status: 'ongoing' } });
 const totalApplications = await prisma.application.count();

 // Count offers (Assuming status 'offered' or similar)
 const totalOffers = await prisma.application.count({
 where: { status: { in: ['offered', 'Offer', 'offered', 'placed'] } }
 });

 // Calculate Average CTC (Simple average of drives with valid CTC)
 const drives = await prisma.placementDrive.findMany({
 select: { ctc: true }
 });

 const ctcValues = drives
 .map(d => parseFloat(d.ctc.replace(/[^0-9.]/g, '')))
 .filter(v => !isNaN(v));

 const averageCTC = ctcValues.length > 0
 ? (ctcValues.reduce((a, b) => a + b, 0) / ctcValues.length).toFixed(2)
 :"0";

 return NextResponse.json({
 totalDrives,
 ongoingDrives,
 totalApplications,
 totalOffers,
 averageCTC: `${averageCTC} LPA`
 });
 } catch (error) {
 logger.error('GET Placement Stats Error:', error);
 return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
 }
}
