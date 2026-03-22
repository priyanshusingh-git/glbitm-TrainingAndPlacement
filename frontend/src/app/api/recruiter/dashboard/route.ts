import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth-middleware'
import prisma from '@/lib/db'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const authResult = await authorize(req, ['RECRUITER'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const recruiterEmail = authResult.email

    // Find company linked to this recruiter email
    const company = await prisma.company.findFirst({
      where: { email: recruiterEmail },
    })

    if (!company) {
      return NextResponse.json({
        company: null,
        stats: { totalDrives: 0, ongoingDrives: 0, completedDrives: 0, totalShortlisted: 0 },
        activeDrives: [],
        shortlistedCandidates: [],
      })
    }

    // Fetch stats
    const [totalDrives, ongoingDrives, completedDrives] = await Promise.all([
      prisma.placementDrive.count({ where: { companyId: company.id } }),
      prisma.placementDrive.count({ where: { companyId: company.id, status: 'ongoing' } }),
      prisma.placementDrive.count({ where: { companyId: company.id, status: 'completed' } }),
    ])

    // Fetch active drives
    const activeDrives = await prisma.placementDrive.findMany({
      where: {
        companyId: company.id,
        status: { in: ['scheduled', 'ongoing'] },
      },
      include: {
        _count: { select: { applications: true } },
      },
      orderBy: { date: 'asc' },
      take: 5,
    })

    // Fetch shortlisted candidates across all drives for this company
    const shortlistedApplications = await prisma.jobApplication.findMany({
      where: {
        drive: { companyId: company.id },
        status: { in: ['SHORTLISTED', 'OFFERED', 'PLACED'] },
      },
      include: {
        student: {
          select: {
            user: { select: { name: true, email: true } },
            branch: true,
            enrollmentNo: true,
          },
        },
        drive: { select: { role: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    })

    // Total shortlisted count
    const totalShortlisted = await prisma.jobApplication.count({
      where: {
        drive: { companyId: company.id },
        status: { in: ['SHORTLISTED', 'OFFERED', 'PLACED'] },
      },
    })

    return NextResponse.json({
      company,
      stats: { totalDrives, ongoingDrives, completedDrives, totalShortlisted },
      activeDrives,
      shortlistedCandidates: shortlistedApplications,
    })

  } catch (error: any) {
    logger.error('GET Recruiter Dashboard Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
