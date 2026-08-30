import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-middleware';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticate(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const profile = await prisma.codingProfile.findUnique({ where: { id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const student = await prisma.studentProfile.findUnique({ where: { id: profile.studentId } });
    if (!student || (student.userId !== authResult.id && authResult.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      monthlyGoal,
      practiceFrequency,
      isPrimary,
      username,
      profileUrl,
      statsJSON
    } = body;

    if (isPrimary) {
      await prisma.codingProfile.updateMany({
        where: { studentId: student.id },
        data: { isPrimary: false }
      });
    }

    const updateData: any = {};
    if (monthlyGoal !== undefined) updateData.monthlyGoal = Math.max(0, Number(monthlyGoal));
    if (practiceFrequency !== undefined) updateData.practiceFrequency = practiceFrequency;
    if (isPrimary !== undefined) updateData.isPrimary = Boolean(isPrimary);
    if (username !== undefined) updateData.username = username;
    if (profileUrl !== undefined) updateData.profileUrl = profileUrl;
    if (statsJSON !== undefined) {
      updateData.statsJSON = typeof statsJSON === 'string' ? statsJSON : JSON.stringify(statsJSON);
      updateData.lastFetched = new Date();
    }

    const updated = await prisma.codingProfile.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error("Failed to update coding profile:", error);
    return NextResponse.json({ error: "Failed to update coding profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticate(req);
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const profile = await prisma.codingProfile.findUnique({ where: { id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const student = await prisma.studentProfile.findUnique({ where: { id: profile.studentId } });
    if (!student || (student.userId !== authResult.id && authResult.role !== 'ADMIN')) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Do not allow deleting LeetCode or GitHub
    if (profile.platform.toLowerCase() === 'leetcode' || profile.platform.toLowerCase() === 'github') {
      return NextResponse.json(
        { error: `${profile.platform} is a required core profile and cannot be removed.` },
        { status: 400 }
      );
    }

    await prisma.codingProfile.delete({ where: { id } });
    return NextResponse.json({ message: "Profile deleted" });

  } catch (error) {
    logger.error("Failed to delete coding profile:", error);
    return NextResponse.json({ error: "Failed to delete coding profile" }, { status: 500 });
  }
}
