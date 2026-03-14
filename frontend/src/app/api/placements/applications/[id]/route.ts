import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { logAudit } from '@/services/audit.service';

// PATCH /api/placements/applications/[id]
export async function PATCH(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const { status } = await req.json();

 const updatedApplication = await prisma.application.update({
 where: { id },
 data: { status },
 include: {
 student: { select: { user: { select: { name: true } } } },
 drive: { select: { role: true, company: { select: { name: true } } } }
 }
 });

 // Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'UPDATE',
 entityType: 'PLACEMENT_DRIVE', // Using general entity type
 entityId: updatedApplication.driveId,
 performedById: authResult.id,
 details: {
 action: 'APPLICATION_STATUS_UPDATE',
 applicationId: id,
 studentName: updatedApplication.student.user?.name,
 newStatus: status
 },
 ipAddress,
 userAgent
 });

 return NextResponse.json(updatedApplication);
 } catch (error) {
 logger.error('PATCH Placement Application Status Error:', error);
 return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
 }
}
