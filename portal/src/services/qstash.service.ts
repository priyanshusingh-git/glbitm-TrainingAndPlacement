import { Client } from "@upstash/qstash";
import { logger } from "@/lib/logger";
import prisma from "@/lib/db";
import { sendWelcomeEmail } from "./email.service";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || "",
});

/**
 * Core logic to process an email from the queue.
 * Shared between QStash webhook and Local Dev Bypass.
 */
export const processEmailQueueItem = async (emailQueueId: string) => {
  try {
    const emailJob = await prisma.emailQueue.findUnique({
      where: { id: emailQueueId }
    });

    if (!emailJob) throw new Error(`Email job ${emailQueueId} not found`);
    if (emailJob.status === 'SENT') return { success: true, alreadySent: true };

    await prisma.emailQueue.update({
      where: { id: emailQueueId },
      data: { status: 'PROCESSING' }
    });

    const payload = JSON.parse(emailJob.payload);
    const { name, email, magicToken } = payload;

    const sent = await sendWelcomeEmail(email, name || 'Student', '', magicToken);

    if (sent) {
      await prisma.emailQueue.update({
        where: { id: emailQueueId },
        data: { status: 'SENT', error: null }
      });
      return { success: true };
    } else {
      throw new Error("SMTP Transporter failed");
    }
  } catch (error: any) {
    logger.error(`Error processing email queue item ${emailQueueId}:`, error);
    throw error;
  }
};

/**
 * Publishes a single explicit email task to QStash.
 */
export const publishEmailTask = async (emailQueueId: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/api/webhooks/qstash/emails`;
  
  // DEV BYPASS: QStash (Cloud) cannot reach localhost.
  // If we are on localhost, we process the email immediately/locally.
  if (siteUrl.includes("localhost")) {
    logger.info(`[Dev Bypass] Localhost detected. Processing email ${emailQueueId} directly instead of QStash.`);
    return processEmailQueueItem(emailQueueId).catch(err => {
      logger.error("[Dev Bypass] Local email processing failed", err);
    });
  }

  try {
    const result = await qstashClient.publishJSON({
      url,
      body: { emailQueueId },
      retries: 3, 
    });
    return result;
  } catch (error) {
    logger.error("Failed to publish email task to QStash", error);
    throw error;
  }
};

/**
 * Publishes multiple email tasks to QStash in a single bulk request.
 * To avoid overwhelming our SMTP/Nodemailer endpoint (like Gmail strict limits), 
 * we naturally stagger the processing out using QStash delays based on index.
 */
export const publishBulkEmailTasks = async (emailQueueIds: string[]) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${siteUrl}/api/webhooks/qstash/emails`;
  
  // DEV BYPASS: Process locally if on localhost
  if (siteUrl.includes("localhost")) {
    logger.info(`[Dev Bypass] Localhost detected. Processing ${emailQueueIds.length} emails sequentially.`);
    for (const id of emailQueueIds) {
      await processEmailQueueItem(id).catch(err => logger.error(`[Dev Bypass] Failed item ${id}`, err));
    }
    return [{ success: true, local: true }];
  }

  // Throttle to approx 2 emails per second max to avoid SMTP bans
  const messages = emailQueueIds.map((id, index) => {
    // Math.floor(index / 2) means 2 per second staggered
    const delaySeconds = Math.floor(index / 2);
    
    return {
      url,
      body: JSON.stringify({ emailQueueId: id }),
      retries: 3,
      delay: delaySeconds // standard Qstash delay format (number = seconds)
    };
  });
  
  try {
    // Send in chunks of 500 max just to be safe with Upstash payload limits
    const chunkSize = 500;
    const results = [];
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const res = await qstashClient.batch(chunk);
      results.push(res);
    }
    return results;
  } catch (error) {
    logger.error("Failed to batch publish email tasks to QStash", error);
    throw error;
  }
};
