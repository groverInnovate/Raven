"use client";

import { useState } from "react";
import Link from "next/link";
import ListingCard from "../../components/ListingCard";
import SearchBar from "../../components/SearchBar";
import FilterSidebar from "../../components/FilterSidebar";

// Mock data for listings
const mockListings = [
  {
    id: "1",
    title: "Vintage Leather Jacket",
    description: "Authentic vintage leather jacket from the 1980s. Excellent condition with minimal wear.",
    price: 8500,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop",
    seller: "0x1234...5678",
    sellerName: "VintageCollector",
    sellerRating: 4.8,
    category: "Fashion",
    condition: "Excellent",
    location: "Mumbai, India",
    createdAt: "2024-01-15",
    status: "active" as const
  },
  {
    id: "2",
    title: "MacBook Pro 16-inch",
    description: "2023 MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Perfect for developers and creators.",
    price: 120000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    seller: "0x9876...5432",
    sellerName: "TechGuru",
    sellerRating: 4.9,
    category: "Electronics",
    condition: "Like New",
    location: "Bangalore, India",
    createdAt: "2024-01-14",
    status: "active" as const
  },
  {
    id: "3",
    title: "Handcrafted Wooden Table",
    description: "Beautiful oak dining table handcrafted by local artisan. Seats 6 people comfortably.",
    price: 25000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    seller: "0x5555...7777",
    sellerName: "WoodCrafter",
    sellerRating: 4.7,
    category: "Furniture",
    condition: "New",
    location: "Jaipur, India",
    createdAt: "2024-01-13",
    status: "active" as const
  },
  {
    id: "4",
    title: "Rare Pokemon Card Collection",
    description: "Complete first edition Pokemon card set. All cards in mint condition with protective sleeves.",
    price: 75000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
    seller: "0x2222...8888",
    sellerName: "CardCollector",
    sellerRating: 4.6,
    category: "Collectibles",
    condition: "Mint",
    location: "Delhi, India",
    createdAt: "2024-01-12",
    status: "active" as const
  },
  {
    id: "5",
    title: "Professional Camera Lens",
    description: "Canon EF 70-200mm f/2.8L IS III USM lens. Perfect for professional photography.",
    price: 45000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop",
    seller: "0x3333...9999",
    sellerName: "PhotoPro",
    sellerRating: 4.8,
    category: "Electronics",
    condition: "Excellent",
    location: "Chennai, India",
    createdAt: "2024-01-11",
    status: "active" as const
  },
  {
    id: "6",
    title: "Designer Sneakers",
    description: "Limited edition designer sneakers, size 10. Never worn, still in original box.",
    price: 12000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
    seller: "0x4444...1111",
    sellerName: "SneakerHead",
    sellerRating: 4.5,
    category: "Fashion",
    condition: "New",
    location: "Pune, India",
    createdAt: "2024-01-10",
    status: "active" as const
  }
];

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 150000]);
  const [condition, setCondition] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Filter listings based on search and filters
  const filteredListings = mockListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || listing.category === selectedCategory;
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1];
    const matchesCondition = condition === "All" || listing.condition === condition;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesCondition;
  });

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                👻 GhostPalace
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/onboarding"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover unique items from sellers around the world
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              condition={condition}
              onConditionChange={setCondition}
            />
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600 dark:text-gray-300">
                {sortedListings.length} items found
              </p>
            </div>
            
            {sortedListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
