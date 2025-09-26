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
import { ipfsService, IPFSListing } from "../../lib/ipfs";

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
  const [sortBy, setSortBy] = useState("newest");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 100000],
    conditions: [],
    location: ""
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [ipfsListings, setIpfsListings] = useState<Listing[]>([]);
  const [isLoadingIPFS, setIsLoadingIPFS] = useState(true);

  // Load listings from IPFS on component mount
  useEffect(() => {
    loadIPFSListings();
  }, []);

  const loadIPFSListings = async () => {
    setIsLoadingIPFS(true);
    try {
      const ipfsResults = await ipfsService.searchListings();
      
      // Convert IPFS listings to UI listing format
      const convertedListings: Listing[] = ipfsResults.map((ipfsListing: IPFSListing) => ({
        id: ipfsListing.id,
        title: ipfsListing.title,
        description: ipfsListing.description,
        price: ipfsListing.price,
        currency: ipfsListing.currency,
        image: ipfsListing.images[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        seller: ipfsListing.seller,
        sellerName: ipfsListing.sellerName,
        sellerRating: 4.5, // Default rating
        category: ipfsListing.category,
        condition: ipfsListing.condition,
        location: ipfsListing.location,
        createdAt: ipfsListing.createdAt,
        status: 'active' as const
      }));
      
      setIpfsListings(convertedListings);
      console.log(`Loaded ${convertedListings.length} listings from IPFS`);
    } catch (error) {
      console.error('Error loading IPFS listings:', error);
    } finally {
      setIsLoadingIPFS(false);
    }
  };

  // Combine mock listings with IPFS listings
  const allListings = [...mockListings, ...ipfsListings];

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
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Browse Marketplace
            </h1>
            <p className="text-gray-600">
              Discover amazing items from trusted sellers across India
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Card padding="sm" className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allListings.length}</div>
              <div className="text-xs text-gray-500">Total Items</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl font-bold text-green-600">{allListings.filter(l => l.status === 'active').length}</div>
              <div className="text-xs text-gray-500">Active</div>
            </Card>
            <Card padding="sm" className="text-center">
              <div className="text-2xl font-bold text-purple-600">{ipfsListings.length}</div>
              <div className="text-xs text-gray-500">From IPFS</div>
            </Card>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onSort={handleSort}
        />

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" size="sm">
              {filteredListings.length} items found
            </Badge>
            {(filters.categories.length > 0 || filters.conditions.length > 0 || filters.location) && (
              <Badge variant="info" size="sm">
                Filters applied
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
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <FilterSidebar
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Listings Grid/List */}
        <div className="lg:w-3/4">
          {sortedListings.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
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
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🔍</div>
                <CardTitle className="mb-2">No items found</CardTitle>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
