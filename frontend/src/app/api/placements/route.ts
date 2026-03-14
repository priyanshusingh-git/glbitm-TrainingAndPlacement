import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';
import { getPlacementDrives, createPlacementDrive } from '@/services/placement.service';

/**
 * GET /api/placements - Fetch all placement drives
 */
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STUDENT', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const drives = await getPlacementDrives();
 return NextResponse.json(drives);
 } catch (error) {
 logger.error("GET Placements Error:", error);
 return NextResponse.json({ error: 'Failed to fetch placement drives' }, { status: 500 });
 }
}

/**
 * POST /api/placements - Create a new placement drive
 */
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { companyId, role, date } = body;

 if (!companyId || !role || !date) {
 return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
 }

 const drive = await createPlacementDrive(body);
 return NextResponse.json(drive, { status: 201 });

 } catch (error) {
 logger.error("POST Placement Drive Error:", error);
 return NextResponse.json({ error: 'Failed to create placement drive' }, { status: 500 });
 }
}
