import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { logAudit } from '@/services/audit.service';

export async function GET(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 if (authResult.role !== 'ADMIN') {
 return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 }

 const trainer = await prisma.user.findUnique({
 where: { id: id, role: 'TRAINER' },
 include: {
 trainerProfile: true
 }
 });

 if (!trainer) {
 return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
 }

 return NextResponse.json(trainer);
 } catch (error: any) {
 logger.error('GET Trainer Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

export async function PUT(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 const body = await req.json();
 const {
 name,
 email,
 trainerType,
 specialization,
 department,
 mobileNo,
 experience
 } = body;

 const updatedTrainer = await prisma.user.update({
 where: { id: id, role: 'TRAINER' },
 data: {
 name,
 email,
 trainerProfile: {
 upsert: {
 create: { trainerType, specialization, department, mobileNo, experience },
 update: { trainerType, specialization, department, mobileNo, experience }
 }
 }
 },
 include: {
 trainerProfile: true
 }
 });

 // Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'UPDATE',
 entityType: 'TRAINER',
 entityId: id,
 performedById: authResult.id,
 details: { updatedFields: Object.keys(body) },
 ipAddress,
 userAgent
 });

 return NextResponse.json(updatedTrainer);
 } catch (error: any) {
 logger.error('Update Trainer Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { id } = await params;
 logger.info(`DELETE Trainer Request for ID: ${id}`);

 if (!id) {
 return NextResponse.json({ error: 'Trainer ID is required' }, { status: 400 });
 }

 // 1. Delete from Prisma (Cascades to TrainerProfile)
 await prisma.user.delete({
 where: { id: id, role: 'TRAINER' }
 });

 // 2. Delete from Firebase Auth
 const { authAdmin } = await import('@/lib/firebase-admin');
 try {
 await authAdmin.deleteUser(id);
 } catch (authError: any) {
 logger.error('Firebase Delete Trainer Warning:', authError);
 }

 // 3. Audit Log
 const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
 const userAgent = req.headers.get('user-agent') || undefined;
 await logAudit({
 action: 'DELETE',
 entityType: 'TRAINER',
 entityId: id,
 performedById: authResult.id,
 details: { deletedTrainerId: id },
 ipAddress,
 userAgent
 });

 return NextResponse.json({ message: 'Trainer deleted successfully' });
 } catch (error: any) {
 logger.error('Delete Trainer Error:', error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
