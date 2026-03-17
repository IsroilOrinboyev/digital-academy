import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { CourseCard } from '../components/CourseCard';
import { courses, categories } from '../data/courses';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FilterSidebar } from '../components/FilterSidebar';
import { X, BookOpen } from 'lucide-react';

export function CourseListing() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 150]);
  const [sortBy, setSortBy] = useState('popular');

  const toggleCategory = (id: string) =>
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const toggleLevel = (level: string) =>
    setSelectedLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setPriceRange([0, 150]);
  };

  let filteredCourses = courses.filter(course => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) return false;
    if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) return false;
    if (course.price < priceRange[0] || course.price > priceRange[1]) return false;
    return true;
  });

  if (sortBy === 'price-low') filteredCourses.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filteredCourses.sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filteredCourses.sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'newest') filteredCourses.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

  const activeCategoryNames = selectedCategories.map(id => categories.find(c => c.id === id)?.name ?? id);
  const hasActiveFilters = selectedCategories.length > 0 || selectedLevels.length > 0 || priceRange[0] > 0 || priceRange[1] < 150;

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Page header */}
      <div className="bg-white border-b">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-1">All Courses</h1>
          <p className="text-gray-500 text-sm">
            Discover your next skill — {courses.length} courses available
          </p>
          {/* Active filter pills */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {activeCategoryNames.map(name => (
                <span key={name} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {name}
                  <button onClick={() => toggleCategory(categories.find(c => c.name === name)!.id)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedLevels.map(level => (
                <span key={level} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {level}
                  <button onClick={() => toggleLevel(level)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 150) && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  ${priceRange[0]}–${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 150])}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-medium ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar
            selectedCategories={selectedCategories}
            selectedLevels={selectedLevels}
            priceRange={priceRange}
            onToggleCategory={toggleCategory}
            onToggleLevel={toggleLevel}
            onPriceRangeChange={setPriceRange}
            onReset={resetFilters}
          />

          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-6 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-sm text-gray-600 font-medium">
                <span className="text-gray-900 font-bold">{filteredCourses.length}</span> courses found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden sm:inline">Sort by</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 h-8 text-sm border-gray-200">
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
            </div>

            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl text-center py-20 px-6 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No courses found</h3>
                <p className="text-gray-500 text-sm mb-6">Try adjusting your filters to see more results.</p>
                <Button variant="outline" onClick={resetFilters} className="gap-2">
                  <X className="w-4 h-4" /> Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
