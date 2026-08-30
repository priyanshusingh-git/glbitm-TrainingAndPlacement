import { NextRequest, NextResponse } from 'next/server';
import { authorize } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { fetchPlatformStats } from '@/services/stats.service';

export async function POST(req: NextRequest) {
  const authResult = await authorize(req, ['STUDENT']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: authResult.id },
      include: { codingProfiles: true }
    });

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const profiles = student.codingProfiles;
    const updatedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const stats = await fetchPlatformStats(profile.platform, profile.username);
          if (stats) {
            return await prisma.codingProfile.update({
              where: { id: profile.id },
              data: {
                statsJSON: JSON.stringify(stats),
                lastFetched: new Date()
              }
            });
          }
          return profile;
        } catch (err) {
          logger.warn(`Failed to sync stats for ${profile.platform} (@${profile.username}):`, err);
          return profile;
        }
      })
    );

    return NextResponse.json(updatedProfiles);
  } catch (error) {
    logger.error("Failed to sync all coding profiles:", error);
    return NextResponse.json({ error: "Failed to sync profiles" }, { status: 500 });
  }
}
