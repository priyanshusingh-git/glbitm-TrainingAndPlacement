export interface Group {
 id: string;
 name: string;
 description?: string;
 branch: string;
 year: string;
 _count?: {
 students: number;
 };
 createdAt: string;
}

export interface Test {
 id: string;
 title: string;
 type: string;
 date: string;
 duration: number;
 totalMarks: number;
 testUrl?: string;
 platform?: string;
 createdBy?: string;
 assignedGroups?: { id: string, name: string }[];
 creator?: {
 name: string;
 };
}

export interface TestResult {
 id: string;
 testId: string;
 test?: Test;
 studentId: string;
 marksObtained: number;
 remarks?: string;
}

export interface Bootcamp {
 id: string;
 title: string;
 description: string;
 date: string;
 createdBy?: {
 name: string;
 };
 assignedGroups?: {
 id: string;
 name: string;
 }[];
}

export interface AnalyticsData {
 totalStudents: number;
 totalPlaced: number;
 avgCgpa: number;
 groupStats: {
 name: string;
 count: number;
 }[];
}

export interface Company {
 id: string;
 name: string;
 industry?: string;
 location?: string;
 website?: string;
 contactPerson?: string;
 email?: string;
 phone?: string;
 status: string;
 hires?: number; // Optional, might need computed on backend
 _count?: {
 placementDrives: number;
 };
}

export interface PlacementDrive {
 id: string;
 companyId: string;
 company?: Company;
 role: string;
 ctc: string;
 location: string;
 date: string;
 eligibilityCriteria?: string;
 status: string; // scheduled, ongoing, completed
 _count?: {
 applications: number;
 };
}

export interface Application {
 id: string;
 driveId: string;
 drive?: PlacementDrive;
 studentId: string;
 status: string; // applied, shortlisted, rejected, offered
 appliedAt: string;
}

export interface AnalyticsDetailed {
 placementData: { dept: string; placed: number; total: number }[];
 skillsData: { name: string; students: number }[];
 salaryData: { range: string; count: number }[];
 yearlyTrend: { year: string; percentage: number; avgPackage: number }[];
 stats: {
 totalPlaced: number;
 placementRate: string;
 avgPackage: string;
 companiesCount: number;
 };
}

