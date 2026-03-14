import prisma from '@/lib/db';
import { randomUUID } from"crypto";

/**
 * Server-side service for training-related database operations.
 */

export const getTrainingSessions = async (filters: { groupId?: string; trainerId?: string }) => {
 const where: any = {};
 if (filters.groupId) {
 where.sessionGroups = {
 some: { id: filters.groupId }
 };
 }
 if (filters.trainerId) where.trainerId = filters.trainerId;

 return prisma.trainingSession.findMany({
 where,
 include: {
 sessionGroups: {
 select: { id: true, name: true }
 },
 trainer: { select: { id: true, name: true } },
 _count: { select: { attendances: true } }
 },
 orderBy: { date: 'desc' }
 });
};

export const createTrainingSessions = async (body: any) => {
 const {
 groupIds = [],
 trainerId,
 title,
 type,
 date: startDateStr,
 startTime: startDateTimeStr,
 duration,
 mode,
 location,
 repeatDays = [],
 occurrences = 1,
 trainerOverrides = {},
 isGroupSession = true
 } = body;

 const sessionsToCreate: any[] = [];
 const baseStartDate = new Date(startDateStr);
 const seriesId = (isGroupSession && (occurrences > 1 || repeatDays.length > 1)) ? randomUUID() : null;

 const getTrainerForGroup = async (groupId: string) => {
 if (trainerOverrides[groupId] && trainerOverrides[groupId] !=="AUTO") {
 return trainerOverrides[groupId];
 }
 if (trainerId) return trainerId;

 const assignment = await prisma.trainerAssignment.findUnique({
 where: { groupId_type: { groupId, type } }
 });
 return assignment ? assignment.trainerId : null;
 };

 const groupTrainerMap: Record<string, string | null> = {};
 for (const gid of groupIds) {
 groupTrainerMap[gid] = await getTrainerForGroup(gid);
 }

 const daysToProcess = repeatDays.length > 0 ? repeatDays : [baseStartDate.getDay()];

 for (let week = 0; week < occurrences; week++) {
 for (const dayOfWeek of daysToProcess) {
 const sessionDate = new Date(baseStartDate);
 const currentDay = sessionDate.getDay();
 const diff = dayOfWeek - currentDay;
 sessionDate.setDate(sessionDate.getDate() + diff + (week * 7));

 if (sessionDate < baseStartDate) continue;

 const trainerToGroups: Record<string, string[]> = {};
 for (const gid of groupIds) {
 const tId = groupTrainerMap[gid];
 if (tId) {
 if (!trainerToGroups[tId]) trainerToGroups[tId] = [];
 trainerToGroups[tId].push(gid);
 }
 }

 for (const [tId, gIds] of Object.entries(trainerToGroups)) {
 const dateTime = new Date(startDateTimeStr);
 dateTime.setFullYear(sessionDate.getFullYear());
 dateTime.setMonth(sessionDate.getMonth());
 dateTime.setDate(sessionDate.getDate());

 sessionsToCreate.push({
 data: {
 title: isGroupSession ? `${title} (${new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(sessionDate)})` : title,
 type,
 date: sessionDate,
 startTime: dateTime,
 duration: Number(duration),
 mode: mode ||"Offline",
 location,
 seriesId,
 status: 'scheduled',
 trainer: {
 connect: { id: tId }
 },
 sessionGroups: {
 connect: gIds.map((id: string) => ({ id }))
 }
 }
 });
 }
 }
 }

 if (sessionsToCreate.length === 0) {
 throw new Error('No sessions were generated. Check your start date and repeat days.');
 }

 return prisma.$transaction(
 sessionsToCreate.map(session => prisma.trainingSession.create(session))
 );
};

export const markBulkAttendance = async (sessionId: string, records: { studentId: string; status: string }[]) => {
 return prisma.$transaction(
 records.map((record) =>
 prisma.attendance.upsert({
 where: {
 studentId_sessionId: {
 studentId: record.studentId,
 sessionId
 }
 },
 update: {
 status: record.status,
 date: new Date()
 },
 create: {
 studentId: record.studentId,
 sessionId: sessionId,
 status: record.status,
 date: new Date()
 }
 })
 )
 );
};

export const getTrainingStats = async () => {
 const totalGroups = await prisma.trainingGroup.count();
 const totalTrainers = await prisma.user.count({ where: { role: 'TRAINER' } });

 const startOfDay = new Date();
 startOfDay.setHours(0, 0, 0, 0);
 const endOfDay = new Date();
 endOfDay.setHours(23, 59, 59, 999);

 const activeSessionsToday = await prisma.trainingSession.count({
 where: {
 date: {
 gte: startOfDay,
 lte: endOfDay
 }
 }
 });

 const studentsInTraining = await prisma.studentProfile.count({
 where: { trainingGroupId: { not: null } }
 });

 return {
 totalGroups,
 totalTrainers,
 activeSessionsToday,
 studentsInTraining
 };
};

export const getStudentTrainingDashboard = async (userId: string) => {
 const student = await prisma.studentProfile.findUnique({
 where: { userId },
 include: {
 trainingGroup: {
 include: {
 trainers: {
 include: { trainer: { select: { name: true } } }
 }
 }
 }
 }
 });

 if (!student || !student.trainingGroupId) {
 return {
 enrolled: false,
 message:"You are not enrolled in any training group yet."
 };
 }

 const sessions = await prisma.trainingSession.findMany({
 where: {
 sessionGroups: {
 some: { id: student.trainingGroupId }
 }
 },
 include: {
 trainer: { select: { name: true } },
 attendances: {
 where: { studentId: student.id }
 },
 resources: true
 },
 orderBy: { date: 'asc' }
 });

 const totalSessions = sessions.length;
 const passedSessions = sessions.filter((s: any) => new Date(s.date) < new Date());
 const attendedSessions = sessions.filter((s: any) =>
 s.attendances.length > 0 && s.attendances[0].status.toLowerCase() === 'present'
 );

 const attendancePercentage = passedSessions.length > 0
 ? Math.round((attendedSessions.length / passedSessions.length) * 100)
 : 0;

 const now = new Date();
 const nextSession = sessions.find((s: any) => new Date(s.date) >= now && s.status !== 'cancelled');

 return {
 enrolled: true,
 group: student.trainingGroup,
 sessions,
 stats: {
 totalSessions,
 completedSessions: passedSessions.length,
 attendancePercentage
 },
 nextSession
 };
};

export const getTrainerTrainingDashboard = async (trainerId: string) => {
 const assignments = await prisma.trainerAssignment.findMany({
 where: { trainerId },
 include: {
 group: {
 include: {
 _count: { select: { students: true } }
 }
 }
 }
 });

 const upcomingSessions = await prisma.trainingSession.findMany({
 where: {
 trainerId,
 date: { gte: new Date() }
 },
 include: {
 sessionGroups: {
 select: { id: true, name: true, branch: true, year: true }
 },
 _count: { select: { attendances: true } }
 },
 orderBy: { date: 'asc' },
 take: 5
 });

 const recentSessions = await prisma.trainingSession.findMany({
 where: {
 trainerId,
 date: { lt: new Date() }
 },
 include: {
 sessionGroups: {
 select: { id: true, name: true, branch: true, year: true }
 },
 _count: { select: { attendances: true } }
 },
 orderBy: { date: 'desc' },
 take: 5
 });

 const normalizeSession = (session: any) => ({
 ...session,
 group: session.sessionGroups?.[0] ?? null
 });

 return {
 assignments,
 upcomingSessions: upcomingSessions.map(normalizeSession),
 recentSessions: recentSessions.map(normalizeSession)
 };
};
