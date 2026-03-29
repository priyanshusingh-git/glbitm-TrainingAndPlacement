import { NextRequest, NextResponse } from 'next/server';
import { authenticate, authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 // Auto-seed if empty (Self-healing for existing data)
 const count = await prisma.trainingGroupMaster.count();
 if (count === 0) {
 const distinctGroups = await prisma.trainingGroup.findMany({
 distinct: ['name'],
 select: { name: true },
 orderBy: { name: 'asc' }
 });

 if (distinctGroups.length > 0) {
 await prisma.$transaction(
 distinctGroups.map((g, i) =>
 prisma.trainingGroupMaster.create({
 data: { name: g.name, order: i }
 })
 )
 );
 }
 }

 const masters = await prisma.trainingGroupMaster.findMany({
 orderBy: { order: 'asc' }
 });
 return NextResponse.json(masters);
 } catch (error) {
 console.error("Group Masters Error:", error);
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}

export async function PUT(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { masters } = body; // Expecting array of { id, order }

 if (!Array.isArray(masters)) {
 return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
 }

 // Transaction to update orders
 await prisma.$transaction(
 masters.map((m: any) =>
 prisma.trainingGroupMaster.update({
 where: { id: m.id },
 data: { order: m.order }
 })
 )
 );

 return NextResponse.json({ message: 'Order updated' });
 } catch (error) {
 return NextResponse.json({ error: 'Server error' }, { status: 500 });
 }
}
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { name } = body;

 // Validation for name
 if (!name || typeof name !== 'string' || name.trim().length === 0) {
 return NextResponse.json({ error: 'Valid name is required' }, { status: 400 });
 }

 const normalizedName = name.trim().toUpperCase();

 const existing = await prisma.trainingGroupMaster.findUnique({
 where: { name: normalizedName }
 });

 if (existing) {
 return NextResponse.json({ error: 'Identity already exists' }, { status: 409 });
 }

 // Get max order to append
 const maxOrder = await prisma.trainingGroupMaster.aggregate({
 _max: { order: true }
 });
 const nextOrder = (maxOrder._max.order ?? -1) + 1;

 const newMaster = await prisma.trainingGroupMaster.create({
 data: {
 name: normalizedName,
 order: nextOrder
 }
 });

 return NextResponse.json(newMaster, { status: 201 });
 } catch (error: any) {
 console.error("Create Master Error:", error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}

export async function DELETE(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { searchParams } = new URL(req.url);
 const id = searchParams.get('id');

 if (!id) {
 return NextResponse.json({ error: 'ID is required' }, { status: 400 });
 }

 const master = await prisma.trainingGroupMaster.findUnique({ where: { id } });
 if (!master) {
 return NextResponse.json({ error: 'Identity not found' }, { status: 404 });
 }

 // Check for usage
 const usageCount = await prisma.trainingGroup.count({
 where: { name: master.name }
 });

 if (usageCount > 0) {
 return NextResponse.json({
 error: `Cannot delete: ${usageCount} existing group(s) are using this identity. Please reassign or delete them first.`
 }, { status: 400 });
 }

 await prisma.trainingGroupMaster.delete({ where: { id } });

 return NextResponse.json({ message: 'Identity deleted successfully' });
 } catch (error: any) {
 console.error("Delete Master Error:", error);
 return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
 }
}
