import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { fetchPlatformStats, ComprehensiveStats } from '@/services/stats.service';

const ALLOWED_PLATFORMS = ['LeetCode', 'GitHub', 'Codeforces', 'CodeChef', 'GeeksforGeeks', 'HackerRank'];

// GET /api/portfolio/coding-profiles
export async function GET(req: NextRequest) {
  const authResult = await authorize(req, ['STUDENT']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: authResult.id },
      include: {
        codingProfiles: {
          orderBy: [
            { isPrimary: 'desc' },
            { updatedAt: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Filter out any non-coding or legacy profiles like LinkedIn
    let existingProfiles = student.codingProfiles.filter(
      p => p.platform.toLowerCase() !== 'linkedin'
    );

    const existingPlatformMap = new Map(
      existingProfiles.map(p => [p.platform.toLowerCase(), p])
    );

    // Auto-sync handles from StudentProfile if not already present in CodingProfile
    const autoSeedConfigs = [
      {
        platform: 'LeetCode',
        key: 'leetcodeId' as const,
        url: (u: string) => `https://leetcode.com/u/${u}`
      },
      {
        platform: 'GitHub',
        key: 'githubId' as const,
        url: (u: string) => `https://github.com/${u}`
      },
      {
        platform: 'CodeChef',
        key: 'codechefId' as const,
        url: (u: string) => `https://www.codechef.com/users/${u}`
      }
    ];

    let newlyCreated = false;

    for (const config of autoSeedConfigs) {
      const handle = (student[config.key] || '').trim();
      if (handle && !existingPlatformMap.has(config.platform.toLowerCase())) {
        try {
          let initialStats: ComprehensiveStats = {
            totalSolved: 0,
            easy: 0,
            medium: 0,
            hard: 0,
            rating: 0
          };

          const fetched = await fetchPlatformStats(config.platform, handle);
          if (fetched) initialStats = fetched;

          const created = await prisma.codingProfile.create({
            data: {
              studentId: student.id,
              platform: config.platform,
              username: handle,
              profileUrl: config.url(handle),
              monthlyGoal: 30,
              practiceFrequency: 'Daily Practice',
              statsJSON: JSON.stringify(initialStats),
              isPrimary: existingProfiles.length === 0 && config.platform === 'LeetCode'
            }
          });

          existingProfiles.push(created);
          existingPlatformMap.set(config.platform.toLowerCase(), created);
          newlyCreated = true;
        } catch (seedErr) {
          logger.warn(`Failed to auto-seed ${config.platform} for student ${student.id}:`, seedErr);
        }
      }
    }

    if (newlyCreated) {
      existingProfiles.sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    return NextResponse.json(existingProfiles);
  } catch (error) {
    logger.error("Failed to fetch coding profiles:", error);
    return NextResponse.json({ error: "Failed to fetch coding profiles" }, { status: 500 });
  }
}

// POST /api/portfolio/coding-profiles
export async function POST(req: NextRequest) {
  const authResult = await authorize(req, ['STUDENT']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const {
      platform,
      username,
      profileUrl,
      monthlyGoal,
      practiceFrequency,
      isPrimary
    } = body;

    if (!platform || !username) {
      return NextResponse.json({ error: "Platform and Username are required" }, { status: 400 });
    }

    // Only allow verified stat platforms
    const normalized = ALLOWED_PLATFORMS.find(p => p.toLowerCase() === platform.toLowerCase());
    if (!normalized) {
      return NextResponse.json(
        { error: `Platform '${platform}' is not supported. Supported platforms: ${ALLOWED_PLATFORMS.join(', ')}` },
        { status: 400 }
      );
    }

    const student = await prisma.studentProfile.findUnique({ where: { userId: authResult.id } });
    if (!student) return NextResponse.json({ error: "Student profile not found" }, { status: 404 });

    const existing = await prisma.codingProfile.findUnique({
      where: {
        studentId_platform: {
          studentId: student.id,
          platform: normalized
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: `Profile for ${normalized} is already connected.` }, { status: 400 });
    }

    let initialStats: ComprehensiveStats = {
      totalSolved: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      rating: 0
    };

    const fetchedStats = await fetchPlatformStats(normalized, username.trim());
    if (fetchedStats) initialStats = fetchedStats;

    if (isPrimary) {
      await prisma.codingProfile.updateMany({
        where: { studentId: student.id },
        data: { isPrimary: false }
      });
    }

    const defaultUrl = profileUrl || (
      normalized.toLowerCase() === 'leetcode' ? `https://leetcode.com/u/${username.trim()}` :
      normalized.toLowerCase() === 'github' ? `https://github.com/${username.trim()}` :
      normalized.toLowerCase() === 'codeforces' ? `https://codeforces.com/profile/${username.trim()}` :
      normalized.toLowerCase() === 'codechef' ? `https://www.codechef.com/users/${username.trim()}` :
      normalized.toLowerCase() === 'hackerrank' ? `https://www.hackerrank.com/profile/${username.trim()}` :
      normalized.toLowerCase() === 'geeksforgeeks' ? `https://www.geeksforgeeks.org/user/${username.trim()}` :
      undefined
    );

    const profile = await prisma.codingProfile.create({
      data: {
        studentId: student.id,
        platform: normalized,
        username: username.trim(),
        profileUrl: defaultUrl,
        monthlyGoal: Number(monthlyGoal) || 30,
        practiceFrequency: practiceFrequency || 'Daily Practice',
        isPrimary: Boolean(isPrimary),
        statsJSON: JSON.stringify(initialStats),
        lastFetched: new Date()
      }
    });

    // Sync handle back to StudentProfile if applicable
    const studentUpdate: Record<string, string> = {};
    if (normalized.toLowerCase() === 'leetcode' && !student.leetcodeId) studentUpdate.leetcodeId = username.trim();
    if (normalized.toLowerCase() === 'github' && !student.githubId) studentUpdate.githubId = username.trim();
    if (normalized.toLowerCase() === 'codechef' && !student.codechefId) studentUpdate.codechefId = username.trim();

    if (Object.keys(studentUpdate).length > 0) {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: studentUpdate
      });
    }

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    logger.error("Add Coding Profile Error:", error);
    return NextResponse.json({ error: "Failed to add coding profile" }, { status: 500 });
  }
}
