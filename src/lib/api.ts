const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.craftcontinent.com/api/v1';

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

/**
 * Returns the stored auth token from localStorage, or null.
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cc_token');
}

/**
 * Core request handler for all HTTP methods.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
};
