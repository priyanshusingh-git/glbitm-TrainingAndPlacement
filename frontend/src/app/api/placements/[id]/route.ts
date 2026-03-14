import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { logAudit } from '@/services/audit.service';

// GET /api/placements/[id]
export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STUDENT', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const drive = await prisma.placementDrive.findUnique({
 where: { id },
 include: {
 company: true,
 applications: {
 include: {
 student: {
 include: {
 user: { select: { name: true, email: true } }
 }
 }
 }
 },
 _count: {
 select: { applications: true }
 }
 }
 });

 if (!drive) {
 return NextResponse.json({ error: 'Placement drive not found' }, { status: 404 });
 }

 return NextResponse.json(drive);
 } catch (error) {
 logger.error('GET Placement Drive Error:', error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

// PUT /api/placements/[id]
export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const body = await req.json();
 const { companyId, role, ctc, location, date, eligibilityCriteria, status } = body;

 const updatedDrive = await prisma.placementDrive.update({
 where: { id },
 data: {
 companyId,
 role,
 ctc,
 location,
 date: date ? new Date(date) : undefined,
 eligibilityCriteria,
 status
 },
 include: {
 company: true
 }
 });

 // Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'UPDATE',
 entityType: 'PLACEMENT_DRIVE',
 entityId: id,
 performedById: authResult.id,
 details: { updatedFields: Object.keys(body) },
 ipAddress,
 userAgent
 });

 return NextResponse.json(updatedDrive);
 } catch (error) {
 logger.error('UPDATE Placement Drive Error:', error);
 return NextResponse.json({ error: 'Failed to update placement drive' }, { status: 500 });
 }
}

// PATCH /api/placements/[id] (For status updates)
export async function PATCH(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const { status } = await req.json();

 const updatedDrive = await prisma.placementDrive.update({
 where: { id },
 data: { status }
 });

 // Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'UPDATE',
 entityType: 'PLACEMENT_DRIVE',
 entityId: id,
 performedById: authResult.id,
 details: { action: 'STATUS_CHANGE', newStatus: status },
 ipAddress,
 userAgent
 });

 return NextResponse.json(updatedDrive);
 } catch (error) {
 logger.error('PATCH Placement Drive Status Error:', error);
 return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
 }
}

// DELETE /api/placements/[id]
export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 await prisma.placementDrive.delete({
 where: { id }
 });

 // Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'DELETE',
 entityType: 'PLACEMENT_DRIVE',
 entityId: id,
 performedById: authResult.id,
 details: { deletedDriveId: id },
 ipAddress,
 userAgent
 });

 return NextResponse.json({ message: 'Placement drive deleted successfully' });
 } catch (error) {
 logger.error('DELETE Placement Drive Error:', error);
 return NextResponse.json({ error: 'Failed to delete placement drive' }, { status: 500 });
 }
}
