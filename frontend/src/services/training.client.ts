import { API_URL } from"@/lib/api";
import { Bootcamp, Group, Test, TestResult } from"@/types/training"; // Assuming types are in @/types/training or I need to move them there.
// I created types in frontend/types/training.ts in step 139.

const getHeaders = () => {
 const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
 return {
 'Content-Type': 'application/json',
 'Authorization': `Bearer ${token}`
 };
};

// --- Bootcamps ---

export const fetchBootcamps = async (): Promise<Bootcamp[]> => {
 const res = await fetch(`${API_URL}/bootcamps`, { headers: getHeaders() });
 if (!res.ok) {
 console.error(`fetchBootcamps failed: ${res.status} ${res.statusText}`);
 throw new Error(`Failed to fetch bootcamps: ${res.status} ${res.statusText}`);
 }
 return res.json();
};

export const createBootcamp = async (data: Partial<Bootcamp>): Promise<Bootcamp> => {
 const res = await fetch(`${API_URL}/bootcamps`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify(data)
 });
 if (!res.ok) throw new Error("Failed to create bootcamp");
 return res.json();
};

// --- Groups ---

export const fetchGroups = async (): Promise<Group[]> => {
 const res = await fetch(`${API_URL}/groups`, { headers: getHeaders() });
 if (!res.ok) throw new Error("Failed to fetch groups");
 return res.json();
};

export const createGroup = async (data: Partial<Group>): Promise<Group> => {
 const res = await fetch(`${API_URL}/groups`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify(data)
 });
 if (!res.ok) throw new Error("Failed to create group");
 return res.json();
};

export const fetchGroupStudents = async (groupId: string): Promise<any[]> => {
 const res = await fetch(`${API_URL}/groups/${groupId}/students`, { headers: getHeaders() });
 if (!res.ok) throw new Error("Failed to fetch group students");
 return res.json();
};

export const assignStudents = async (groupId: string, studentIds: string[]): Promise<any> => {
 const res = await fetch(`${API_URL}/groups/${groupId}/assign`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify({ studentIds })
 });
 if (!res.ok) throw new Error("Failed to assign students");
 return res.json();
};

// --- Tests ---

export const fetchTests = async (): Promise<Test[]> => {
 const res = await fetch(`${API_URL}/tests`, { headers: getHeaders() });
 if (!res.ok) {
 console.error(`fetchTests failed: ${res.status} ${res.statusText}`);
 throw new Error(`Failed to fetch tests: ${res.status} ${res.statusText}`);
 }
 return res.json();
};

export const createTest = async (data: Partial<Test>): Promise<Test> => {
 const res = await fetch(`${API_URL}/tests`, {
 method: 'POST',
 headers: getHeaders(),
 body: JSON.stringify(data)
 });
 if (!res.ok) throw new Error("Failed to create test");
 return res.json();
};

export const fetchMyResults = async (): Promise<TestResult[]> => {
 const res = await fetch(`${API_URL}/tests/results/my`, { headers: getHeaders() });
 if (!res.ok) {
 console.error(`fetchMyResults failed: ${res.status} ${res.statusText}`);
 throw new Error(`Failed to fetch results: ${res.status} ${res.statusText}`);
 }
 return res.json();
};
