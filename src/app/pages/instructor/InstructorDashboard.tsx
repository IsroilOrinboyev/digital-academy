import { useEffect, useState } from 'react';
import { useAuth } from '@/app/store/AuthContext';
import { courses } from '@/app/data/courses';
import { categoryApi, CategoryItem, courseApi } from '@/app/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, Star, TrendingUp } from 'lucide-react';

type Tab = 'overview' | 'courses' | 'create';

interface LessonFormItem {
  title: string;
  desc: string;
  additional_task: string;
  video: File | null;
  presentation: File | null;
}

interface UnitFormItem {
  title: string;
  desc: string;
  lessons: LessonFormItem[];
}

interface CourseFormState {
  title: string;
  desc: string;
  base_price: number;
  discount_price: number;
  category: string;
  cover_img: File | null;
  units: UnitFormItem[];
}

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
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [form, setForm] = useState<CourseFormState>({
    title: '',
    desc: '',
    base_price: 0,
    discount_price: 0,
    category: '',
    cover_img: null,
    units: [
      {
        title: '',
        desc: '',
        lessons: [{ title: '', desc: '', additional_task: '', video: null, presentation: null }],
      },
    ],
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryApi.list();
        setCategories(response?.data ?? []);
      } catch (err: any) {
        toast.error(err?.message ?? 'Categorylarni yuklab bo\'lmadi.');
      }
    };

    loadCategories();
  }, []);

  const updateUnit = (unitIndex: number, key: 'title' | 'desc', value: string) => {
    setForm(prev => ({
      ...prev,
      units: prev.units.map((unit, idx) => (idx === unitIndex ? { ...unit, [key]: value } : unit)),
    }));
  };

  const updateLesson = (
    unitIndex: number,
    lessonIndex: number,
    key: 'title' | 'desc' | 'additional_task',
    value: string
  ) => {

    setForm(prev => ({
      ...prev,
      units: prev.units.map((unit, idx) => {
        if (idx !== unitIndex) return unit;
        return {
          ...unit,
          lessons: unit.lessons.map((lesson, lIdx) =>
            lIdx === lessonIndex ? { ...lesson, [key]: value } : lesson
          ),
        };
      }),
    }));
  };

  const updateLessonFile = (
    unitIndex: number,
    lessonIndex: number,
    key: 'video' | 'presentation',
    file: File | null
  ) => {
    setForm(prev => ({
      ...prev,
      units: prev.units.map((unit, idx) => {
        if (idx !== unitIndex) return unit;
        return {
          ...unit,
          lessons: unit.lessons.map((lesson, lIdx) =>
            lIdx === lessonIndex ? { ...lesson, [key]: file } : lesson
          ),
        };
      }),
    }));
  };

  const addUnit = () => {
    setForm(prev => ({
      ...prev,
      units: [
        ...prev.units,
        { title: '', desc: '', lessons: [{ title: '', desc: '', additional_task: '', video: null, presentation: null }] },
      ],
    }));
  };

  const addLesson = (unitIndex: number) => {
    setForm(prev => ({
      ...prev,
      units: prev.units.map((unit, idx) =>
        idx === unitIndex
          ? { ...unit, lessons: [...unit.lessons, { title: '', desc: '', additional_task: '', video: null, presentation: null }] }
          : unit
      ),
    }));
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.title.trim() || !form.desc.trim()) {
      toast.error('Course title va description majburiy.');
      return;
    }

    if (!form.units.length || !form.units[0].lessons.length) {
      toast.error("Kamida 1 ta unit va 1 ta lesson bo'lishi kerak.");
      return;
    }

    if (!form.category) {
      toast.error('Category tanlash majburiy.');
      return;
    }

    if (!form.cover_img) {
      toast.error('Course rasmi majburiy.');
      return;
    }

    try {
      setIsCreating(true);

      await courseApi.create({
        title: form.title.trim(),
        desc: form.desc.trim(),
        base_price: Number(form.base_price),
        discount_price: Number(form.discount_price),
        category: form.category,
        cover_img: form.cover_img,
        units: form.units.map(unit => ({
          title: unit.title.trim(),
          desc: unit.desc.trim(),
          lessons: unit.lessons.map(lesson => ({
            title: lesson.title.trim(),
            desc: lesson.desc.trim(),
            additional_task: lesson.additional_task.trim(),
            video: lesson.video,
            presentation: lesson.presentation,
          })),
        })),
      });

      toast.success('Course muvaffaqiyatli yaratildi.');
      setForm({
        title: '',
        desc: '',
        base_price: 0,
        discount_price: 0,
        category: '',
        cover_img: null,
        units: [{ title: '', desc: '', lessons: [{ title: '', desc: '', additional_task: '', video: null, presentation: null }] }],
      });
      setActiveTab('courses');
    } catch (err: any) {
      toast.error(err?.message ?? 'Course yaratishda xatolik yuz berdi.');
    } finally {
      setIsCreating(false);
    }
  };
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
            <form className="space-y-4 max-w-3xl" onSubmit={handleCreateCourse}>
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input
                  placeholder="e.g. Complete React Developer Course"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Short description of the course"
                  value={form.desc}
                  onChange={e => setForm(prev => ({ ...prev, desc: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.base_price}
                    onChange={e => setForm(prev => ({ ...prev, base_price: Number(e.target.value) }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Price</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.discount_price}
                    onChange={e => setForm(prev => ({ ...prev, discount_price: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Category tanlang</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Course Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm"
                  onChange={e => setForm(prev => ({ ...prev, cover_img: e.target.files?.[0] ?? null }))}
                  required
                />
              </div>

              {form.units.map((unit, unitIndex) => (
                <div key={unitIndex} className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Unit {unitIndex + 1}</h3>
                  <div className="space-y-2">
                    <Label>Unit Title</Label>
                    <Input
                      value={unit.title}
                      onChange={e => updateUnit(unitIndex, 'title', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit Description</Label>
                    <Textarea
                      value={unit.desc}
                      onChange={e => updateUnit(unitIndex, 'desc', e.target.value)}
                      required
                    />
                  </div>

                  {unit.lessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="border rounded-md p-3 space-y-2 bg-gray-50">
                      <p className="text-sm font-medium">Lesson {lessonIndex + 1}</p>
                      <Input
                        placeholder="Lesson title"
                        value={lesson.title}
                        onChange={e => updateLesson(unitIndex, lessonIndex, 'title', e.target.value)}
                        required
                      />
                      <Textarea
                        placeholder="Lesson description"
                        value={lesson.desc}
                        onChange={e => updateLesson(unitIndex, lessonIndex, 'desc', e.target.value)}
                        required
                      />
                      <Input
                        placeholder="Additional task"
                        value={lesson.additional_task}
                        onChange={e => updateLesson(unitIndex, lessonIndex, 'additional_task', e.target.value)}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Video (optional)</Label>
                          <input
                            type="file"
                            accept="video/*"
                            className="w-full text-sm"
                            onChange={e => updateLessonFile(unitIndex, lessonIndex, 'video', e.target.files?.[0] ?? null)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Presentation (optional)</Label>
                          <input
                            type="file"
                            accept=".pdf,.ppt,.pptx,.key"
                            className="w-full text-sm"
                            onChange={e => updateLessonFile(unitIndex, lessonIndex, 'presentation', e.target.files?.[0] ?? null)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={() => addLesson(unitIndex)}>
                    Add Lesson
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addUnit}>
                Add Unit
              </Button>

              <div className="flex gap-3">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Course'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setActiveTab('courses')}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
