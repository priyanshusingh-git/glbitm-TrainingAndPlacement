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

// Next.js App Router verification wrapper
export const POST = verifySignatureAppRouter(handler);
