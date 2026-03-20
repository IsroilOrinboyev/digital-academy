// Base URL from env variable, defaults to Django dev server
const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'https://api.digital-academy.live';

const TOKEN_KEY = 'da_access_token';
const REFRESH_KEY = 'da_refresh_token';
const CATEGORY_ENDPOINT_PATH = '/api/users/category/';
const CATEGORY_ENDPOINT_ABSOLUTE = 'https://api.digital-academy.live/api/users/category/';
const TEACHER_COURSES_ENDPOINT = '/api/teachers/courses/';
const TEACHER_COURSE_ENDPOINT_LEGACY = '/api/teachers/course/';

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

  const raw = await res.text();
  if (!raw.trim()) return undefined as T;

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      // Some successful endpoints can return invalid JSON bodies.
      return undefined as T;
    }
  }

  return raw as T;
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

export interface CreateQuizVariantApiPayload {
  text: string;
  is_correct: boolean;
}

export interface CreateQuizQuestionApiPayload {
  question_text: string;
  points: number;
  variants: CreateQuizVariantApiPayload[];
}

export interface CreateQuizApiPayload {
  lesson: string;
  title: string;
  description: string;
  questions: CreateQuizQuestionApiPayload[];
}

export interface UserCourseItem {
  id: string;
  cover_img: string | null;
  title: string;
  desc: string;
  base_price: number;
  discount_price: number;
  units: Array<{
    id: string;
    title: string;
    desc: string;
    lessons: Array<{
      id: string;
      title: string;
      video: string | null;
      presentation: string | null;
      additional_task: string;
    }>;
  }>;
}

export interface UserCourseListResponse {
  success: boolean;
  status: number;
  data: UserCourseItem[];
}

export interface UserPublicCourseItem {
  id: string;
  cover_img: string | null;
  title: string;
  desc: string;
  base_price: number;
  discount_price: number;
}

export interface UserPublicCourseListResponse {
  success: boolean;
  status: number;
  data: UserPublicCourseItem[];
}

export interface UserCoursesQueryParams {
  category?: string[];
  price_min?: number;
  price_max?: number;
}

export interface MyCourseListItem {
  id: string;
  course: string;
  progress: number;
  status: string;
}

export interface MyCourseListResponse {
  success: boolean;
  status: number;
  data: MyCourseListItem[];
}

export interface MyCourseDetailResponse {
  success: boolean;
  status: number;
  data: {
    id: string;
    progress: number;
    status: string;
    course: {
      id: string;
      units: Array<{
        id: string;
        title: string;
        desc: string;
        lessons: Array<{
          id: string;
          title: string;
          video: string | null;
          presentation: string | null;
          additional_task: string;
          quizzes?: Array<{
            id: string;
            lesson: string;
            title: string;
            description: string;
            is_finished?: boolean;
            due_at?: string | null;
            questions?: Array<{
              id: string;
              question_text: string;
              points: number;
              variants: Array<{
                id: string;
                text: string;
                is_correct: boolean;
              }>;
            }>;
          }>;
        }>;
      }>;
    };
  };
}

export interface SubmitUserQuizAnswerItem {
  question: string;
  variant: string;
}

export interface SubmitUserQuizPayload {
  answers: SubmitUserQuizAnswerItem[];
}

export interface SubmitUserQuizResponse {
  success: boolean;
  status: number;
  data: {
    quiz: string;
    user: string | null;
    correct_answers: number;
    wrong_answers: number;
    total_questions: number;
    total: string;
    status: 'PASSED' | 'FAILED' | string;
    course_progress: number;
  };
}

export interface UpdateCoursePayload {
  title: string;
  desc: string;
  base_price: number;
  discount_price: number;
  cover_img?: File | null;
}

export interface CourseProgressApiResponse {
  success?: boolean;
  status_code?: number;
  data?: {
    progress?: number;
    status?: string;
    completed_lectures?: string[];
  };
  progress?: number;
  status_text?: string;
  status?: string;
  completed_lectures?: string[];
}

export interface UpdateCourseProgressPayload {
  progress?: number;
  status?: string;
  completed_lectures?: string[];
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

    return apiRequest<any>(TEACHER_COURSES_ENDPOINT, {
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

  myCourses: async () => {
    try {
      return await apiRequest<UserCourseListResponse>(TEACHER_COURSES_ENDPOINT);
    } catch {
      return apiRequest<UserCourseListResponse>(TEACHER_COURSE_ENDPOINT_LEGACY);
    }
  },

  update: (courseId: string, data: UpdateCoursePayload) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('desc', data.desc);
    formData.append('base_price', String(data.base_price));
    formData.append('discount_price', String(data.discount_price));
    if (data.cover_img) {
      formData.append('cover_img', data.cover_img);
    }

    return apiRequest<any>(`${TEACHER_COURSES_ENDPOINT}${courseId}/`, {
      method: 'PATCH',
      body: formData,
    }).catch(() =>
      apiRequest<any>(`${TEACHER_COURSE_ENDPOINT_LEGACY}${courseId}/`, {
        method: 'PATCH',
        body: formData,
      })
    );
  },

  detail: (id: string) => apiRequest<any>(`/api/courses/${id}/`),

  userCourses: (params?: UserCoursesQueryParams) => {
    if (!params) {
      return apiRequest<UserPublicCourseListResponse>('/api/users/courses/');
    }

    const query = new URLSearchParams();
    if (Array.isArray(params.category)) {
      params.category.forEach((categoryId) => {
        if (categoryId) query.append('category', categoryId);
      });
    }
    if (typeof params.price_min === 'number') {
      query.append('price_min', String(params.price_min));
    }
    if (typeof params.price_max === 'number') {
      query.append('price_max', String(params.price_max));
    }

    const qs = query.toString();
    const endpoint = qs ? `/api/users/courses/?${qs}` : '/api/users/courses/';
    return apiRequest<UserPublicCourseListResponse>(endpoint);
  },

  myEnrolledCourses: () => apiRequest<MyCourseListResponse>('/api/users/my-courses/'),

  myEnrolledCourseDetail: (id: string) =>
    apiRequest<MyCourseDetailResponse>(`/api/users/my-courses/${id}/`),

  submitUserQuiz: async (quizId: string, data: SubmitUserQuizPayload) => {
    const payload = {
      method: 'POST',
      body: JSON.stringify(data),
    };

    try {
      return await apiRequest<SubmitUserQuizResponse>(`/api/users/quiz/${quizId}/submit/`, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('HTTP 404') && !message.includes('HTTP 405')) {
        throw error;
      }
      return apiRequest<SubmitUserQuizResponse>(`/api/users/quiz/${quizId}/`, payload);
    }
  },

  enroll: async (id: string) => {
    try {
      return await apiRequest<void>('/api/users/enrolment/', {
        method: 'POST',
        body: JSON.stringify({ course: id }),
      });
    } catch {
      return apiRequest<void>(`/api/courses/${id}/enroll/`, { method: 'POST' });
    }
  },

  reviews: (id: string) => apiRequest<any[]>(`/api/courses/${id}/reviews/`),

  addReview: (id: string, data: { rating: number; comment: string }) =>
    apiRequest<any>(`/api/courses/${id}/reviews/`, { method: 'POST', body: JSON.stringify(data) }),

  getProgress: async (params: { enrollmentId?: string; courseId?: string }) => {
    const { enrollmentId, courseId } = params;

    if (enrollmentId) {
      try {
        return await apiRequest<CourseProgressApiResponse>(`/api/users/my-courses/${enrollmentId}/progress/`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('HTTP 404') && !message.includes('HTTP 405')) {
          throw error;
        }
      }
    }

    if (!courseId) {
      throw new Error('Progress endpoint requires enrollmentId or courseId');
    }

    return apiRequest<CourseProgressApiResponse>(`/api/courses/${courseId}/progress/`);
  },

  updateProgress: async (params: { enrollmentId?: string; courseId?: string; data: UpdateCourseProgressPayload }) => {
    const { enrollmentId, courseId, data } = params;
    const payload = { method: 'POST', body: JSON.stringify(data) };

    if (enrollmentId) {
      try {
        return await apiRequest<CourseProgressApiResponse>(`/api/users/my-courses/${enrollmentId}/progress/`, payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('HTTP 404') && !message.includes('HTTP 405')) {
          throw error;
        }
      }
    }

    if (!courseId) {
      throw new Error('Progress endpoint requires enrollmentId or courseId');
    }

    return apiRequest<CourseProgressApiResponse>(`/api/courses/${courseId}/progress/`, payload);
  },

  getQuiz: (courseId: string, sectionIdx: number) =>
    apiRequest<any>(`/api/courses/${courseId}/quizzes/${sectionIdx}/`),

  submitQuiz: (courseId: string, sectionIdx: number, answers: Record<number, number>) =>
    apiRequest<{ score: number; passed: boolean; correct: number; total: number }>(
      `/api/courses/${courseId}/quizzes/${sectionIdx}/submit/`,
      { method: 'POST', body: JSON.stringify({ answers }) }
    ),
};

export const categoryApi = {
  list: async () => {
    try {
      return await apiRequest<CategoryListResponse>(CATEGORY_ENDPOINT_PATH);
    } catch {
      const res = await fetch(CATEGORY_ENDPOINT_ABSOLUTE, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      return res.json() as Promise<CategoryListResponse>;
    }
  },
};

export const quizApi = {
  create: (data: CreateQuizApiPayload) =>
    apiRequest<any>('/api/teachers/quiz/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
