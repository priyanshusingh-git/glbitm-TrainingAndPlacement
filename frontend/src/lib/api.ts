
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/api\/?$/, '').replace(/\/$/, '');
export const API_URL = `${API_BASE_URL}/api`;

type CsrfState = {
 csrfToken: string;
 captchaRequired?: boolean;
};

let csrfStateCache: CsrfState | null = null;
let csrfStatePromise: Promise<CsrfState> | null = null;

const getHeaders = (isFormData = false) => {
 const headers: any = {
 };

 if (!isFormData) {
 headers["Content-Type"] ="application/json";
 }

 return headers;
};

const handleResponse = async (res: Response, skipRedirect = false) => {
 if (res.status === 401) {
 if (typeof window !== 'undefined' && !skipRedirect) {
 const isLoginPage = window.location.pathname ==="/login";
 if (!isLoginPage) {
 sessionStorage.setItem("sessionExpired","true");
 window.location.href ="/login";
 }
 }
 throw new Error("Session expired. Please log in again.");
 }

 if (!res.ok) {
 const error = await res.json().catch(() => ({}));
 const nextError = new Error(error.error || `API Error: ${res.statusText}`) as Error & Record<string, any>;
 Object.assign(nextError, error);

 if (res.status === 403 && error.code === "CSRF_INVALID") {
 csrfStateCache = null;
 csrfStatePromise = null;
 }

 throw nextError;
 }
 return res.json();
};

export async function getCsrfState(force = false): Promise<CsrfState> {
 if (!force && csrfStateCache) {
 return csrfStateCache;
 }

 if (!force && csrfStatePromise) {
 return csrfStatePromise;
 }

 csrfStatePromise = fetch(`${API_URL}/auth/csrf`, {
 method: "GET",
 headers: {
 "Cache-Control":"no-store, no-cache, must-revalidate",
 "Pragma":"no-cache"
 },
 credentials: "include",
 cache: "no-store",
 })
 .then(async (response) => {
 if (!response.ok) {
 throw new Error("Unable to refresh security token.");
 }

 const payload = await response.json();
 const nextState = {
 csrfToken: payload.csrfToken,
 captchaRequired: Boolean(payload.captchaRequired),
 };

 csrfStateCache = nextState;
 return nextState;
 })
 .finally(() => {
 csrfStatePromise = null;
 });

 return csrfStatePromise;
}

export interface ApiOptions {
 skipRedirect?: boolean;
 body?: any;
}

export const api = {
 get: async (endpoint: string, options: ApiOptions = {}) => {
 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"GET",
 headers: {
 ...getHeaders(false),
"Cache-Control":"no-store, no-cache, must-revalidate",
"Pragma":"no-cache"
 },
 credentials: "include",
 });
 return handleResponse(res, options.skipRedirect);
 },
 post: async (endpoint: string, data: any, options: ApiOptions = {}) => {
 const isFormData = data instanceof FormData;
 const csrfState = endpoint === "/auth/csrf" ? null : await getCsrfState();
 const headers = getHeaders(isFormData);

 if (csrfState?.csrfToken) {
 headers["X-CSRF-Token"] = csrfState.csrfToken;
 }

 let body = data;
 if (csrfState?.csrfToken) {
 if (isFormData) {
 if (!data.has("csrfToken")) {
 data.append("csrfToken", csrfState.csrfToken);
 }
 } else if (data && typeof data === "object" && !Array.isArray(data)) {
 body = { ...data, csrfToken: data.csrfToken || csrfState.csrfToken };
 }
 }

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"POST",
 headers,
 body: isFormData ? data : JSON.stringify(body),
 credentials: "include",
 });
 return handleResponse(res, options.skipRedirect);
 },
 put: async (endpoint: string, data: any, options: ApiOptions = {}) => {
 const isFormData = data instanceof FormData;
 const csrfState = endpoint === "/auth/csrf" ? null : await getCsrfState();
 const headers = getHeaders(isFormData);

 if (csrfState?.csrfToken) {
 headers["X-CSRF-Token"] = csrfState.csrfToken;
 }

 let body = data;
 if (csrfState?.csrfToken) {
 if (isFormData) {
 if (!data.has("csrfToken")) {
 data.append("csrfToken", csrfState.csrfToken);
 }
 } else if (data && typeof data === "object" && !Array.isArray(data)) {
 body = { ...data, csrfToken: data.csrfToken || csrfState.csrfToken };
 }
 }

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"PUT",
 headers,
 body: isFormData ? data : JSON.stringify(body),
 credentials: "include",
 });
 return handleResponse(res, options.skipRedirect);
 },
 patch: async (endpoint: string, data: any, options: ApiOptions = {}) => {
 const isFormData = data instanceof FormData;
 const csrfState = endpoint === "/auth/csrf" ? null : await getCsrfState();
 const headers = getHeaders(isFormData);

 if (csrfState?.csrfToken) {
 headers["X-CSRF-Token"] = csrfState.csrfToken;
 }

 let body = data;
 if (csrfState?.csrfToken) {
 if (isFormData) {
 if (!data.has("csrfToken")) {
 data.append("csrfToken", csrfState.csrfToken);
 }
 } else if (data && typeof data === "object" && !Array.isArray(data)) {
 body = { ...data, csrfToken: data.csrfToken || csrfState.csrfToken };
 }
 }

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"PATCH",
 headers,
 body: isFormData ? data : JSON.stringify(body),
 credentials: "include",
 });
 return handleResponse(res, options.skipRedirect);
 },
 delete: async (endpoint: string, options: ApiOptions = {}) => {
 const csrfState = endpoint === "/auth/csrf" ? null : await getCsrfState();

 const res = await fetch(`${API_URL}${endpoint}`, {
 method:"DELETE",
 headers: {
 ...getHeaders(false),
 ...(csrfState?.csrfToken ? { "X-CSRF-Token": csrfState.csrfToken } : {}),
 ...(options.body ? {"Content-Type":"application/json" } : {})
 },
 body: options.body ? JSON.stringify({
 ...(typeof options.body === "object" && options.body !== null ? options.body : {}),
 ...(csrfState?.csrfToken ? { csrfToken: csrfState.csrfToken } : {}),
 }) : undefined,
 credentials: "include",
 });
 return handleResponse(res, options.skipRedirect);
 }
};
