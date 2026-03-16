import { Link } from 'react-router';
import { Star, Clock, Users } from 'lucide-react';
import { Course } from '../data/courses';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter } from './ui/card';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link to={`/course/${course.id}`}>
      <Card className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {course.bestseller && (
            <Badge className="absolute top-3 left-3 bg-yellow-500 text-black hover:bg-yellow-600">
              Bestseller
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-base line-clamp-2 mb-2 group-hover:text-purple-600 transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-sm">{course.rating.toFixed(1)}</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(course.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({course.reviewCount.toLocaleString()})
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{course.students.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary">{course.level}</Badge>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">${course.price}</span>
            {course.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${course.originalPrice}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
