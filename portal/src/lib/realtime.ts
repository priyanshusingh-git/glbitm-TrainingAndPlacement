import { logger } from '@/lib/logger';
import { getAblyServerClient } from './ably';

type BroadcastPayload = {
  event: string;
  payload: Record<string, any>;
  channel: string;
};

/**
 * [REALTIME_ACTIVE] Ably Real-time broadcast engine.
 * Delivers instant signals to student and admin dashboards.
 */
export async function broadcastMessage({ channel, event, payload }: BroadcastPayload): Promise<void> {
  const ably = getAblyServerClient();
  if (!ably) {
    logger.warn(`Skipping Ably broadcast for ${channel}:${event} (API Key Missing)`);
    return;
  }

  try {
    const ablyChannel = ably.channels.get(channel);
    await ablyChannel.publish(event, payload);
    logger.info(`[ABLY_BROADCAST] ${channel}:${event}`, payload);
  } catch (error) {
    logger.error(`[ABLY_ERROR] Failed to broadcast ${channel}:${event}`, error);
  }
}
