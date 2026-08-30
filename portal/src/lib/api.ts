export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'http://localhost:3000')
).replace(/\/api\/?$/, '').replace(/\/$/, '');
export const API_URL = `${API_BASE_URL}/api`;

type CsrfState = {
  csrfToken: string;
  captchaRequired?: boolean;
};

let csrfStateCache: CsrfState | null = null;
let csrfStatePromise: Promise<CsrfState> | null = null;

// ─── CLIENT-SIDE IN-MEMORY SWR CACHE ──────────────────────────────────────────
interface CacheRecord<T = any> {
  data: T;
  cachedAt: number;
}

const memoryCache = new Map<string, CacheRecord>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_CACHE_TTL_MS = 60 * 1000; // 60 seconds

const getHeaders = (isFormData = false) => {
  const headers: any = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const handleResponse = async (res: Response, skipRedirect = false) => {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message =
      payload.detail ||
      payload.error ||
      payload.message ||
      payload.title ||
      `API Error: ${res.statusText}`;

    const nextError = new Error(message) as Error & Record<string, any>;
    Object.assign(nextError, payload, {
      status: payload.status || res.status,
      requestId: payload.requestId || res.headers.get("x-request-id") || undefined,
    });

    const isSessionFailure =
      res.status === 401 &&
      (payload.code === "UNAUTHORIZED" || payload.code === "INVALID_SESSION");

    if (isSessionFailure) {
      memoryCache.clear();
      if (typeof window !== 'undefined' && !skipRedirect) {
        const isLoginPage = window.location.pathname === "/login";
        if (!isLoginPage) {
          sessionStorage.setItem("sessionExpired", "true");
          window.location.href = "/login";
        }
      }
      nextError.message = "Session expired. Please log in again.";
    }

    if (res.status === 403 && payload.code === "CSRF_INVALID") {
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
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache"
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
  fresh?: boolean;
  ttlMs?: number;
}

function invalidateMatchingCache(endpoint: string) {
  // If a mutation touches a portfolio or dashboard resource, invalidate relevant entries
  const baseKey = endpoint.split("?")[0];
  for (const key of memoryCache.keys()) {
    if (
      key.startsWith(baseKey) ||
      (baseKey.includes("portfolio") && key.includes("dashboard")) ||
      (baseKey.includes("placements") && key.includes("dashboard")) ||
      (baseKey.includes("training") && key.includes("dashboard")) ||
      (baseKey.includes("students") && key.includes("dashboard"))
    ) {
      memoryCache.delete(key);
    }
  }
}

export const api = {
  get: async <T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const ttl = options.ttlMs ?? DEFAULT_CACHE_TTL_MS;
    const cached = memoryCache.get(endpoint);

    // 1. Instant Return from In-Memory Cache (0ms latency)
    if (!options.fresh && cached && Date.now() - cached.cachedAt < ttl) {
      return cached.data;
    }

    // 2. In-Flight Request Deduplication
    if (!options.fresh && inFlightRequests.has(endpoint)) {
      return inFlightRequests.get(endpoint)!;
    }

    // 3. Fetch from Network
    const fetchPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}${endpoint}`, {
          method: "GET",
          headers: {
            ...getHeaders(false),
          },
          credentials: "include",
        });
        const data = await handleResponse(res, options.skipRedirect);
        memoryCache.set(endpoint, {
          data,
          cachedAt: Date.now(),
        });
        return data;
      } finally {
        inFlightRequests.delete(endpoint);
      }
    })();

    inFlightRequests.set(endpoint, fetchPromise);
    return fetchPromise;
  },

  post: async (endpoint: string, data: any, options: ApiOptions = {}) => {
    invalidateMatchingCache(endpoint);
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
      method: "POST",
      headers,
      body: isFormData ? data : JSON.stringify(body),
      credentials: "include",
    });
    return handleResponse(res, options.skipRedirect);
  },

  put: async (endpoint: string, data: any, options: ApiOptions = {}) => {
    invalidateMatchingCache(endpoint);
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
      method: "PUT",
      headers,
      body: isFormData ? data : JSON.stringify(body),
      credentials: "include",
    });
    return handleResponse(res, options.skipRedirect);
  },

  patch: async (endpoint: string, data: any, options: ApiOptions = {}) => {
    invalidateMatchingCache(endpoint);
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
      method: "PATCH",
      headers,
      body: isFormData ? data : JSON.stringify(body),
      credentials: "include",
    });
    return handleResponse(res, options.skipRedirect);
  },

  delete: async (endpoint: string, options: ApiOptions = {}) => {
    invalidateMatchingCache(endpoint);
    const csrfState = endpoint === "/auth/csrf" ? null : await getCsrfState();

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        ...getHeaders(false),
        ...(csrfState?.csrfToken ? { "X-CSRF-Token": csrfState.csrfToken } : {}),
        ...(options.body ? { "Content-Type": "application/json" } : {})
      },
      body: options.body ? JSON.stringify({
        ...(typeof options.body === "object" && options.body !== null ? options.body : {}),
        ...(csrfState?.csrfToken ? { csrfToken: csrfState.csrfToken } : {}),
      }) : undefined,
      credentials: "include",
    });
    return handleResponse(res, options.skipRedirect);
  },

  invalidateCache: (endpointPrefix?: string) => {
    if (!endpointPrefix) {
      memoryCache.clear();
      return;
    }
    for (const key of memoryCache.keys()) {
      if (key.startsWith(endpointPrefix)) {
        memoryCache.delete(key);
      }
    }
  },

  clearCache: () => {
    memoryCache.clear();
  },
};
