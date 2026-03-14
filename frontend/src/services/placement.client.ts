import { api } from '@/lib/api';

export interface PlacementStudent {
 id: string;
 name: string;
 rollNo: string;
 branch: string;
 year: string;
 company: string;
 role: string;
 package: string;
 image?: string;
 quote?: string;
 linkedin?: string;
}

// Mock data for initial implementation and historical records
const mockPlacements: PlacementStudent[] = [
 {
 id: '1',
 name: 'Abhishek Singh',
 rollNo: '200132010001',
 branch: 'Computer Science',
 year: '2024',
 company: 'Amazon',
 role: 'SDE-1',
 package: '46.38 LPA',
 image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abhishek',
 quote:"The CDC's guidance was instrumental in my journey to Amazon.",
 },
 {
 id: '2',
 name: 'Shreya Gupta',
 rollNo: '200132010045',
 branch: 'Information Technology',
 year: '2024',
 company: 'ServiceNow',
 role: 'Software Engineer',
 package: '43.0 LPA',
 image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Shreya',
 quote:"Focusing on core fundamentals and mock interviews helped me land ServiceNow.",
 },
 {
 id: '3',
 name: 'Rahul Kumar',
 rollNo: '200132010082',
 branch: 'Computer Science',
 year: '2024',
 company: 'Autodesk',
 role: 'SDE',
 package: '39.0 LPA',
 image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
 },
 {
 id: '4',
 name: 'Priya Verma',
 rollNo: '210132013012',
 branch: 'Computer Science',
 year: '2025',
 company: 'Commvault',
 role: 'SDE',
 package: '33.0 LPA',
 image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
 },
 {
 id: '5',
 name: 'Amit Patel',
 rollNo: '190132010015',
 branch: 'Electronics',
 year: '2023',
 company: 'Cisco',
 role: 'Network Engineer',
 package: '28.0 LPA',
 image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
 },
 {
 id: '6',
 name: 'Anjali Sharma',
 rollNo: '190132013005',
 branch: 'Computer Science',
 year: '2023',
 company: 'Adobe',
 role: 'Product Engineer',
 package: '31.0 LPA',
 image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
 }
];

export const placementApi = {
 getPlacements: async (filters: { year?: string; branch?: string; search?: string } = {}) => {
 // In a real scenario, this would call an API:
 // return api.get(`/placements?year=${filters.year}&branch=${filters.branch}&search=${filters.search}`);

 // For now, we simulate API filtering on our mock data
 let filtered = [...mockPlacements];

 if (filters.year && filters.year !== 'All') {
 filtered = filtered.filter(p => p.year === filters.year);
 }

 if (filters.branch && filters.branch !== 'All') {
 filtered = filtered.filter(p => p.branch === filters.branch);
 }

 if (filters.search) {
 const search = filters.search.toLowerCase();
 filtered = filtered.filter(p =>
 p.name.toLowerCase().includes(search) ||
 p.company.toLowerCase().includes(search) ||
 p.role.toLowerCase().includes(search)
 );
 }

 // Simulate API delay
 await new Promise(resolve => setTimeout(resolve, 500));

 return filtered;
 }
};
