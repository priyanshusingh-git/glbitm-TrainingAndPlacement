import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import prisma from '@/lib/db';
import { logger } from '@/lib/logger';
import { generateStrongPassword } from '@/lib/password';
import { sendWelcomeEmail } from '@/services/email.service';
import { logAudit } from '@/services/audit.service';
import { broadcastMessage } from '@/lib/realtime';
import { publishEmailTask } from '@/services/qstash.service';

/**
 * Server-side service for student-related database operations.
 */

export const getStudents = async () => {
 return prisma.studentProfile.findMany({
 include: {
 user: { select: { email: true, role: true } },
 batch: true,
 attendances: true
 },
 orderBy: { admissionId: 'asc' }
 });
};

export const getStudentById = async (id: string) => {
  // Query by profile ID or userId (Firebase UID) to support both admin and student views
  return prisma.studentProfile.findFirst({
    where: { 
      OR: [
        { id },
        { userId: id }
      ]
    },
    include: {
      user: { select: { email: true, role: true, name: true } },
      batch: true,
      trainingGroup: true,
      semesterResults: true,
      projects: true,
      certifications: true,
      attendances: true
    }
  });
};

export const createStudent = async (data: { email: string; admissionId?: string; name?: string }) => {
 const { email, admissionId, name ="Student" } = data;

 // 1. Check if user/profile exists
 const existingUser = await prisma.user.findUnique({ where: { email } });
 if (existingUser) throw new Error('User with this email already exists');

 if (admissionId) {
   const existingProfile = await prisma.studentProfile.findUnique({ where: { admissionId } });
   if (existingProfile) throw new Error('Student with this Admission ID already exists');
 }

  // 2. Generate Password
  const password = generateStrongPassword(10);
  const hashedPassword = await bcrypt.hash(password, 10);
  const magicToken = randomUUID();
  const magicTokenExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  // 3. Create User & Profile in Database natively (Firebase removed)
  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'STUDENT',
        mustChangePassword: true,
        name,
        magicToken,
        magicTokenExpires
      }
    });

    const profile = await tx.studentProfile.create({
      data: {
        userId: user.id,
        admissionId: admissionId || null,
        name,
        skills: []
      }
    });

    // 4. Queue Welcome Email
    const emailQueue = await tx.emailQueue.create({
      data: {
        to: email,
        subject: "Welcome to Scorlo Training & Placement Portal",
        payload: JSON.stringify({ 
          name, 
          email, 
          magicToken 
        }),
        status: "PENDING"
      }
    });

    return { user, profile, emailQueueId: emailQueue.id };
  });

  // Asynchronously dispatch to QStash
  publishEmailTask(result.emailQueueId).catch(err => {
    logger.error("Failed to asynchronously publish QStash email task", err);
  });

  return { ...result.profile, emailSent: true };
};

export const updateStudent = async (id: string, body: any, performedById: string, context?: { ipAddress?: string; userAgent?: string }) => {
 const { name, email, role, isProfileLocked, branch, year, currentSemester, semesterResults, ...rest } = body;

 let profile = await prisma.studentProfile.findUnique({ where: { id } });
 if (!profile) {
 profile = await prisma.studentProfile.findUnique({ where: { userId: id } });
 }

 if (!profile) throw new Error('Student profile not found');

 const userId = profile.userId;
 const profileId = profile.id;

 // Update User details if provided
 if (name || email || role) {
 await prisma.user.update({
 where: { id: userId },
 data: {
 ...(name && { name }),
 ...(email && { email }),
 ...(role && { role })
 }
 });
 }

 // Prepare StudentProfile update data
 const profileData: any = {};
 if (typeof isProfileLocked === 'boolean') profileData.isProfileLocked = isProfileLocked;
 if (branch) profileData.branch = branch;
 if (year) profileData.year = year;
 if (currentSemester) profileData.currentSemester = parseInt(currentSemester);
 if (name) profileData.name = name;

 // Common fields
 const commonFields = [
 'studentType', 'rollNo', 'admissionId', 'section', 'course',
 'class10School', 'class10Board', 'class10Percentage', 'class10Year',
 'class12School', 'class12Board', 'class12Percentage', 'class12PcmPercentage', 'class12MathPercentage', 'class12Year',
 'diplomaInstitute', 'diplomaBranch', 'diplomaPercentage', 'diplomaYear'
 ];

 commonFields.forEach(field => {
 if (body[field] !== undefined) profileData[field] = body[field];
 });

 if (body.cgpa) profileData.cgpa = parseFloat(body.cgpa);
 if (body.attendancePercentage) profileData.attendancePercentage = parseFloat(body.attendancePercentage);

 // Update Profile
 if (Object.keys(profileData).length > 0) {
 await prisma.studentProfile.update({
 where: { id: profileId },
 data: profileData
 });

 // Audit & Notification logic
 const ipAddress = context?.ipAddress;
 const userAgent = context?.userAgent;

 if (typeof isProfileLocked === 'boolean' && isProfileLocked !== profile.isProfileLocked) {
  await logAudit({
    action: isProfileLocked ? 'LOCK' : 'UNLOCK',
    entityType: 'STUDENT',
    entityId: userId,
    performedById,
    details: { previousStatus: profile.isProfileLocked, currentStatus: isProfileLocked },
    ipAddress,
    userAgent
  });

  await prisma.notification.create({
    data: {
      userId,
      title: isProfileLocked ? "Profile Locked 🔒" : "Profile Unlocked 🔓",
      message: isProfileLocked
        ? "Your profile has been locked by admin. You can no longer make changes."
        : "Your profile has been unlocked by admin. You can now make changes.",
      type: isProfileLocked ? 'WARNING' : 'SUCCESS'
    }
  });

  try {
    await broadcastMessage({
      channel: `profile-updates-${userId}`,
      event: isProfileLocked ? 'profile:locked' : 'profile:unlocked',
      payload: { userId }
    });
  } catch (broadcastError) {
    logger.warn('Realtime broadcast failed — profile lock/unlock update skipped:', broadcastError);
  }
 } else {
  await logAudit({
    action: 'UPDATE',
    entityType: 'STUDENT',
    entityId: userId,
    performedById,
    details: { updatedFields: Object.keys(profileData) },
    ipAddress,
    userAgent
  });

  const updateFields = Object.keys(profileData).filter(k => k !== 'isProfileLocked');
  if (updateFields.length > 0) {
    await prisma.notification.create({
      data: {
        userId,
        title: "Profile Updated 📝",
        message: "An admin has updated details in your profile.",
        type: 'INFO'
      }
    });

    try {
      await broadcastMessage({
        channel: `profile-updates-${userId}`,
        event: 'profile:updated',
        payload: { userId }
      });
    } catch (broadcastError) {
      logger.warn('Realtime broadcast failed — profile update notification skipped:', broadcastError);
    }
  }
 }
 }

 // Semester Results
 if (semesterResults && Array.isArray(semesterResults)) {
  for (const sem of semesterResults) {
    await prisma.semesterResult.upsert({
      where: {
        studentId_semester: {
          studentId: profileId,
          semester: sem.semester
        }
      },
      update: {
        sgpa: sem.sgpa,
        backlogs: sem.backlogs || 0,
        credits: sem.credits,
        totalMarks: sem.totalMarks,
        obtainedMarks: sem.obtainedMarks
      },
      create: {
        student: { connect: { id: profileId } },
        semester: sem.semester,
        sgpa: sem.sgpa,
        backlogs: sem.backlogs || 0,
        credits: sem.credits,
        totalMarks: sem.totalMarks,
        obtainedMarks: sem.obtainedMarks
      }
    });
  }
 }

 return getStudentById(profileId);
};

export const deleteStudent = async (id: string) => {
 let profile = await prisma.studentProfile.findUnique({ where: { id } });
 if (!profile) {
 profile = await prisma.studentProfile.findUnique({ where: { userId: id } });
 }

 if (!profile) throw new Error('Student profile not found');

 const userId = profile.userId;

 // 1. Prisma Delete (Cascade takes care of profile links)
 await prisma.studentProfile.delete({ where: { id: profile.id } });
 await prisma.notification.deleteMany({ where: { userId } });

 // 2. User Table Delete (Firebase removed — Postgres is sole authority)
 await prisma.user.delete({ where: { id: userId } });

 return { message: 'Student deleted successfully' };
};
