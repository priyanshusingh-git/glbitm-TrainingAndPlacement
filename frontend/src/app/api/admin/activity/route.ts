import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { searchParams } = new URL(req.url);
 const limit = parseInt(searchParams.get('limit') || '50');
 const offset = parseInt(searchParams.get('offset') || '0');

 const logs = await prisma.auditLog.findMany({
 take: limit,
 skip: offset,
 orderBy: { createdAt: 'desc' },
 include: {
 performedBy: {
 select: {
 name: true,
 email: true,
 role: true
 }
 }
 }
 });

 const total = await prisma.auditLog.count();

 return NextResponse.json({
 logs,
 total,
 limit,
 offset
 });
 } catch (error) {
 logger.error('GET Audit Logs Error:', error);
 return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
 }
}
