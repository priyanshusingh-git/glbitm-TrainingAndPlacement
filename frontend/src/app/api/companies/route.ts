import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF', 'STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const companies = await prisma.company.findMany({
 orderBy: { name: 'asc' },
 include: {
 _count: {
 select: { placementDrives: true }
 }
 }
 });

 // Map it to include"hires" if we want a more detailed count later, 
 // for now just return the count of drives as a placeholder for activity.
 const mappedCompanies = companies.map(c => ({
 ...c,
 hires: c._count.placementDrives // Placeholder until we have a real hires count
 }));

 return NextResponse.json(mappedCompanies);
 } catch (error) {
 logger.error('GET Companies Error:', error);
 return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
 }
}

export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { name, industry, location, website, contactPerson, email, phone, status } = body;

 if (!name) {
 return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
 }

 const company = await prisma.company.create({
 data: {
 name,
 industry,
 location,
 website,
 contactPerson,
 email,
 phone,
 status: status || 'Active'
 }
 });

 return NextResponse.json(company, { status: 201 });
 } catch (error) {
 logger.error('POST Company Error:', error);
 return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
 }
}
