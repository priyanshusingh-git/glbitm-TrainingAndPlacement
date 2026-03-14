

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const API_URL = `${API_BASE_URL}/api`;

const getHeaders = (isFormData = false, customToken?: string) => {
 const token = customToken || (typeof window !== 'undefined' ? sessionStorage.getItem('token') : null);
 const headers: any = {
 ...(token ? {"Authorization": `Bearer ${token}` } : {}),
 };

 if (!isFormData) {
 headers["Content-Type"] ="application/json";
 }

 return headers;
};

const handleResponse = async (res: Response, skipRedirect = false) => {
 if (res.status === 401) {
 if (typeof window !== 'undefined') {
 sessionStorage.removeItem("token");
 sessionStorage.removeItem("user");

 // Only redirect if NOT skipRedirect AND NOT already on login page
 const isLoginPage = window.location.pathname ==="/login";
 if (!skipRedirect && !isLoginPage) {
 sessionStorage.setItem("sessionExpired","true");
 window.location.href ="/login";
 }
 }
 throw new Error("Session expired. Please log in again.");
 }

 if (!res.ok) {
 const error = await res.json().catch(() => ({}));
 throw new Error(error.error || `API Error: ${res.statusText}`);
 }
 return res.json();
};

export interface ApiOptions {
 skipRedirect?: boolean;
 token?: string;
 body?: any;
}

export const api = {
 get: async (endpoint: string, options: ApiOptions = {}) => {
 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"GET",
 headers: {
 ...getHeaders(false, options.token),
"Cache-Control":"no-store, no-cache, must-revalidate",
"Pragma":"no-cache"
 },
 });
 return handleResponse(res, options.skipRedirect);
 },
 post: async (endpoint: string, data: any, options: ApiOptions = {}) => {
 const isFormData = data instanceof FormData;

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"POST",
 headers: getHeaders(isFormData, options.token),
 body: isFormData ? data : JSON.stringify(data),
 });
 return handleResponse(res, options.skipRedirect);
 },
 put: async (endpoint: string, data: any, options: ApiOptions = {}) => {
 const isFormData = data instanceof FormData;

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"PUT",
 headers: getHeaders(isFormData, options.token),
 body: isFormData ? data : JSON.stringify(data),
 });
 return handleResponse(res, options.skipRedirect);
 },
 patch: async (endpoint: string, data: any, options: ApiOptions = {}) => {
 const isFormData = data instanceof FormData;

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"PATCH",
 headers: getHeaders(isFormData, options.token),
 body: isFormData ? data : JSON.stringify(data),
 });
 return handleResponse(res, options.skipRedirect);
 },
 delete: async (endpoint: string, options: ApiOptions = {}) => {
 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"DELETE",
 headers: {
 ...getHeaders(false, options.token),
 ...(options.body ? {"Content-Type":"application/json" } : {})
 },
 body: options.body ? JSON.stringify(options.body) : undefined,
 });
 return handleResponse(res, options.skipRedirect);
 }
};
