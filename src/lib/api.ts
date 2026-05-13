const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.craftcontinent.com/api/v1';

const TOKEN_KEY = 'cc_token';
const REFRESH_KEY = 'cc_refresh_token';

interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string; code: string }>;
  };
}

/** Custom error class for API failures. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(body.error.message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (isRefreshing) {
    return new Promise((resolve) => { refreshQueue.push(resolve); });
  }

  isRefreshing = true;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      refreshQueue.forEach((cb) => cb(null));
      refreshQueue = [];
      return null;
    }

    const json = await res.json();
    const newAccess: string = json.data.accessToken;
    const newRefresh: string = json.data.refreshToken;

    localStorage.setItem(TOKEN_KEY, newAccess);
    localStorage.setItem(REFRESH_KEY, newRefresh);

    refreshQueue.forEach((cb) => cb(newAccess));
    refreshQueue = [];
    return newAccess;
  } catch {
    clearAuth();
    refreshQueue.forEach((cb) => cb(null));
    refreshQueue = [];
    return null;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Core request handler with automatic 401 → refresh → retry.
 * When `skipContentType` is true the Content-Type header is omitted so the
 * browser can set it automatically (needed for multipart/form-data).
 */
async function request<T>(endpoint: string, options: RequestInit = {}, retry = true, skipContentType = false): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = skipContentType
    ? { ...(options.headers as Record<string, string>) }
    : { 'Content-Type': 'application/json', ...(options.headers as Record<string, string>) };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && retry) {
    const newToken = await tryRefresh();
    if (newToken) {
      return request<T>(endpoint, options, false, skipContentType);
    }
    // Refresh failed — redirect to login
    if (typeof window !== 'undefined') {
      clearAuth();
      window.location.href = '/login';
    }
    throw new ApiError(401, { error: { code: 'UNAUTHORIZED', message: 'Session expired' } });
  }

  if (!response.ok) {
    let body: ApiErrorBody;
    try {
      body = await response.json();
    } catch {
      body = { error: { code: 'UNKNOWN', message: response.statusText } };
    }
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return null as T;
  return response.json();
}

/** API client with typed HTTP helpers. */
export const api = {
  get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'GET' });
  },
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body: data ? JSON.stringify(data) : undefined });
  },
  put<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) });
  },
  patch<T>(endpoint: string, data: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' });
  },
  /** Sends multipart/form-data — do NOT set Content-Type manually, let the browser handle the boundary. */
  postForm<T>(endpoint: string, form: FormData): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body: form }, true, true);
  },
  /** Sends multipart/form-data via PATCH — do NOT set Content-Type manually. */
  patchForm<T>(endpoint: string, form: FormData): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body: form }, true, true);
  },
};
