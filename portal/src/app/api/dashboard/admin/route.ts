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
      where: { status: { in: ['offered', 'placed', 'OFFERED', 'PLACED'] } }
    });

    const avgScoreResult = await prisma.testResult.aggregate({
      _avg: { marksObtained: true }
    });
    const avgScore = Math.round(avgScoreResult._avg.marksObtained || 0);

    const activeCompanies = await prisma.company.count({
      where: { status: 'Active' }
    });

    // 1. Dynamic Monthly Placements & Offers
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const successfulApps = await prisma.application.findMany({
      where: {
        status: { in: ['offered', 'placed', 'OFFERED', 'PLACED'] },
        appliedAt: { gte: sixMonthsAgo }
      },
      select: {
        appliedAt: true
      }
    });

    const allApps = await prisma.application.findMany({
      where: {
        appliedAt: { gte: sixMonthsAgo }
      },
      select: {
        appliedAt: true,
        status: true
      }
    });

    const monthlyDataMap: { [key: string]: { placed: number; offers: number } } = {};
    
    // We want the last 6 months dynamically
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });
      monthlyDataMap[monthLabel] = { placed: 0, offers: 0 };
    }

    successfulApps.forEach((app) => {
      const date = new Date(app.appliedAt);
      const monthLabel = date.toLocaleString('en-US', { month: 'short' });
      if (monthlyDataMap[monthLabel]) {
        monthlyDataMap[monthLabel].placed += 1;
      }
    });

    allApps.forEach((app) => {
      const date = new Date(app.appliedAt);
      const monthLabel = date.toLocaleString('en-US', { month: 'short' });
      if (monthlyDataMap[monthLabel]) {
        const statusLower = app.status.toLowerCase();
        if (statusLower === 'offered' || statusLower === 'placed' || statusLower === 'shortlisted') {
          monthlyDataMap[monthLabel].offers += 1;
        }
      }
    });

    const monthlyData = Object.entries(monthlyDataMap).map(([month, data]) => ({
      month,
      placed: data.placed,
      offers: data.offers
    }));

    // 2. Dynamic Placement Rate
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    // 3. Dynamic Branch/Department Distribution
    const studentsByBranch = await prisma.studentProfile.findMany({
      select: {
        branch: true,
        applications: {
          where: {
            status: { in: ['offered', 'placed', 'OFFERED', 'PLACED'] }
          },
          select: {
            id: true
          }
        }
      }
    });

    const branchCounts: Record<string, { total: number; placed: number }> = {};
    studentsByBranch.forEach((s) => {
      const branch = s.branch || "Other";
      if (!branchCounts[branch]) {
        branchCounts[branch] = { total: 0, placed: 0 };
      }
      branchCounts[branch].total += 1;
      if (s.applications.length > 0) {
        branchCounts[branch].placed += 1;
      }
    });

    const branchDistribution = Object.entries(branchCounts).map(([dept, counts]) => ({
      department: dept,
      placed: counts.placed,
      total: counts.total
    })).sort((a, b) => b.total - a.total).slice(0, 5);

    // 4. Dynamic Recent Activity Feed (Placements, Companies, and Registrations)
    const recentPlacements = await prisma.application.findMany({
      where: { status: { in: ['offered', 'placed', 'OFFERED', 'PLACED'] } },
      take: 3,
      orderBy: { appliedAt: 'desc' },
      include: { student: { select: { name: true } }, drive: { include: { company: true } } }
    });

    const recentCompaniesQuery = await prisma.company.findMany({
      take: 2,
      orderBy: { createdAt: 'desc' },
    });

    const recentUsers = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { studentProfile: true }
    });

    const recentActivities = [
      ...recentPlacements.map((p: any) => ({
        id: `placement-${p.id}`,
        type: "placement",
        message: `${p?.student?.name || "Student"} placed at ${p?.drive?.company?.name || "a company"}`,
        time: p.appliedAt ? new Date(p.appliedAt).toISOString() : new Date().toISOString(),
        icon: "Trophy",
      })),
      ...recentCompaniesQuery.map((c: any) => ({
        id: `company-${c.id}`,
        type: "company",
        message: `${c?.name || "A company"} registered as a placement partner.`,
        time: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        icon: "Building2",
      })),
      ...recentUsers.map((u: any) => ({
        id: `student-${u.id}`,
        type: "student",
        message: `${u.studentProfile?.name || u.name || u.email} registered on the platform.`,
        time: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        icon: "UserPlus",
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

    const companies = await prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { placementDrives: true }
    });

    const companyList = companies.map((c: any) => ({
      id: c.id,
      name: c.name,
      industry: c.industry || "Technology",
      location: c.location || "Remote",
      status: c.status === 'Active' ? "upcoming" : "completed",
      driveDate: c.placementDrives?.[0]?.date ? new Date(c.placementDrives[0].date).toLocaleDateString() : "TBD",
      positions: c.placementDrives?.length || 0,
      package: c.placementDrives?.[0]?.ctc || "TBD"
    }));

    return NextResponse.json({
      overview: {
        totalStudents: totalStudents.toLocaleString(),
        placedStudents: placedStudents.toLocaleString(),
        avgScore: avgScore + "%",
        activeCompanies: activeCompanies,
        placementRate: placementRate
      },
      placementAnalytics: monthlyData,
      branchDistribution: branchDistribution,
      recentActivity: recentActivities,
      companies: companyList
    });

 } catch (error) {
 logger.error("Admin Dashboard Error", error);
 return NextResponse.json({ error:"Failed to fetch admin dashboard data" }, { status: 500 });
 }
}
