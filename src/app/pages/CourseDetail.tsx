import { useParams, Link, useNavigate } from 'react-router';
import { courses } from '../data/courses';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Star,
  Clock,
  Users,
  Globe,
  Award,
  PlayCircle,
  FileText,
  CheckCircle,
  ShoppingCart,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/app/store/CartContext';
import { useWishlist } from '@/app/store/WishlistContext';
import { useAuth } from '@/app/store/AuthContext';
import { toast } from 'sonner';

export function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === id);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const { addToCart, isInCart } = useCart();
  const { toggle, has } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const inCart = course ? isInCart(course.id) : false;
  const inWishlist = course ? has(course.id) : false;

  if (!course) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-600 mb-8">The course you're looking for doesn't exist.</p>
        <Link to="/courses">
          <Button>Browse All Courses</Button>
        </Link>
      </div>
    );
  }

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const relatedCourses = courses
    .filter((c) => c.category === course.category && c.id !== course.id)
    .slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Content */}
            <div className="flex-1">
              <div className="mb-4">
                <Link
                  to="/courses"
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  ← Back to courses
                </Link>
              </div>

              {course.bestseller && (
                <Badge className="mb-4 bg-yellow-500 text-black hover:bg-yellow-600">
                  Bestseller
                </Badge>
              )}

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{course.rating.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(course.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-purple-300">
                    ({course.reviewCount.toLocaleString()} ratings)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm mb-6">
                <span>Created by</span>
                <span className="text-purple-400">{course.instructor}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Last updated {course.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            {/* Right Card - Desktop */}
            <div className="hidden lg:block w-96">
              <Card className="sticky top-24">
                <div className="relative aspect-video">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-purple-600" />
                    </div>
                  </button>
                </div>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-bold">${course.price}</span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${course.originalPrice}
                        </span>
                      )}
                    </div>
                    {course.originalPrice && (
                      <Badge variant="destructive">
                        {Math.round(
                          ((course.originalPrice - course.price) / course.originalPrice) * 100
                        )}
                        % OFF
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    {inCart ? (
                      <Link to="/cart">
                        <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                          Go to Cart
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        size="lg"
                        onClick={() => {
                          addToCart({
                            courseId: course.id,
                            title: course.title,
                            instructor: course.instructor,
                            price: course.price,
                            originalPrice: course.originalPrice,
                            image: course.image,
                          });
                          toast.success('Added to cart!');
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" size="lg">
                      Buy Now
                    </Button>
                  </div>

                  <p className="text-center text-sm text-gray-600 mb-4">
                    30-Day Money-Back Guarantee
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration} on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>
                        {course.curriculum.reduce((acc, curr) => acc + curr.lectures, 0)} lectures
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Full lifetime access</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => toggle(course.id)}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                      {inWishlist ? 'Wishlisted' : 'Wishlist'}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden sticky bottom-0 bg-white border-t p-4 shadow-lg z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${course.price}</span>
              {course.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${course.originalPrice}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggle(course.id)}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            {inCart ? (
              <Link to="/cart">
                <Button className="bg-green-600 hover:bg-green-700">Go to Cart</Button>
              </Link>
            ) : (
              <Button
                onClick={() => {
                  addToCart({
                    courseId: course.id,
                    title: course.title,
                    instructor: course.instructor,
                    price: course.price,
                    originalPrice: course.originalPrice,
                    image: course.image,
                  });
                  toast.success('Added to cart!');
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <div className="max-w-4xl">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* What You'll Learn */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-gray-600">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Course Content</h2>
                <p className="text-gray-600">
                  {course.curriculum.length} sections •{' '}
                  {course.curriculum.reduce((acc, curr) => acc + curr.lectures, 0)} lectures •{' '}
                  {course.duration} total length
                </p>
              </div>

              {course.curriculum.map((section, index) => (
                <Card key={index}>
                  <button
                    onClick={() => toggleSection(index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSections.includes(index) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                      <div className="text-left">
                        <h3 className="font-semibold">{section.section}</h3>
                        <p className="text-sm text-gray-600">
                          {section.lectures} lectures • {section.duration}
                        </p>
                      </div>
                    </div>
                  </button>
                  {expandedSections.includes(index) && (
                    <CardContent className="px-4 pb-4">
                      <div className="space-y-2 pl-8">
                        {[...Array(Math.min(5, section.lectures))].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-2 border-b last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                Lecture {i + 1}: Introduction to {section.section}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.floor(Math.random() * 20) + 5} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Instructor</h2>
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold shrink-0">
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{course.instructor}</h3>
                      <p className="text-gray-600 mb-4">
                        Professional Instructor & Course Creator
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.7 Instructor Rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          <span>126,543 Reviews</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>1,234,567 Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4" />
                          <span>35 Courses</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {course.instructor} is a highly acclaimed instructor with years of experience in
                    teaching and course creation. With a passion for education and a deep
                    understanding of the subject matter, they have helped millions of students
                    achieve their learning goals.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                  <div className="flex items-start gap-8 mb-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold mb-2">{course.rating.toFixed(1)}</div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(course.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">Course Rating</div>
                    </div>
                    <div className="flex-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1 w-20">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{rating}</span>
                          </div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${Math.max(10, Math.random() * 90)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16">
                            {Math.floor(Math.random() * 50)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Write a Review (enrolled users only) */}
                {isAuthenticated && user?.enrolledCourseIds?.includes(course.id) && (
                  <div className="border rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-3">Write a Review</h3>
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)}>
                          <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      className="w-full border rounded p-2 text-sm h-20 resize-none"
                      placeholder="Share your experience..."
                    />
                    <Button
                      size="sm"
                      className="mt-2 bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        toast.success('Review submitted!');
                        setReviewComment('');
                        setReviewRating(0);
                      }}
                    >
                      Submit Review
                    </Button>
                  </div>
                )}

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[1, 2, 3].map((review) => (
                    <Card key={review}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            U
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">User {review}</span>
                              <span className="text-sm text-gray-500">• 2 weeks ago</span>
                            </div>
                            <div className="flex mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">
                              This course is absolutely fantastic! The instructor explains everything
                              clearly and the projects are really helpful for understanding the
                              concepts. Highly recommended for anyone looking to learn this subject.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Related Courses */}
          {relatedCourses.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">More Courses You Might Like</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedCourses.map((relatedCourse) => (
                  <Link key={relatedCourse.id} to={`/course/${relatedCourse.id}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="flex gap-4">
                        <img
                          src={relatedCourse.image}
                          alt={relatedCourse.title}
                          className="w-32 h-32 object-cover rounded-l-lg"
                        />
                        <CardContent className="p-4 flex-1">
                          <h3 className="font-semibold mb-2 line-clamp-2">
                            {relatedCourse.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{relatedCourse.instructor}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm">
                              {relatedCourse.rating.toFixed(1)}
                            </span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(relatedCourse.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-lg font-bold">${relatedCourse.price}</span>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
