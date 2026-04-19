import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';
import { processEmailQueueItem } from '@/services/qstash.service';
import { logger } from '@/lib/logger';

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { emailQueueId } = body;

    if (!emailQueueId) {
      return NextResponse.json({ error: 'Missing emailQueueId' }, { status: 400 });
    }

    const result = await processEmailQueueItem(emailQueueId);
    
    return NextResponse.json({ 
      success: true, 
      message: result.alreadySent ? 'Already sent' : 'Email processed successfully' 
    });

  } catch (err: any) {
    logger.error('QStash Webhook Email Failure:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 }); // Returning 500 tells QStash to retry!
  }
}

const isDev = process.env.NODE_ENV === 'development';
const hasKeys = !!(process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_NEXT_SIGNING_KEY);

// Next.js App Router verification wrapper
// Bypass for local development if keys are missing
export const POST = (isDev && !hasKeys) 
  ? handler 
  : verifySignatureAppRouter(handler);
