import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 const session = await prisma.trainingSession.findUnique({
 where: { id },
 include: {
 sessionGroups: {
 include: {
 students: {
 select: { id: true, name: true, rollNo: true }
 }
 }
 },
 trainer: {
 select: { id: true, name: true, email: true }
 },
 attendances: true
 }
 });

 if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
 return NextResponse.json({
 ...session,
 group: session.sessionGroups?.[0] ?? null
 });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

export async function DELETE(
 req: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 const { id } = await params;

 try {
 await prisma.trainingSession.delete({
 where: { id }
 });

 return NextResponse.json({ message: 'Session deleted successfully' });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
