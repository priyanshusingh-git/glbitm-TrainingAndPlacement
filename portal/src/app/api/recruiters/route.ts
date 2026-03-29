import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth-middleware'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateStrongPassword } from '@/lib/password'
import { sendWelcomeEmail } from '@/services/email.service'
import { logAudit } from '@/services/audit.service'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest) {
  const authResult = await authorize(req, ['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const recruiters = await prisma.user.findMany({
      where: { role: 'RECRUITER' },
      select: {
        id: true, name: true, email: true, createdAt: true,
        isSuspended: true, mustChangePassword: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const companies = await prisma.company.findMany({
      select: { id: true, name: true, industry: true, email: true, status: true },
    })

    const enriched = recruiters.map((r) => ({
      ...r,
      company: companies.find((c) => c.email === r.email) ?? null,
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    logger.error('GET Recruiters Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authorize(req, ['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  try {
    const body = await req.json()
    const { name, email, companyId } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 })
    }

    if (companyId) {
      const company = await prisma.company.findUnique({ where: { id: companyId } })
      if (!company) {
        return NextResponse.json({ error: 'Company not found' }, { status: 404 })
      }
      await prisma.company.update({ where: { id: companyId }, data: { email } })
    }

    const password = generateStrongPassword(12)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create recruiter natively in Postgres (Firebase removed)
    const recruiter = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'RECRUITER',
        mustChangePassword: true,
      },
    })

    const ipAddress = req.headers.get('x-forwarded-for') || undefined
    const userAgent = req.headers.get('user-agent') || undefined
    await logAudit({
      action: 'CREATE',
      entityType: 'RECRUITER',
      entityId: recruiter.id,
      performedById: authResult.id,
      details: { name, email, companyId },
      ipAddress,
      userAgent,
    })

    const emailSent = await sendWelcomeEmail(email, name, password)

    return NextResponse.json({
      ...recruiter,
      credentials: { email, password },
      warning: !emailSent ? 'Recruiter created but welcome email failed.' : undefined,
      emailSent,
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Create Recruiter Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
