import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth-middleware'
import prisma from '@/lib/db'
import { logAudit } from '@/services/audit.service'
import { logger } from '@/lib/logger'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authorize(req, ['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user || user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }

    // Delete directly from Postgres (Firebase removed)
    await prisma.user.delete({ where: { id } })

    const ipAddress = req.headers.get('x-forwarded-for') || undefined
    const userAgent = req.headers.get('user-agent') || undefined
    await logAudit({
      action: 'DELETE',
      entityType: 'RECRUITER',
      entityId: id,
      performedById: authResult.id,
      details: { deletedEmail: user.email },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ message: 'Recruiter deleted successfully' })
  } catch (error: any) {
    logger.error('Delete Recruiter Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authorize(req, ['ADMIN'])
  if (authResult instanceof NextResponse) return authResult

  const { id } = await params

  try {
    const { isSuspended, suspendedReason } = await req.json()
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isSuspended,
        suspendedReason: isSuspended ? suspendedReason : null,
        suspendedAt: isSuspended ? new Date() : null,
      },
    })

    // JWT is stateless — suspending via DB flag is sufficient.
    // The auth-middleware checks isSuspended on every request.

    return NextResponse.json(updated)
  } catch (error: any) {
    logger.error('PATCH Recruiter Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
