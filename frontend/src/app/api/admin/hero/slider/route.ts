import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';

// GET all slider items (for admin management)
export async function GET(req: NextRequest) {
 console.log('[GET_SLIDER] Starting...');
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) {
 console.log('[GET_SLIDER] Authorization failed');
 return authResult;
 }

 try {
 const slides = await prisma.heroSlider.findMany({
 orderBy: { order: 'asc' }
 });
 console.log(`[GET_SLIDER] Found ${slides.length} slides`);
 return NextResponse.json(slides);
 } catch (error) {
 console.error('[GET_SLIDER_ERROR]', error);
 return NextResponse.json({ error: 'Failed to fetch slides', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
 }
}

// POST create a new slider item
export async function POST(req: NextRequest) {
 console.log('[POST_SLIDER] Starting...');
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) {
 console.log('[POST_SLIDER] Authorization failed');
 return authResult;
 }

 try {
 const body = await req.json();
 console.log('[POST_SLIDER] Request body:', body);
 const { imageUrl, title, subtitle, order } = body;

 if (!imageUrl) {
 return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
 }

 const newSlide = await prisma.heroSlider.create({
 data: {
 imageUrl,
 title,
 subtitle,
 order: order || 0,
 isActive: true
 }
 });

 console.log('[POST_SLIDER] Successfully created slide:', newSlide.id);
 return NextResponse.json(newSlide);
 } catch (error) {
 console.error('[POST_SLIDER_ERROR]', error);
 return NextResponse.json({ error: 'Failed to create slide', detail: error instanceof Error ? error.message : String(error) }, { status: 500 });
 }
}

// PUT update a slider item
export async function PUT(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { id, imageUrl, title, subtitle, order, isActive } = body;

 if (!id) {
 return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
 }

 const updatedSlide = await prisma.heroSlider.update({
 where: { id },
 data: {
 imageUrl,
 title,
 subtitle,
 order,
 isActive
 }
 });

 return NextResponse.json(updatedSlide);
 } catch (error) {
 return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
 }
}

// DELETE a slider item
export async function DELETE(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const { searchParams } = new URL(req.url);
 const id = searchParams.get('id');

 if (!id) {
 return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
 }

 await prisma.heroSlider.delete({
 where: { id }
 });

 return NextResponse.json({ success: true });
 } catch (error) {
 return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
 }
}
