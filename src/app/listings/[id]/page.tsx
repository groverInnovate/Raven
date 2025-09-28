"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PageLayout, Navigation } from "../../../components";
import BuyerInterface from "../../../components/BuyerInterface";

// Mock data for listings (same as in listings page)
const mockListings = [
  {
    id: "1",
    title: "Vintage Leather Jacket",
    description: "Authentic vintage leather jacket from the 1980s. Excellent condition with minimal wear. This jacket has been carefully maintained and comes from a smoke-free home. Perfect for collectors or anyone looking to add a classic piece to their wardrobe.",
    price: 0.15,
    currency: "ETH",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    seller: "0x1234...5678",
    sellerName: "VintageCollector",
    sellerRating: 4.8,
    category: "Fashion",
    condition: "Excellent",
    location: "New York, NY",
    createdAt: "2024-01-15",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&h=600&fit=crop"
    ],
    specifications: {
      "Size": "Large",
      "Material": "Genuine Leather",
      "Color": "Black",
      "Brand": "Unknown Vintage",
      "Year": "1980s"
    }
  },
  {
    id: "2",
    title: "MacBook Pro 16-inch",
    description: "2023 MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Perfect for developers and creators. Includes original charger, box, and documentation.",
    price: 1.2,
    currency: "ETH",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
    seller: "0x9876...5432",
    sellerName: "TechGuru",
    sellerRating: 4.9,
    category: "Electronics",
    condition: "Like New",
    location: "San Francisco, CA",
    createdAt: "2024-01-14",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=600&fit=crop"
    ],
    specifications: {
      "Model": "MacBook Pro 16-inch",
      "Processor": "Apple M2",
      "RAM": "16GB",
      "Storage": "512GB SSD",
      "Year": "2023"
    }
  }
];

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    setIsLoading(true);
    try {
      // For demo: Use hardcoded listing data since DB is bypassed
      if (listingId === "1") {
        setListing({
          id: "1",
          title: "Test API Service",
          description: "Demo API service created via escrow contract. This API provides weather data and other services.",
          price: 10,
          currency: 'PYUSD',
          seller_address: "0x64b2e5f5e",
          category: "API Services",
          created_at: new Date().toISOString(),
          deal_id: 4, // Use the latest deal ID from your escrow contract
          status: 'active',
          api_key: "sk-live1234567890abcdef_demo_api_key_12345" // Store the actual API key
        });
      } else {
        // Try to load from API for other listings
        const response = await fetch(`/api/listings/${listingId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setListing(result.data);
        } else {
          setError(result.error || 'Listing not found');
        }
      }
    } catch (err) {
      console.error('Error loading listing:', err);
      setError('Failed to load listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading listing...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !listing) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Listing Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              {error || "The listing you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
            >
              ← Back to Listings
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-gray-700">Listings</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{listing.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* API Service Display */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔑</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">API Service</h2>
                <p className="text-gray-600">
                  This is a digital API service. Purchase to get access to the API key.
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {listing.title}
              </h1>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {listing.description}
              </p>

              {/* Product Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {listing.category || 'API Services'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Type:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Digital Service
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Deal ID:</span>
                  <span className="text-gray-900 font-mono text-sm">{listing.deal_id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Listed:</span>
                  <span className="text-gray-900">{new Date(listing.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Escrow Protection Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">🔒 Escrow Protected</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Your payment is held securely until you confirm receipt</li>
                  <li>• Get immediate access to the API key after payment</li>
                  <li>• Seller receives payment privately via stealth address</li>
                  <li>• Full refund protection if service doesn't work</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Buyer Interface */}
            <BuyerInterface listing={listing} className="mb-6" />
            
            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seller Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Address:</span>
                  <span className="font-mono text-xs text-gray-700">
                    {listing.seller_address?.slice(0, 6)}...{listing.seller_address?.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Verified:</span>
                  <span className="text-green-600 font-medium">✅ Aadhaar Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Privacy:</span>
                  <span className="text-blue-600 font-medium">🔐 Stealth Payments</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </PageLayout>
  );
}
