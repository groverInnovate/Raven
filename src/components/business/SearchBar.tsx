"use client";

import { useState } from 'react';
import { Input, Button } from '../ui';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string) => void;
  placeholder?: string;
  sortOptions?: { value: string; label: string }[];
}

const defaultSortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function SearchBar({
  onSearch,
  onSort,
  placeholder = "Search for items...",
  sortOptions = defaultSortOptions
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSort(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            className="flex-1"
          />
          <Button type="submit" variant="primary">
            Search
          </Button>
        </div>
      </form>

      {/* Sort Dropdown */}
      <div className="sm:w-48">
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          className="ghost-input w-full px-3 py-2 text-sm"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
