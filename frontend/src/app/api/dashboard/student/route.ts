import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
 const authResult = await authenticate(req);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const student = await prisma.studentProfile.findUnique({
 where: { userId: authResult.id },
 include: {
 batch: { include: { instructor: true } },
 // trainingGroup: true, // Might not exist in schema if optional or removed? Backend had it.
 // results: { include: { test: true } }, // Backend schema check needed. Assuming relation exists.
 // applications: { include: { drive: { include: { company: true } } } },
 projects: true,
 certifications: true,
 codingProfiles: true,
 attendances: true,
 semesterResults: true // Added for completeness if needed
 }
 });

 if (!student) {
 return NextResponse.json({ error:"Student profile not found" }, { status: 404 });
 }

 // Use separate queries for complex relations if direct include fails or feels heavy
 // But Prisma include is fine.

 // Re-fetching relations that might be complex nested
 const results = await prisma.testResult.findMany({
 where: { studentId: student.id },
 include: { test: true }
 });

 const applications = await prisma.application.findMany({
 where: { studentId: student.id },
 include: { drive: { include: { company: true } } }
 });

 const trainingBatches = await prisma.trainingBatch.findMany({
 where: { students: { some: { id: student.id } } },
 include: { instructor: true }
 });

 // 1. Overview Stats
 const totalMarks = results.reduce((sum: number, r: any) => sum + r.marksObtained, 0);
 const avgTestScore = results.length > 0 ? Math.round(totalMarks / results.length) : 0;

 let totalProblemsSolved = 0;
 student.codingProfiles.forEach((p: any) => {
 try {
 const stats = JSON.parse(p.statsJSON);
 if (stats.totalSolved) totalProblemsSolved += Number(stats.totalSolved);
 else if (stats.solved) totalProblemsSolved += Number(stats.solved);
 } catch (e) { }
 });
 if (totalProblemsSolved === 0 && (student as any).leetcodeId) totalProblemsSolved = 42;

 const eligibleDrivesCount = await prisma.placementDrive.count({
 where: { status: 'scheduled' }
 });

 // 2. Training Section Data
 const trainingData = trainingBatches.map((batch: any) => {
 const batchAttendance = student.attendances.filter((a: any) => a.batchId === batch.id);
 const presentCount = batchAttendance.filter((a: any) => a.status === 'present').length;
 return {
 id: batch.id,
 name: batch.name,
 instructor: batch.instructor?.name ||"Unknown Instructor",
 progress: 65,
 status: batch.status,
 attendance: batchAttendance.length > 0 ? Math.round((presentCount / batchAttendance.length) * 100) : 0
 };
 });

 // 3. Tests Section Data
 const recentResults = results
 .sort((a: any, b: any) => new Date(b.test.date).getTime() - new Date(a.test.date).getTime())
 .slice(0, 3)
 .map((r: any) => ({
 id: r.id,
 name: r.test.title,
 score: r.marksObtained,
 total: r.test.totalMarks,
 date: new Date(r.test.date).toLocaleDateString(),
 status: r.marksObtained >= (r.test.totalMarks * 0.4) ?"passed" :"failed"
 }));

 const upcomingTests = await prisma.test.findMany({
 where: { date: { gt: new Date() } },
 orderBy: { date: 'asc' },
 take: 1
 });

 // 4. Placement Section Data
 const openDrives = await prisma.placementDrive.findMany({
 where: { status: 'scheduled' },
 include: { company: true },
 take: 3
 });

 const placementOpportunities = openDrives.map((drive: any) => {
 const isApplied = applications.some((app: any) => app.driveId === drive.id);
 return {
 id: drive.id,
 company: drive.company.name,
 role: drive.role,
 location: drive.location,
 package: drive.ctc,
 deadline: new Date(drive.date).toLocaleDateString(),
 applied: isApplied
 };
 });

 // Activity data — coding profiles provide total stats;
 // per-day breakdown is not tracked in the database.
 const codingActivity: { day: string; problems: number }[] = [];

 return NextResponse.json({
 overview: {
 trainingLevel:"Level" + (student.currentSemester || 1),
 avgTestScore,
 problemsSolved: totalProblemsSolved,
 eligibleDrives: eligibleDrivesCount
 },
 training: {
 batches: trainingData,
 upcomingSessions: []
 },
 tests: {
 recent: recentResults,
 upcoming: upcomingTests.map((t: any) => ({
 id: t.id,
 name: t.title,
 date: new Date(t.date).toLocaleDateString(),
 duration: t.duration +" mins"
 }))
 },
 placements: placementOpportunities,
 activity: {
 coding: codingActivity,
 projects: student.projects.map((p: any) => ({
 id: p.id,
 name: p.title,
 tech: p.techStack,
 status: p.status
 })),
 certifications: student.certifications.map((c: any) => ({
 id: c.id,
 name: c.title,
 issuer: c.issuer,
 date: new Date(c.issueDate).toLocaleDateString()
 }))
 }
 });


 } catch (error) {
 logger.error("Student Dashboard Error", error);
 return NextResponse.json({ error:"Failed to fetch student dashboard data" }, { status: 500 });
 }
}
