import { categories } from '@/app/data/courses';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategories: string[];
  selectedLevels: string[];
  priceRange: number[];
  onToggleCategory: (categoryId: string) => void;
  onToggleLevel: (level: string) => void;
  onPriceRangeChange: (value: number[]) => void;
  onReset: () => void;
}

export function FilterSidebar({
  selectedCategories,
  selectedLevels,
  priceRange,
  onToggleCategory,
  onToggleLevel,
  onPriceRangeChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside className="lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Filters</h2>
        </div>

        {/* Categories */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onToggleCategory(category.id)}
                />
                <Label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm cursor-pointer flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-3">Level</h3>
          <div className="space-y-2">
            {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`level-${level}`}
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={() => onToggleLevel(level)}
                />
                <Label htmlFor={`level-${level}`} className="text-sm cursor-pointer">
                  {level}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="border-b pb-4">
          <h3 className="font-semibold mb-3">Price Range</h3>
          <div className="space-y-4">
            <Slider
              min={0}
              max={150}
              step={5}
              value={priceRange}
              onValueChange={onPriceRangeChange}
              className="mt-4"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Reset Filters */}
        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </aside>
  );
}
