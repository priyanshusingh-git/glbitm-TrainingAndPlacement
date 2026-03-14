
import { api } from '@/lib/api';

export interface StudentDashboardData {
 overview: {
 trainingLevel: string;
 avgTestScore: number;
 problemsSolved: number;
 eligibleDrives: number;
 };
 training: {
 batches: any[];
 upcomingSessions: any[];
 };
 tests: {
 recent: any[];
 upcoming: any[];
 };
 placements: any[];
 activity: {
 coding: any[];
 projects: any[];
 certifications: any[];
 };
}

export interface AdminDashboardData {
 overview: {
 totalStudents: string;
 placedStudents: string;
 avgScore: string;
 activeCompanies: number;
 };
 placementAnalytics: any[];
 recentActivity: any[];
 companies: any[];
}

export const getStudentDashboardStats = async (): Promise<StudentDashboardData> => {
 const response = await api.get('/dashboard/student');
 return response;
};

export const getAdminDashboardStats = async (): Promise<AdminDashboardData> => {
 const response = await api.get('/dashboard/admin');
 return response;
};
