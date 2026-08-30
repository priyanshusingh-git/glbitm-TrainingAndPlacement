import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

// Local L1 Cache for Student Dashboard Global (user-independent) Queries
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const dashboardCache = {
  eligibleDrivesCount: null as CacheEntry<number> | null,
  upcomingTests: null as CacheEntry<any[]> | null,
  openDrives: null as CacheEntry<any[]> | null,
};

const CACHE_TTL_MS = 30000; // 30 seconds cache

async function getCachedEligibleDrivesCount() {
  const now = Date.now();
  if (dashboardCache.eligibleDrivesCount && dashboardCache.eligibleDrivesCount.expiresAt > now) {
    return dashboardCache.eligibleDrivesCount.data;
  }
  const data = await prisma.placementDrive.count({
    where: { status: 'scheduled' }
  });
  dashboardCache.eligibleDrivesCount = { data, expiresAt: now + CACHE_TTL_MS };
  return data;
}

async function getCachedUpcomingTests() {
  const now = Date.now();
  if (dashboardCache.upcomingTests && dashboardCache.upcomingTests.expiresAt > now) {
    return dashboardCache.upcomingTests.data;
  }
  const data = await prisma.test.findMany({
    where: { date: { gt: new Date() } },
    orderBy: { date: 'asc' },
    take: 1
  });
  dashboardCache.upcomingTests = { data, expiresAt: now + CACHE_TTL_MS };
  return data;
}

async function getCachedOpenDrives() {
  const now = Date.now();
  if (dashboardCache.openDrives && dashboardCache.openDrives.expiresAt > now) {
    return dashboardCache.openDrives.data;
  }
  const data = await prisma.placementDrive.findMany({
    where: { status: 'scheduled' },
    include: { company: true },
    take: 3
  });
  dashboardCache.openDrives = { data, expiresAt: now + CACHE_TTL_MS };
  return data;
}

export async function GET(req: NextRequest) {
 const authResult = await authorize(req, ['STUDENT']);
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
    // 1.1 CGPA Calculation (Profile CGPA or Semester Results Average)
    let cgpaValue = (student as any).cgpa;
    if ((!cgpaValue || cgpaValue === 0) && student.semesterResults && student.semesterResults.length > 0) {
      const validSgpas = student.semesterResults
        .map((r) => r.sgpa)
        .filter((s): s is number => typeof s === 'number' && s > 0);
      if (validSgpas.length > 0) {
        cgpaValue = validSgpas.reduce((a, b) => a + b, 0) / validSgpas.length;
      }
    }
    const formattedCgpa = cgpaValue && cgpaValue > 0 ? cgpaValue.toFixed(2) : "0.00";

    // 1.2 Attendance Percentage (From attendance logs or stored percentage)
    let attendancePct: number | null = null;
    if (student.attendances && student.attendances.length > 0) {
      const presentCount = student.attendances.filter(
        (a: any) => a.status?.toLowerCase() === 'present'
      ).length;
      attendancePct = Math.round((presentCount / student.attendances.length) * 100);
    } else if ((student as any).attendancePercentage !== null && (student as any).attendancePercentage !== undefined) {
      attendancePct = Math.round((student as any).attendancePercentage);
    }

    // 1.3 Test Scores (Accurate aggregate percentage)
    const totalMarksObtained = results.reduce((sum: number, r: any) => sum + (r.marksObtained || 0), 0);
    const totalMaxMarks = results.reduce((sum: number, r: any) => sum + (r.test?.totalMarks || 100), 0);
    const avgTestScore = results.length > 0 && totalMaxMarks > 0
      ? Math.round((totalMarksObtained / totalMaxMarks) * 100)
      : 0;

    // 1.4 Coding Problems Solved (Sum from all linked coding profiles)
    let totalProblemsSolved = 0;
    student.codingProfiles.forEach((p: any) => {
      try {
        const stats = typeof p.statsJSON === 'string' ? JSON.parse(p.statsJSON) : p.statsJSON;
        if (stats?.totalSolved) totalProblemsSolved += Number(stats.totalSolved) || 0;
        else if (stats?.solved) totalProblemsSolved += Number(stats.solved) || 0;
        else if (stats?.publicRepos) totalProblemsSolved += Number(stats.publicRepos) || 0;
      } catch (e) { }
    });

    // 1.5 Profile Completeness Score Calculation
    let completedPoints = 0;
    const totalPoints = 8;
    if (student.name && (student as any).branch) completedPoints++;
    if ((student as any).resumeLink) completedPoints++;
    if ((student as any).class10Percentage && (student as any).class12Percentage) completedPoints++;
    if (cgpaValue && cgpaValue > 0) completedPoints++;
    if (student.projects && student.projects.length > 0) completedPoints++;
    if (student.certifications && student.certifications.length > 0) completedPoints++;
    if (student.codingProfiles && student.codingProfiles.length > 0) completedPoints++;
    if ((student as any).skills && (student as any).skills.length > 0) completedPoints++;
    const profileCompleteness = Math.round((completedPoints / totalPoints) * 100);

    const eligibleDrivesCount = await getCachedEligibleDrivesCount();

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

  const upcomingTests = await getCachedUpcomingTests();

  // 4. Placement Section Data
  const openDrives = await getCachedOpenDrives();

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

  // Determine active placement pipeline application
  const getStatusWeight = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'shortlisted') return 100;
    if (s === 'interview') return 90;
    if (s === 'applied') return 80;
    if (s === 'offered' || s === 'placed') return 70;
    return 10; // rejected, etc.
  };

  const sortedApps = [...applications].sort((a, b) => {
    const weightA = getStatusWeight(a.status);
    const weightB = getStatusWeight(b.status);
    if (weightA !== weightB) {
      return weightB - weightA;
    }
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });

  const activeApp = sortedApps[0];
  let currentPipeline = null;

  if (activeApp) {
    const status = activeApp.status.toLowerCase();
    const stages: { label: string; status: 'completed' | 'current' | 'pending' }[] = [
      { label: "Applied", status: "completed" },
      { label: "Shortlisted", status: "pending" },
      { label: "Interview", status: "pending" },
      { label: "Offer", status: "pending" }
    ];

    if (status === 'applied') {
      stages[0].status = 'current';
    } else if (status === 'shortlisted') {
      stages[0].status = 'completed';
      stages[1].status = 'current';
    } else if (status === 'interview') {
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'current';
    } else if (status === 'offered' || status === 'placed') {
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'completed';
      stages[3].status = 'completed';
    } else if (status === 'rejected') {
      stages[0].status = 'completed';
      stages[1].status = 'completed';
      stages[2].status = 'completed';
      stages[3] = { label: "Rejected", status: "completed" };
    }

    let nextEvent = null;
    if (new Date(activeApp.drive.date) > new Date()) {
      nextEvent = {
        label: "Drive date:",
        highlight: new Date(activeApp.drive.date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      };
    }

    currentPipeline = {
      company: activeApp.drive.company.name,
      role: activeApp.drive.role,
      stages,
      nextEvent
    };
  }

  return NextResponse.json({
    overview: {
      trainingLevel: student.currentSemester ? "Semester " + student.currentSemester : "Level 1",
      avgTestScore,
      problemsSolved: totalProblemsSolved,
      eligibleDrives: applications.length, // Display applied drives count in Drives Applied card
      appliedDrives: applications.length,  // Display applied drives count in Applied hero metric
      openDrivesCount: eligibleDrivesCount,
      cgpa: formattedCgpa,
      attendancePercentage: attendancePct,
      profileCompleteness,
      projectsCount: student.projects.length,
      certificationsCount: student.certifications.length,
    },
    currentPipeline,
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
        duration: t.duration + " mins"
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
