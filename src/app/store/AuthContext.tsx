import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, Notification, Transaction } from '@/app/types';

interface AuthContextType extends AuthState {
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

function loadAuth(): AuthState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { user: null, isAuthenticated: false };
}

function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(TX_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuth);
  const [notifications, setNotifications] = useState<Notification[]>(loadNotifications);
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(TX_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const login = async (email: string, _password: string) => {
    const stored = localStorage.getItem('da_users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    let user = users.find(u => u.email === email);
    if (!user) {
      user = {
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email,
        role: 'student',
        enrolledCourseIds: [],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem('da_users', JSON.stringify(users));
    }
    setState({ user, isAuthenticated: true });
    setNotifications([
      { id: '1', message: 'Welcome back to Digital Academy!', read: false, createdAt: new Date().toISOString(), link: '/dashboard' },
      { id: '2', message: 'New courses added in Web Development', read: false, createdAt: new Date(Date.now() - 86400000).toISOString(), link: '/courses' },
      { id: '3', message: 'Complete your profile to get personalized recommendations', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/dashboard' },
    ]);
  };

  const register = async (name: string, email: string, _password: string, role: 'student' | 'instructor') => {
    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      enrolledCourseIds: [],
      createdAt: new Date().toISOString(),
    };
    const stored = localStorage.getItem('da_users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    users.push(user);
    localStorage.setItem('da_users', JSON.stringify(users));
    setState({ user, isAuthenticated: true });
    setNotifications([
      { id: '1', message: `Welcome to Digital Academy, ${name}!`, read: false, createdAt: new Date().toISOString(), link: '/dashboard' },
    ]);
  };

  const loginAsDemo = (role: 'student' | 'instructor') => {
    const isStudent = role === 'student';
    const user: User = {
      id: `demo-${role}`,
      name: isStudent ? 'Alex Johnson' : 'Dr. Angela Yu',
      email: isStudent ? 'student@demo.com' : 'instructor@demo.com',
      role,
      bio: isStudent
        ? 'Passionate learner exploring web development and design.'
        : 'Senior software engineer and educator with 10+ years of experience.',
      enrolledCourseIds: isStudent ? ['1', '2', '4'] : [],
      createdAt: '2024-01-15T10:00:00.000Z',
    };
    setState({ user, isAuthenticated: true });
    setNotifications([
      { id: 'n1', message: `Welcome to the demo, ${user.name}!`, read: false, createdAt: new Date().toISOString(), link: isStudent ? '/dashboard' : '/instructor' },
      { id: 'n2', message: 'New courses added in Web Development', read: false, createdAt: new Date(Date.now() - 86400000).toISOString(), link: '/courses' },
      { id: 'n3', message: 'Complete your profile to get personalized recommendations', read: true, createdAt: new Date(Date.now() - 172800000).toISOString(), link: '/dashboard' },
    ]);
    if (isStudent) {
      setTransactions([
        { id: 'tx1', date: '2024-11-03T14:22:00.000Z', courseTitle: 'The Complete Web Developer Bootcamp 2026', amount: 19.99, status: 'completed' },
        { id: 'tx2', date: '2024-10-18T09:10:00.000Z', courseTitle: 'Data Science and Machine Learning Bootcamp', amount: 29.99, status: 'completed' },
        { id: 'tx3', date: '2024-09-05T16:45:00.000Z', courseTitle: 'Graphic Design Masterclass - Learn GREAT Design', amount: 22.99, status: 'completed' },
      ]);
      // Seed some lecture progress for course 1
      const progress = { completedLectures: ['0-0', '0-1', '0-2', '1-0', '1-1'] };
      localStorage.setItem('progress_1', JSON.stringify(progress));
    } else {
      setTransactions([]);
    }
  };

  const logout = () => {
    setState({ user: null, isAuthenticated: false });
    setNotifications([]);
    setTransactions([]);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!state.user) return;
    const updated = { ...state.user, ...updates };
    setState(prev => ({ ...prev, user: updated }));
    const stored = localStorage.getItem('da_users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    const idx = users.findIndex(u => u.id === state.user!.id);
    if (idx >= 0) { users[idx] = updated; localStorage.setItem('da_users', JSON.stringify(users)); }
  };

  const enrollInCourse = (courseId: string, courseTitle: string, amount: number) => {
    if (!state.user) return;
    const updatedEnrolled = [...(state.user.enrolledCourseIds || []), courseId];
    const updated = { ...state.user, enrolledCourseIds: updatedEnrolled };
    setState(prev => ({ ...prev, user: updated }));
    const stored = localStorage.getItem('da_users');
    const users: User[] = stored ? JSON.parse(stored) : [];
    const idx = users.findIndex(u => u.id === state.user!.id);
    if (idx >= 0) { users[idx] = updated; localStorage.setItem('da_users', JSON.stringify(users)); }
    const tx: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      courseTitle,
      amount,
      status: 'completed',
    };
    setTransactions(prev => [tx, ...prev]);
    setNotifications(prev => [{
      id: crypto.randomUUID(),
      message: `You've enrolled in "${courseTitle}"!`,
      read: false,
      createdAt: new Date().toISOString(),
      link: '/dashboard',
    }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      loginAsDemo,
      register,
      logout,
      updateUser,
      enrollInCourse,
      notifications,
      markNotificationRead,
      markAllNotificationsRead,
      transactions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
