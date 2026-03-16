import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { CourseCard } from '../components/CourseCard';
import { courses } from '../data/courses';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FilterSidebar } from '../components/FilterSidebar';

export function CourseListing() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 150]);
  const [sortBy, setSortBy] = useState('popular');

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange([0, 150]);
  };

  let filteredCourses = courses.filter((course) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
      return false;
    }
    if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
      return false;
    }
    if (course.price < priceRange[0] || course.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  // Sort courses
  if (sortBy === 'price-low') {
    filteredCourses.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    filteredCourses.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filteredCourses.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    filteredCourses.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">All Courses</h1>
        <p className="text-gray-600">
          {filteredCourses.length} courses found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <FilterSidebar
          selectedCategories={selectedCategories}
          selectedLevels={selectedLevels}
          priceRange={priceRange}
          onToggleCategory={toggleCategory}
          onToggleLevel={toggleLevel}
          onPriceRangeChange={setPriceRange}
          onReset={resetFilters}
        />

        {/* Courses Grid */}
        <div className="flex-1">
          {/* Sort */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              Showing {filteredCourses.length} results
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Courses */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No courses found matching your filters.</p>
              <Button variant="outline" onClick={resetFilters}>
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
