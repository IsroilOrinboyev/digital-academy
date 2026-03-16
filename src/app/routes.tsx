import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CourseListing } from './pages/CourseListing';
import { CourseDetail } from './pages/CourseDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import NotFound from './pages/NotFound';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import Learn from './pages/Learn';
import Search from './pages/Search';

export const router = createBrowserRouter([
  // Standalone pages (no Layout)
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    path: '/forgot-password',
    Component: ForgotPassword,
  },
  {
    path: '/learn/:courseId',
    element: (
      <ProtectedRoute>
        <Learn />
      </ProtectedRoute>
    ),
  },
  // Pages with Layout
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: 'courses',
        Component: CourseListing,
      },
      {
        path: 'course/:id',
        Component: CourseDetail,
      },
      {
        path: 'search',
        Component: Search,
      },
      {
        path: 'cart',
        Component: Cart,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'instructor',
        element: (
          <ProtectedRoute requireRole="instructor">
            <InstructorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        Component: NotFound,
      },
    ],
  },
]);
