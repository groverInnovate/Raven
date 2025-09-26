"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  conditions: string[];
  location?: string;
}

const categories = [
  'Electronics', 'Fashion', 'Furniture', 'Books', 'Sports', 
  'Art', 'Jewelry', 'Collectibles', 'Home & Garden', 'Other'
];

const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

const indianCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 
  'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

export default function FilterSidebar({ onFilterChange, onClearFilters }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100000],
    conditions: [],
    location: ''
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleCondition = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter(c => c !== condition)
      : [...filters.conditions, condition];
    updateFilters({ conditions: newConditions });
  };

  const handlePriceChange = (index: number, value: string) => {
    const newRange = [...filters.priceRange] as [number, number];
    newRange[index] = parseInt(value) || 0;
    updateFilters({ priceRange: newRange });
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      priceRange: [0, 100000] as [number, number],
      conditions: [],
      location: ''
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = 
    filters.categories.length > 0 || 
    filters.conditions.length > 0 || 
    filters.location !== '' ||
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 100000;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Price Range (₹)</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="ghost-input w-full px-2 py-1 text-sm"
                min="0"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="ghost-input w-full px-2 py-1 text-sm"
                min="0"
              />
            </div>
            <div className="text-xs text-gray-500">
              ₹{filters.priceRange[0].toLocaleString()} - ₹{filters.priceRange[1].toLocaleString()}
            </div>
          </div>
        </div>

        {/* Condition */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Condition</h4>
          <div className="space-y-2">
            {conditions.map((condition) => (
              <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.conditions.includes(condition)}
                  onChange={() => toggleCondition(condition)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{condition}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Location</h4>
          <select
            value={filters.location}
            onChange={(e) => updateFilters({ location: e.target.value })}
            className="ghost-input w-full px-3 py-2 text-sm"
          >
            <option value="">All Locations</option>
            {indianCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.categories.map((category) => (
                <Badge key={category} variant="secondary" size="sm">
                  {category}
                </Badge>
              ))}
              {filters.conditions.map((condition) => (
                <Badge key={condition} variant="info" size="sm">
                  {condition}
                </Badge>
              ))}
              {filters.location && (
                <Badge variant="default" size="sm">
                  📍 {filters.location}
                </Badge>
              )}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
                <Badge variant="warning" size="sm">
                  ₹{filters.priceRange[0].toLocaleString()}-{filters.priceRange[1].toLocaleString()}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
