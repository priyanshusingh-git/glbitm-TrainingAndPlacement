import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { sendWelcomeEmail } from '@/services/email.service';
import { logger } from '@/lib/logger';

// Use Edge functions or Node, standard Node fits well.
export const maxDuration = 60; // Max allowed for Vercel Hobby/Pro standard cron

export async function GET(req: Request) {
  // Verify Vercel Cron Secret (if configured)
  const authHeader = req.headers.get('authorization');
  if (
    process.env.VERCEL_CRON_SECRET &&
    authHeader !== `Bearer ${process.env.VERCEL_CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch up to 20 PENDING emails to keep execution under 60 seconds
    const pendingEmails = await prisma.emailQueue.findMany({
      where: { status: 'PENDING' },
      take: 20,
      orderBy: { createdAt: 'asc' }
    });

    if (pendingEmails.length === 0) {
      return NextResponse.json({ message: 'No emails to process' });
    }

    let sentCount = 0;

    // 2. Process sequentially to avoid blowing up Nodemailer/SMTP connections
    for (const emailJob of pendingEmails) {
      try {
        // Optimistic locking / mark processing
        await prisma.emailQueue.update({
          where: { id: emailJob.id },
          data: { status: 'PROCESSING' }
        });

        const payload = JSON.parse(emailJob.payload);
        const { name, email, rawPassword } = payload;

        const sent = await sendWelcomeEmail(emailJob.to, name || 'Student', rawPassword);

        if (sent) {
          await prisma.emailQueue.update({
            where: { id: emailJob.id },
            data: { status: 'SENT', error: null }
          });
          sentCount++;
        } else {
          throw new Error("Transporter rejected or failed to return truthy status");
        }
      } catch (err: any) {
        await prisma.emailQueue.update({
          where: { id: emailJob.id },
          data: {
            status: emailJob.retries >= 3 ? 'FAILED' : 'PENDING',
            retries: emailJob.retries + 1,
            error: err.message || 'Unknown Email Provider Error'
          }
        });
        logger.error(`Cron Email Failure [${emailJob.to}]:`, err);
      }

      // Brief pause to stay under Gmail strict rate-limits (~1-2 per second max safely)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return NextResponse.json({
      message: `Processed ${sentCount} out of ${pendingEmails.length} queued emails successfully.`
    });

  } catch (error) {
    logger.error('Critical Email Cron Job Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
