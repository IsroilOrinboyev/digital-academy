import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/app/store/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  const handleDemo = (role: 'student' | 'instructor') => {
    loginAsDemo(role);
    toast.success(`Logged in as demo ${role}!`);
    navigate(role === 'instructor' ? '/instructor' : '/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">D</div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your Digital Academy account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Demo access section */}
          <div className="mb-5 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-3">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemo('student')}
                className="flex flex-col items-center gap-1 rounded-lg border-2 border-purple-200 bg-white px-3 py-3 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <span className="text-2xl">🎓</span>
                <span className="text-sm font-semibold text-gray-800">Student Demo</span>
                <span className="text-xs text-gray-500">3 enrolled courses</span>
              </button>
              <button
                onClick={() => handleDemo('instructor')}
                className="flex flex-col items-center gap-1 rounded-lg border-2 border-purple-200 bg-white px-3 py-3 text-left hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <span className="text-2xl">👨‍🏫</span>
                <span className="text-sm font-semibold text-gray-800">Instructor Demo</span>
                <span className="text-xs text-gray-500">Dashboard + analytics</span>
              </button>
            </div>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-500">or sign in with your account</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:underline font-medium">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
