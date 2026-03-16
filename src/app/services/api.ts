// Base URL from env variable, defaults to Django dev server
const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000';

const TOKEN_KEY = 'da_access_token';
const REFRESH_KEY = 'da_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) { clearTokens(); return null; }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.access);
    return data.access;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiRequest<T>(endpoint, options, false);
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? err?.message ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth endpoints ─────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ access: string; refresh: string; user: any }>('/api/auth/login/', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiRequest<{ access: string; refresh: string; user: any }>('/api/auth/register/', {
      method: 'POST', body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<void>('/api/auth/logout/', {
      method: 'POST', body: JSON.stringify({ refresh: localStorage.getItem('da_refresh_token') }),
    }),

  getProfile: () => apiRequest<any>('/api/auth/profile/'),

  updateProfile: (data: Partial<{ name: string; email: string; bio: string; avatar: string }>) =>
    apiRequest<any>('/api/auth/profile/', { method: 'PATCH', body: JSON.stringify(data) }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiRequest<void>('/api/auth/password/change/', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Course endpoints ───────────────────────────────────────────────────────
export const courseApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiRequest<any[]>(`/api/courses/${qs}`);
  },

  detail: (id: string) => apiRequest<any>(`/api/courses/${id}/`),

  enroll: (id: string) =>
    apiRequest<void>(`/api/courses/${id}/enroll/`, { method: 'POST' }),

  reviews: (id: string) => apiRequest<any[]>(`/api/courses/${id}/reviews/`),

  addReview: (id: string, data: { rating: number; comment: string }) =>
    apiRequest<any>(`/api/courses/${id}/reviews/`, { method: 'POST', body: JSON.stringify(data) }),

  getProgress: (id: string) => apiRequest<any>(`/api/courses/${id}/progress/`),

  updateProgress: (id: string, data: { completed_lectures: string[] }) =>
    apiRequest<any>(`/api/courses/${id}/progress/`, { method: 'POST', body: JSON.stringify(data) }),

  getQuiz: (courseId: string, sectionIdx: number) =>
    apiRequest<any>(`/api/courses/${courseId}/quizzes/${sectionIdx}/`),

  submitQuiz: (courseId: string, sectionIdx: number, answers: Record<number, number>) =>
    apiRequest<{ score: number; passed: boolean; correct: number; total: number }>(
      `/api/courses/${courseId}/quizzes/${sectionIdx}/submit/`,
      { method: 'POST', body: JSON.stringify({ answers }) }
    ),
};
