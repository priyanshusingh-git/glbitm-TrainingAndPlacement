
import { api } from '@/lib/api';

export interface Company {
 id: string;
 name: string;
 industry: string;
 location: string;
 website: string | null;
 contactPerson: string | null;
 email: string | null;
 phone: string | null;
 status: string;
 createdAt: string;
 updatedAt: string;
 placementDrives?: any[]; // Optional depending on include
 _count?: {
 placementDrives: number;
 }
}

export const getAllCompanies = async (): Promise<Company[]> => {
 const response = await api.get('/companies');
 return response.data;
};
