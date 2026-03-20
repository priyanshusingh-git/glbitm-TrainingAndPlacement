import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { fetchLeetCodeStats, fetchCodeforcesStats } from '@/services/stats.service';

// GET /api/portfolio/coding-profiles
export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const profiles = await prisma.codingProfile.findMany({
 where: { studentId: student.id },
 orderBy: { createdAt: 'desc' }
 });
 return NextResponse.json(profiles);
 } catch (error) {
 return NextResponse.json({ error:"Failed to fetch coding profiles" }, { status: 500 });
 }
}

// POST /api/portfolio/coding-profiles
export async function POST(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const body = await req.json();
 const { platform, username, profileUrl, monthlyGoal, practiceFrequency } = body;

 const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
 if (!student) return NextResponse.json({ error:"Student profile not found" }, { status: 404 });

 const existing = await prisma.codingProfile.findUnique({
 where: {
 studentId_platform: {
 studentId: student.id,
 platform
 }
 }
 });

 if (existing) return NextResponse.json({ error: `Profile for ${platform} already exists` }, { status: 400 });

 let initialStats = {
 totalSolved: 0,
 easy: 0,
 medium: 0,
 hard: 0,
 rating: 0
 };

 if (platform === 'LeetCode') {
 const fetchedStats = await fetchLeetCodeStats(username);
 if (fetchedStats) initialStats = fetchedStats;
 } else if (platform === 'Codeforces') {
 const fetchedStats = await fetchCodeforcesStats(username);
 if (fetchedStats) initialStats = fetchedStats;
 }

 const profile = await prisma.codingProfile.create({
 data: {
 studentId: student.id,
 platform,
 username,
 profileUrl,
 monthlyGoal: Number(monthlyGoal) || 0,
 practiceFrequency,
 statsJSON: JSON.stringify(initialStats)
 }
 });

 return NextResponse.json(profile, { status: 201 });

 } catch (error) {
 logger.error("Add Coding Profile Error:", error);
 return NextResponse.json({ error:"Failed to add coding profile" }, { status: 500 });
 }
}
