import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { CourseCard } from '../components/CourseCard';
import { courses, categories } from '../data/courses';
import { ArrowRight, Play } from 'lucide-react';

export function Home() {
  const featuredCourses = courses.filter((course) => course.bestseller).slice(0, 4);
  const popularCourses = courses.slice(0, 5);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl mb-8 text-purple-100">
              Start, switch, or advance your career with thousands of courses from
              world-class universities and companies.
            </p>
            <div className="flex gap-4">
              <Link to="/courses">
                <Button size="lg" variant="secondary" className="gap-2">
                  Explore Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent text-white border-white hover:bg-white/10">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">65M+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">210K+</div>
              <div className="text-gray-600">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">75+</div>
              <div className="text-gray-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">850M+</div>
              <div className="text-gray-600">Enrollments</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
              <p className="text-gray-600">Top picks from our bestselling collection</p>
            </div>
            <Link to="/courses">
              <Button variant="outline" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center">Top Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/courses?category=${category.id}`}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Popular Courses</h2>
            <p className="text-gray-600">Students are learning from these trending courses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-purple-600 text-white py-20">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Become an Instructor</h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Share your knowledge with millions of students worldwide. Create an online video course,
            reach students across the globe, and earn money.
          </p>
          <Button size="lg" variant="secondary" className="gap-2">
            Start Teaching Today
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 border-t">
        <div className="max-w-[1400px] mx-auto px-6">
          <h3 className="text-center text-gray-600 mb-8">
            Trusted by over 15,000 companies and millions of learners around the world
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <div className="text-2xl font-bold">Volkswagen</div>
            <div className="text-2xl font-bold">Samsung</div>
            <div className="text-2xl font-bold">Cisco</div>
            <div className="text-2xl font-bold">Vimeo</div>
            <div className="text-2xl font-bold">P&G</div>
            <div className="text-2xl font-bold">HP</div>
          </div>
        </div>
      </section>
    </div>
  );
}