import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Notification, Transaction } from '@/app/types';
import { authApi, setTokens, clearTokens } from '@/app/services/api';

interface AuthContextType extends AuthState {
  apiAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: 'student' | 'instructor') => void;
  register: (name: string, email: string, password: string, role: 'student' | 'instructor') => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  enrollInCourse: (courseId: string, courseTitle: string, amount: number) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  transactions: Transaction[];
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'digital_academy_auth';
const NOTIF_KEY = 'digital_academy_notifications';
const TX_KEY = 'digital_academy_transactions';

function load<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => load(STORAGE_KEY, { user: null, isAuthenticated: false }));
  const [notifications, setNotifications] = useState<Notification[]>(() => load(NOTIF_KEY, []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => load(TX_KEY, []));
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); }, [transactions]);

  // Check if API is reachable on mount
  useEffect(() => {
    const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000';
    fetch(`${BASE_URL}/api/health/`, { signal: AbortSignal.timeout(2000) })
      .then(() => setApiAvailable(true))
      .catch(() => setApiAvailable(false));
  }, []);

  const seedNotifications = (name: string, dest: string) => {
    setNotifications([
      { id: 'n1', message: `Welcome back, ${name}!`, read: false, createdAt: new Date().toISOString(), link: dest },
      { id: 'n2', message: 'New courses added in Web Development', read: false, createdAt: new Date(Date.now() - 86400000).toISOString(), link: '/courses' },
      { id: 'n3', message: 'Complete your profile to get personalized recommendations', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/profile' },
    ]);
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      setTokens(data.access, data.refresh);
      const u: User = {
        id: data.user.id ?? data.user.pk ?? String(Date.now()),
        name: data.user.full_name ?? data.user.name ?? email.split('@')[0],
        email: data.user.email,
        role: data.user.role ?? 'student',
        bio: data.user.bio,
        avatar: data.user.avatar,
        enrolledCourseIds: data.user.enrolled_course_ids ?? [],
        createdAt: data.user.date_joined ?? new Date().toISOString(),
      };
      setState({ user: u, isAuthenticated: true });
      seedNotifications(u.name, '/dashboard');
      setApiAvailable(true);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED' || err.message?.includes('credentials')) throw err;
      // API unreachable — fall back to local user store
      const users: User[] = load('da_users', []);
      let user = users.find(u => u.email === email);
      if (!user) {
        user = { id: crypto.randomUUID(), name: email.split('@')[0], email, role: 'student', enrolledCourseIds: [], createdAt: new Date().toISOString() };
        localStorage.setItem('da_users', JSON.stringify([...users, user]));
      }
      setState({ user, isAuthenticated: true });
      seedNotifications(user.name, '/dashboard');
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor') => {
    try {
      const data = await authApi.register({ name, email, password, role });
      setTokens(data.access, data.refresh);
      const u: User = { id: data.user.id ?? String(Date.now()), name, email, role, enrolledCourseIds: [], createdAt: new Date().toISOString() };
      setState({ user: u, isAuthenticated: true });
      seedNotifications(name, '/dashboard');
      setApiAvailable(true);
    } catch {
      // Offline fallback
      const user: User = { id: crypto.randomUUID(), name, email, role, enrolledCourseIds: [], createdAt: new Date().toISOString() };
      const users: User[] = load('da_users', []);
      localStorage.setItem('da_users', JSON.stringify([...users, user]));
      setState({ user, isAuthenticated: true });
      seedNotifications(name, '/dashboard');
    }
  };

  const loginAsDemo = (role: 'student' | 'instructor') => {
    const isStudent = role === 'student';
    const user: User = {
      id: `demo-${role}`,
      name: isStudent ? 'Alex Johnson' : 'Dr. Angela Yu',
      email: isStudent ? 'student@demo.com' : 'instructor@demo.com',
      role,
      bio: isStudent ? 'Passionate learner exploring web development and design.' : 'Senior software engineer and educator with 10+ years of experience.',
      enrolledCourseIds: isStudent ? ['1', '2', '4'] : [],
      createdAt: '2024-01-15T10:00:00.000Z',
    };
    setState({ user, isAuthenticated: true });
    seedNotifications(user.name, isStudent ? '/dashboard' : '/instructor');
    if (isStudent) {
      setTransactions([
        { id: 'tx1', date: '2024-11-03T14:22:00.000Z', courseTitle: 'The Complete Web Developer Bootcamp 2026', amount: 19.99, status: 'completed' },
        { id: 'tx2', date: '2024-10-18T09:10:00.000Z', courseTitle: 'Data Science and Machine Learning Bootcamp', amount: 29.99, status: 'completed' },
        { id: 'tx3', date: '2024-09-05T16:45:00.000Z', courseTitle: 'Graphic Design Masterclass', amount: 22.99, status: 'completed' },
      ]);
      localStorage.setItem('progress_1', JSON.stringify({ completedLectures: ['0-0', '0-1', '0-2', '1-0', '1-1'] }));
    } else {
      setTransactions([]);
    }
  };

  const logout = () => {
    clearTokens();
    if (apiAvailable) authApi.logout().catch(() => {});
    setState({ user: null, isAuthenticated: false });
    setNotifications([]);
    setTransactions([]);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!state.user) return;
    const updated = { ...state.user, ...updates };
    setState(prev => ({ ...prev, user: updated }));
    if (apiAvailable) {
      authApi.updateProfile({ name: updates.name, email: updates.email, bio: updates.bio, avatar: updates.avatar }).catch(() => {});
    }
    const users: User[] = load('da_users', []);
    const idx = users.findIndex(u => u.id === state.user!.id);
    if (idx >= 0) { users[idx] = updated; localStorage.setItem('da_users', JSON.stringify(users)); }
  };

  const enrollInCourse = (courseId: string, courseTitle: string, amount: number) => {
    if (!state.user) return;
    const updatedEnrolled = [...(state.user.enrolledCourseIds || []), courseId];
    const updated = { ...state.user, enrolledCourseIds: updatedEnrolled };
    setState(prev => ({ ...prev, user: updated }));
    if (apiAvailable) courseApi_enroll(courseId);
    const users: User[] = load('da_users', []);
    const idx = users.findIndex(u => u.id === state.user!.id);
    if (idx >= 0) { users[idx] = updated; localStorage.setItem('da_users', JSON.stringify(users)); }
    const tx: Transaction = { id: crypto.randomUUID(), date: new Date().toISOString(), courseTitle, amount, status: 'completed' };
    setTransactions(prev => [tx, ...prev]);
    setNotifications(prev => [{ id: crypto.randomUUID(), message: `You've enrolled in "${courseTitle}"!`, read: false, createdAt: new Date().toISOString(), link: '/dashboard' }, ...prev]);
  };

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllNotificationsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <AuthContext.Provider value={{ ...state, apiAvailable, login, loginAsDemo, register, logout, updateUser, enrollInCourse, notifications, markNotificationRead, markAllNotificationsRead, transactions }}>
      {children}
    </AuthContext.Provider>
  );
}

// Import courseApi.enroll lazily to avoid circular
async function courseApi_enroll(id: string) {
  const { courseApi } = await import('@/app/services/api');
  courseApi.enroll(id).catch(() => {});
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
