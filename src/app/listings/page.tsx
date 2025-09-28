"use client";

import { useState, useEffect } from "react";
import { 
  PageLayout, 
  ListingCard, 
  SearchBar, 
  FilterSidebar, 
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "../../components";
import type { Listing, FilterState } from "../../components";

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100000],
    conditions: [],
    location: ""
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [supabaseListings, setSupabaseListings] = useState<Listing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Load listings from Supabase on component mount
  useEffect(() => {
    loadSupabaseListings();
  }, []);

  const loadSupabaseListings = async () => {
    setIsLoadingListings(true);
    try {
      console.log('🔍 Loading listings from Supabase...');
      const response = await fetch('/api/listings');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert Supabase listings to UI listing format
        const convertedListings: Listing[] = result.data.map((listing: any) => ({
          id: listing.id.toString(),
          title: listing.title,
          description: listing.description || 'No description provided',
          price: listing.price,
          currency: 'PYUSD',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop', // Default API image
          seller: listing.seller_address?.substring(0, 10) + '...' || 'Unknown',
          sellerName: `Seller ${listing.seller_address?.substring(0, 6) || 'Unknown'}`,
          sellerRating: 4.5, // Default rating
          category: listing.category || 'API Services',
          condition: 'Digital Service',
          location: 'India',
          createdAt: listing.created_at,
          status: 'active' as const
        }));
        
        setSupabaseListings(convertedListings);
        console.log(`✅ Loaded ${convertedListings.length} listings from Supabase`);
      } else {
        console.warn('⚠️ No listings found or API error:', result.error);
        setSupabaseListings([]);
      }
    } catch (error) {
      console.error('❌ Error loading Supabase listings:', error);
      setSupabaseListings([]);
    } finally {
      setIsLoadingListings(false);
    }
  };

  // For demo: Add the created listing manually since DB storage is bypassed
  const demoListing = {
    id: "1",
    title: "Test API Service",
    description: "Demo API service created via escrow contract",
    price: 10,
    currency: 'PYUSD',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
    seller: "0x64b2e...5f5e",
    sellerName: "Demo Seller",
    sellerRating: 4.8,
    category: "API Services",
    condition: "Digital Service",
    location: "India",
    createdAt: new Date().toISOString(),
    status: 'active' as const,
    deal_id: 4, // Use the latest deal ID from your escrow contract
    api_key: "sk-live1234567890abcdef_demo_api_key_12345" // Store the actual API key
  };

  // Use demo listing + any Supabase listings
  const allListings = [demoListing, ...supabaseListings];

  // Filter listings based on search and filters
  const filteredListings = allListings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.categories.length === 0 || filters.categories.includes(listing.category);
    const matchesPrice = listing.price >= filters.priceRange[0] && listing.price <= filters.priceRange[1];
    const matchesCondition = filters.conditions.length === 0 || filters.conditions.includes(listing.condition);
    const matchesLocation = !filters.location || listing.location.includes(filters.location);
    
    return matchesSearch && matchesCategory && matchesPrice && matchesCondition && matchesLocation;
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (sort: string) => {
    setSortBy(sort);
  };

  const handleFilterChange = (filters: FilterState) => {
    setFilters(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 100000],
      conditions: [],
      location: ""
    });
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center py-12 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏰 GhostPalace API Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover verified API services from Aadhaar-authenticated providers
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allListings.length}</div>
              <div className="text-sm text-gray-500">Total APIs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredListings.length}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{supabaseListings.length}</div>
              <div className="text-sm text-gray-500">Verified</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="py-8">
          <div className="max-w-2xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              onSort={handleSort}
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">API Services</h2>
            <Badge variant="secondary" size="sm">
              {filteredListings.length} found
            </Badge>
            {(filters.categories.length > 0 || filters.conditions.length > 0 || filters.location) && (
              <Badge variant="info" size="sm">
                Filtered
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8">
          {isLoadingListings ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading API services...</p>
            </div>
          ) : sortedListings.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {sortedListings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing}
                  userType="buyer"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-300 text-8xl mb-6">🔍</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No API services found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filters.categories.length > 0 || filters.conditions.length > 0 || filters.location
                  ? "Try adjusting your search criteria or clear filters"
                  : "No API services have been listed yet. Be the first to create one!"}
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>
                Create First API Listing
              </Button>
            </div>
          )}
        </div>

        {/* Filters Sidebar - Mobile Friendly */}
        <div className="lg:hidden mt-8">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">
              Filters & Categories
            </summary>
            <div className="mt-4">
              <FilterSidebar
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </details>
        </div>
      </div>
    </PageLayout>
  );
}
