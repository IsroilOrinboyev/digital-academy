// Base URL from env variable, defaults to Django dev server
const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'https://api.digital-academy.live';

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
  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers ?? {});

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiRequest<T>(endpoint, options, false);
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const raw = await res.text();
    let message = `HTTP ${res.status}`;

    if (raw) {
      try {
        const err = JSON.parse(raw);
        message = err?.detail ?? err?.message ?? message;
      } catch {
        message = `${message}: ${raw.slice(0, 220)}`;
      }
    }

    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface CreateUnitPayload {
  title: string;
  desc: string;
  lessons: Array<{
    title: string;
    desc: string;
    additional_task?: string;
    video?: File | null;
    presentation?: File | null;
  }>;
}

export interface CreateCoursePayload {
  title: string;
  desc: string;
  base_price: number;
  discount_price: number;
  category: string;
  cover_img: File | null;
  units: CreateUnitPayload[];
}

export interface CategoryItem {
  id: string;
  title: string;
  slug: string;
}

export interface CategoryListResponse {
  success: boolean;
  status: number;
  data: CategoryItem[];
}

export interface CreateLessonApiPayload {
  course_unit: string;
  title: string;
  desc: string;
  additional_task: string;
  video?: File | null;
  presentation?: File | null;
}

// ── Auth endpoints ─────────────────────────────────────────────────────────
export interface LoginApiResponse {
  success: boolean;
  status: number;
  data: {
    message: string;
    requires_password_change: boolean;
    user: {
      id: string;
      username: string | null;
      email: string;
      role: string;
    };
    tokens: {
      refresh: string;
      access: string;
    };
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginApiResponse>('/api/users/auth/login/', {
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

  create: (data: CreateCoursePayload) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('desc', data.desc);
    formData.append('base_price', String(data.base_price));
    formData.append('discount_price', String(data.discount_price));
    formData.append('category', data.category);
    if (data.cover_img) {
      formData.append('cover_img', data.cover_img);
    }

    const unitsPayload = data.units.map((unit, unitIndex) => ({
      title: unit.title,
      desc: unit.desc,
      lessons: unit.lessons.map((lesson, lessonIndex) => {
        const video = lesson.video ?? null;
        const presentation = lesson.presentation ?? null;

        const videoKey = `video_${unitIndex}_${lessonIndex}`;
        const presentationKey = `presentation_${unitIndex}_${lessonIndex}`;

        if (video) {
          formData.append(videoKey, video);
        }
        if (presentation) {
          formData.append(presentationKey, presentation);
        }

        return {
          title: lesson.title,
          desc: lesson.desc,
          additional_task: lesson.additional_task ?? '',
          // Backend expects field keys, not raw file names.
          video: video ? videoKey : null,
          presentation: presentation ? presentationKey : null,
        };
      }),
    }));

    formData.append('units', JSON.stringify(unitsPayload));

    return apiRequest<any>('/api/teachers/course/', {
      method: 'POST',
      body: formData,
    });
  },

  createLesson: (data: CreateLessonApiPayload) => {
    const formData = new FormData();
    formData.append('course_unit', data.course_unit);
    formData.append('title', data.title);
    formData.append('desc', data.desc);
    formData.append('additional_task', data.additional_task);
    if (data.video) formData.append('video', data.video);
    if (data.presentation) formData.append('presentation', data.presentation);
    return apiRequest<any>('/api/teachers/lesson/', { method: 'POST', body: formData });
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

export const categoryApi = {
  list: () => apiRequest<CategoryListResponse>('/api/users/category/'),
};
