import { useState } from 'react';
import { useAuth } from '@/app/store/AuthContext';
import { courses } from '@/app/data/courses';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Star, TrendingUp } from 'lucide-react';

type Tab = 'overview' | 'courses' | 'create';

const mockChartData = [
  { month: 'Oct', enrollments: 12 },
  { month: 'Nov', enrollments: 28 },
  { month: 'Dec', enrollments: 19 },
  { month: 'Jan', enrollments: 34 },
  { month: 'Feb', enrollments: 41 },
  { month: 'Mar', enrollments: 38 },
];

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  // In demo mode, show all courses since mock data has pre-set instructor names
  const matchedCourses = courses.filter(c => c.instructor === user?.name);
  const instructorCourses = matchedCourses.length > 0 ? matchedCourses : courses;
  const isDemo = matchedCourses.length === 0;

  const totalStudents = instructorCourses.reduce((sum, c) => sum + c.students, 0);
  const avgRating = instructorCourses.length
    ? (instructorCourses.reduce((sum, c) => sum + c.rating, 0) / instructorCourses.length).toFixed(1)
    : '–';
  const revenue = instructorCourses.reduce((sum, c) => sum + c.price * c.students * 0.37, 0);

  const stats = [
    { label: 'Total Students', value: totalStudents.toLocaleString(), icon: <Users className="w-5 h-5 text-blue-500" /> },
    { label: 'Total Courses', value: instructorCourses.length, icon: <BookOpen className="w-5 h-5 text-purple-500" /> },
    { label: 'Avg Rating', value: avgRating, icon: <Star className="w-5 h-5 text-yellow-500" /> },
    { label: 'Revenue', value: `$${revenue.toFixed(0)}`, icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Instructor Dashboard</h1>
      {isDemo && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-800">
          <strong>Demo mode:</strong> Showing sample courses. Create your own courses using the &ldquo;Create Course&rdquo; tab.
        </div>
      )}
      <div className="flex gap-4 mb-8 border-b">
        {(['overview', 'courses', 'create'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'create' ? 'Create Course' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">{stat.icon}</div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader><CardTitle>Monthly Enrollments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#9333ea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'courses' && (
        <div>
          <h2 className="text-xl font-bold mb-4">My Courses ({instructorCourses.length})</h2>
          {instructorCourses.length === 0 ? null : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Course</th>
                    <th className="text-left py-3">Students</th>
                    <th className="text-left py-3">Rating</th>
                    <th className="text-left py-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {instructorCourses.map(c => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{c.title}</td>
                      <td className="py-3">{c.students.toLocaleString()}</td>
                      <td className="py-3">{c.rating.toFixed(1)} ⭐</td>
                      <td className="py-3">${c.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <Card>
          <CardHeader><CardTitle>Create New Course</CardTitle></CardHeader>
          <CardContent>
            <form
              className="space-y-4 max-w-xl"
              onSubmit={e => { e.preventDefault(); toast.success('Course saved as draft!'); setActiveTab('courses'); }}
            >
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input placeholder="e.g. Complete React Developer Course" required />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input placeholder="Short description of the course" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Development</option>
                    <option>Business</option>
                    <option>Design</option>
                    <option>Marketing</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>All Levels</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min="0" step="0.01" placeholder="29.99" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save as Draft</Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab('courses')}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
