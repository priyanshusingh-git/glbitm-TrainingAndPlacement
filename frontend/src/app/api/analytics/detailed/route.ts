import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN', 'STAFF']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 // Run independent aggregations in parallel
 const [
 totalStudents,
 totalPlaced,
 activeCompanies,
 offeredDrives,
 allStudents,
 allApplicationsOffered,
 studentsWithSkills
 ] = await Promise.all([
 prisma.studentProfile.count(),
 prisma.application.count({ where: { status: 'offered' } }),
 prisma.company.count({ where: { status: 'Active' } }),
 prisma.application.findMany({
 where: { status: 'offered' },
 include: { drive: { select: { ctc: true } } }
 }),
 prisma.studentProfile.findMany({
 select: { id: true, branch: true }
 }),
 prisma.application.findMany({
 where: { status: 'offered' },
 select: { studentId: true }
 }),
 prisma.studentProfile.findMany({
 select: { skills: true }
 })
 ]);

 // 1. Core Stats
 const placementRate = totalStudents > 0
 ? ((totalPlaced / totalStudents) * 100).toFixed(1) + '%'
 : '0%';

 let totalPackage = 0;
 let packageCount = 0;
 for (const app of offeredDrives) {
 const ctc = parseFloat(app.drive?.ctc || '0');
 if (ctc > 0) {
 totalPackage += ctc;
 packageCount++;
 }
 }
 const avgPackage = packageCount > 0
 ? (totalPackage / packageCount).toFixed(1) + ' LPA'
 : '0 LPA';

 // 2. Department-wise placement data
 const placedStudentIds = new Set(allApplicationsOffered.map(a => a.studentId));
 const deptMap: Record<string, { total: number; placed: number }> = {};

 for (const s of allStudents) {
 const dept = s.branch || 'Unknown';
 if (!deptMap[dept]) deptMap[dept] = { total: 0, placed: 0 };
 deptMap[dept].total++;
 if (placedStudentIds.has(s.id)) deptMap[dept].placed++;
 }

 const placementData = Object.entries(deptMap).map(([dept, data]) => ({
 dept,
 placed: data.placed,
 total: data.total
 }));

 // 3. Skills data
 const skillCount: Record<string, number> = {};
 for (const s of studentsWithSkills) {
 if (Array.isArray(s.skills)) {
 for (const skill of s.skills) {
 const name = (skill as string).trim();
 if (name) {
 skillCount[name] = (skillCount[name] || 0) + 1;
 }
 }
 }
 }
 const skillsData = Object.entries(skillCount)
 .sort((a, b) => b[1] - a[1])
 .slice(0, 10)
 .map(([name, students]) => ({ name, students }));

 // 4. Salary distribution
 const salaryRanges = [
 { range: '0-3 LPA', min: 0, max: 3 },
 { range: '3-6 LPA', min: 3, max: 6 },
 { range: '6-10 LPA', min: 6, max: 10 },
 { range: '10-15 LPA', min: 10, max: 15 },
 { range: '15+ LPA', min: 15, max: Infinity },
 ];
 const salaryData = salaryRanges.map(r => {
 const count = offeredDrives.filter(app => {
 const ctc = parseFloat(app.drive?.ctc || '0');
 return ctc >= r.min && ctc < r.max;
 }).length;
 return { range: r.range, count };
 });

 // 5. Yearly trend
 const yearlyTrend = [
 {
 year: new Date().getFullYear().toString(),
 percentage: totalStudents > 0 ? Math.round((totalPlaced / totalStudents) * 100) : 0,
 avgPackage: packageCount > 0 ? parseFloat((totalPackage / packageCount).toFixed(1)) : 0,
 }
 ];

 return NextResponse.json({
 stats: {
 totalPlaced,
 placementRate,
 avgPackage,
 companiesCount: activeCompanies,
 },
 placementData,
 skillsData,
 salaryData,
 yearlyTrend,
 });

 } catch (error) {
 logger.error("Analytics Detailed Error", error);
 return NextResponse.json({ error:"Failed to fetch analytics data" }, { status: 500 });
 }
}
