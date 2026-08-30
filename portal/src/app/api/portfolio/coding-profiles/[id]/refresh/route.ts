import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { fetchPlatformStats } from '@/services/stats.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticate(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const profile = await prisma.codingProfile.findUnique({ where: { id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const student = await prisma.studentProfile.findUnique({ where: { id: profile.studentId } });
    if (student?.userId !== authResult.id && authResult.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fetchedStats = await fetchPlatformStats(profile.platform, profile.username);
    if (!fetchedStats) {
      // If fetching returned null (e.g. rate limit or unsupported platform), keep existing stats but update timestamp
      let existingStats = {};
      try {
        existingStats = JSON.parse(profile.statsJSON);
      } catch {}

      const updated = await prisma.codingProfile.update({
        where: { id },
        data: {
          lastFetched: new Date(),
          statsJSON: JSON.stringify({
            ...existingStats,
            lastRefreshed: new Date().toISOString()
          })
        }
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.codingProfile.update({
      where: { id },
      data: {
        statsJSON: JSON.stringify(fetchedStats),
        lastFetched: new Date()
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to refresh coding profile stats:", error);
    return NextResponse.json({ error: "Failed to refresh stats" }, { status: 500 });
  }
}
