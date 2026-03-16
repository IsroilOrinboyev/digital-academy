import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '@/app/store/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'instructor';
}

export default function Signup() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    defaultValues: { role: 'student' }
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await registerUser(data.name, data.email, data.password, data.role);
      toast.success('Account created! Welcome to Digital Academy.');
      navigate('/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-2">D</div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join millions of learners worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Min. 8 characters" {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Repeat password" {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (v: string) => v === watch('password') || 'Passwords do not match'
              })} />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                {(['student', 'instructor'] as const).map(role => (
                  <label key={role} className="cursor-pointer">
                    <input type="radio" value={role} {...register('role')} className="sr-only peer" />
                    <div className="border-2 rounded-lg p-3 text-center peer-checked:border-purple-600 peer-checked:bg-purple-50 hover:border-purple-300 transition-colors">
                      <div className="text-lg">{role === 'student' ? '🎓' : '👨‍🏫'}</div>
                      <div className="text-sm font-medium capitalize">{role}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:underline font-medium">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
