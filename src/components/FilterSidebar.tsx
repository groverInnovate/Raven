"use client";

interface FilterSidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: number[];
  onPriceRangeChange: (range: number[]) => void;
  condition: string;
  onConditionChange: (condition: string) => void;
}

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Furniture",
  "Collectibles",
  "Books",
  "Sports",
  "Art",
  "Jewelry",
  "Other"
];

const conditions = [
  "All",
  "New",
  "Like New",
  "Excellent",
  "Good",
  "Fair"
];

export default function FilterSidebar({
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  condition,
  onConditionChange,
}: FilterSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Filters
      </h3>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Category
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selectedCategory === cat}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Price Range (₹)
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([parseFloat(e.target.value) || 0, priceRange[1]])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], parseFloat(e.target.value) || 150000])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            Current range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Condition Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Condition
        </h4>
        <div className="space-y-2">
          {conditions.map((cond) => (
            <label key={cond} className="flex items-center">
              <input
                type="radio"
                name="condition"
                value={cond}
                checked={condition === cond}
                onChange={(e) => onConditionChange(e.target.value)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {cond}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => {
          onCategoryChange("All");
          onPriceRangeChange([0, 5]);
          onConditionChange("All");
        }}
        className="w-full px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}
