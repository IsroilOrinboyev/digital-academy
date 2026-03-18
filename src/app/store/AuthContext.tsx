import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Notification, Transaction } from '@/app/types';
import { authApi, setTokens, clearTokens } from '@/app/services/api';

interface AuthContextType extends AuthState {
  apiAvailable: boolean;
  login: (email: string, password: string) => Promise<'student' | 'instructor'>;
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

function mapApiRole(role?: string): 'student' | 'instructor' {
  const normalized = role?.toUpperCase();
  if (normalized === 'TEACHER' || normalized === 'ADMIN' || normalized === 'INSTRUCTOR') return 'instructor';
  return 'student';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => load(STORAGE_KEY, { user: null, isAuthenticated: false }));
  const [notifications, setNotifications] = useState<Notification[]>(() => load(NOTIF_KEY, []));
  const [transactions, setTransactions] = useState<Transaction[]>(() => load(TX_KEY, []));
  const [apiAvailable, setApiAvailable] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(TX_KEY, JSON.stringify(transactions)); }, [transactions]);

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
      if (
        !data?.data?.tokens?.access ||
        !data?.data?.tokens?.refresh ||
        !data?.data?.user?.email
      ) {
        throw new Error('API response is empty or invalid.');
      }

      setTokens(data.data.tokens.access, data.data.tokens.refresh);
      const role = mapApiRole(data.data.user.role);
      const u: User = {
        id: data.data.user.id ?? String(Date.now()),
        name: data.data.user.username ?? email.split('@')[0],
        email: data.data.user.email,
        role,
        enrolledCourseIds: [],
        createdAt: new Date().toISOString(),
      };
      setState({ user: u, isAuthenticated: true });
      seedNotifications(u.name, role === 'instructor' ? '/instructor' : '/profile');
      setApiAvailable(true);
      return role;
    } catch (err: any) {
      setApiAvailable(false);
      throw new Error(err?.message ?? 'API error');
    }
  };

  const register = async (name: string, email: string, password: string, role: 'student' | 'instructor') => {
    try {
      const data = await authApi.register({ name, email, password, role });
      setTokens(data.access, data.refresh);
      const u: User = { id: data.user.id ?? String(Date.now()), name, email, role, enrolledCourseIds: [], createdAt: new Date().toISOString() };
      setState({ user: u, isAuthenticated: true });
      seedNotifications(name, role === 'instructor' ? '/instructor' : '/profile');
      setApiAvailable(true);
    } catch {
      // Offline fallback
      const user: User = { id: crypto.randomUUID(), name, email, role, enrolledCourseIds: [], createdAt: new Date().toISOString() };
      const users: User[] = load('da_users', []);
      localStorage.setItem('da_users', JSON.stringify([...users, user]));
      setState({ user, isAuthenticated: true });
      seedNotifications(name, role === 'instructor' ? '/instructor' : '/profile');
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
    <AuthContext.Provider value={{ ...state, apiAvailable, login, register, logout, updateUser, enrollInCourse, notifications, markNotificationRead, markAllNotificationsRead, transactions }}>
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
