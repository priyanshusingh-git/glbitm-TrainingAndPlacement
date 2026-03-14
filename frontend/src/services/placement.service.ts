import prisma from '@/lib/db';

/**
 * Server-side service for placement-related database operations.
 * This service should only be used in API routes or Server Components.
 */

export const getPlacementDrives = async () => {
 return prisma.placementDrive.findMany({
 orderBy: { date: 'asc' },
 include: {
 company: true,
 _count: {
 select: { applications: true }
 }
 }
 });
};

export const createPlacementDrive = async (data: {
 companyId: string;
 role: string;
 ctc?: string;
 location?: string;
 date: string | Date;
 eligibilityCriteria?: string;
 status?: string;
}) => {
 return prisma.placementDrive.create({
 data: {
 companyId: data.companyId,
 role: data.role,
 ctc: data.ctc ||"",
 location: data.location ||"",
 date: new Date(data.date),
 eligibilityCriteria: data.eligibilityCriteria,
 status: data.status || 'scheduled'
 },
 include: {
 company: true
 }
 });
};

export const getPlacementStats = async () => {
 const [totalDrives, placedCount] = await Promise.all([
 prisma.placementDrive.count(),
 prisma.application.count({ where: { status: 'placed' } })
 ]);

 return {
 totalDrives,
 placedCount
 };
};
