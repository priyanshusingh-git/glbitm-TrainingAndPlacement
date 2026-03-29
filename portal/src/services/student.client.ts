
import { api } from '@/lib/api';

export interface Student {
 id: string;
 userId: string;
 name: string;
 rollNo: string | null;
 admissionId: string;
 branch: string | null;
 year: number | null;
 currentSemester: number | null;
 cgpa: number | null;
 user: {
 email: string;
 role: string;
 };
 semesterResults: any[];
 skills: string[];
}

export const getAllStudents = async (): Promise<Student[]> => {
 const response = await api.get('/students');
 return response || [];
};
