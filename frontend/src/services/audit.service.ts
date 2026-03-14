import prisma from '@/lib/db';
import { logger } from '@/lib/logger';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK' | 'EXPORT' | 'IMPORT';
export type EntityType = 'STUDENT' | 'COMPANY' | 'PLACEMENT_DRIVE' | 'TRAINER' | 'USER' | 'BOOTCAMP' | 'TEST';

interface LogAuditParams {
 action: AuditAction;
 entityType: EntityType;
 entityId?: string;
 performedById: string;
 details?: any;
 ipAddress?: string;
 userAgent?: string;
}

/**
 * Logs an administrative action to the AuditLog table.
 */
export async function logAudit({
 action,
 entityType,
 entityId,
 performedById,
 details,
 ipAddress,
 userAgent
}: LogAuditParams) {
 try {
 const log = await prisma.auditLog.create({
 data: {
 action,
 entityType,
 entityId,
 performedById,
 details: details || {},
 ipAddress,
 userAgent
 }
 });
 return log;
 } catch (error) {
 // We don't want audit logging to crash the main request, but we must log the failure
 logger.error('Audit Logging Failed:', error);
 return null;
 }
}
