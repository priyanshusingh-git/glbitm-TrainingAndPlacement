import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['ADMIN']);
 if (authResult instanceof NextResponse) return authResult;

 try {
 const totalStudents = await prisma.studentProfile.count();
 const placedStudents = await prisma.application.count({
 where: { status: 'offered' }
 });

 const avgScoreResult = await prisma.testResult.aggregate({
 _avg: { marksObtained: true }
 });
 const avgScore = Math.round(avgScoreResult._avg.marksObtained || 0);

 const activeCompanies = await prisma.company.count({
 where: { status: 'Active' }
 });

 const monthlyData = [
 { month:"Aug", placed: 0, offers: 0 },
 { month:"Sep", placed: 0, offers: 0 },
 { month:"Oct", placed: 0, offers: 0 },
 { month:"Nov", placed: 0, offers: 0 },
 { month:"Dec", placed: 0, offers: 0 },
 { month:"Jan", placed: 0, offers: 0 },
 ];

 const recentPlacements = await prisma.application.findMany({
 where: { status: 'offered' },
 take: 3,
 orderBy: { appliedAt: 'desc' },
 include: { student: { select: { name: true } }, drive: { include: { company: true } } }
 });

 const recentCompaniesQuery = await prisma.company.findMany({
 take: 2,
 orderBy: { createdAt: 'desc' },
 });

 const recentActivities = [
 ...recentPlacements.map((p: any) => ({
 id: `placement-${p.id}`,
 type:"placement",
 message: `${p.student.name ||"Student"} placed at ${p.drive.company.name}`,
 time: new Date(p.appliedAt).toISOString(),
 icon:"Trophy",
 })),
 ...recentCompaniesQuery.map((c: any) => ({
 id: `company-${c.id}`,
 type:"company",
 message: `${c.name} registered as a placement partner.`,
 time: new Date(c.createdAt).toISOString(),
 icon:"Building2",
 }))
 ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

 const companies = await prisma.company.findMany({
 take: 5,
 orderBy: { createdAt: 'desc' },
 include: { placementDrives: true }
 });

 const companyList = companies.map((c: any) => ({
 id: c.id,
 name: c.name,
 industry: c.industry ||"Technology",
 location: c.location ||"Remote",
 status: c.status === 'Active' ?"upcoming" :"completed",
 driveDate: c.placementDrives[0] ? new Date(c.placementDrives[0].date).toLocaleDateString() :"TBD",
 positions: c.placementDrives.length,
 package: c.placementDrives[0]?.ctc ||"TBD"
 }));

 return NextResponse.json({
 overview: {
 totalStudents: totalStudents.toLocaleString(),
 placedStudents: placedStudents.toLocaleString(),
 avgScore: avgScore +"%",
 activeCompanies: activeCompanies
 },
 placementAnalytics: monthlyData,
 recentActivity: recentActivities,
 companies: companyList
 });

 } catch (error) {
 logger.error("Admin Dashboard Error", error);
 return NextResponse.json({ error:"Failed to fetch admin dashboard data" }, { status: 500 });
 }
}
