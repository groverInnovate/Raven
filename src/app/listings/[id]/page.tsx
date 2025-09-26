"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PageLayout, Navigation } from "../../../components";

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

  const listing = mockListings.find(l => l.id === listingId);

  if (!listing) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Listing Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              The listing you're looking for doesn't exist or has been removed.
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
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="mb-4">
                <div className="relative h-96 w-full rounded-lg overflow-hidden">
                  <Image
                    src={listing.images[selectedImageIndex]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              {listing.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-indigo-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
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
                    {listing.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Condition:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {listing.condition}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Location:</span>
                  <span className="text-gray-900">📍 {listing.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Listed:</span>
                  <span className="text-gray-900">{listing.createdAt}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {listing.price} {listing.currency}
              </div>
              <div className="text-sm text-gray-500 mb-6">
                ≈ ${(listing.price * 2500).toLocaleString()} USD
              </div>

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Seller Information
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {listing.sellerName}
                      </span>
                      <div className="flex items-center">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm text-gray-600 ml-1">
                          {listing.sellerRating}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {listing.seller}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span>📍</span>
                      <span className="ml-1">{listing.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  💰 Buy Now
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full border border-indigo-600 text-indigo-600 hover:bg-indigo-50 py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  💬 Contact Seller
                </button>
                <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors">
                  ❤️ Add to Wishlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {listing.specifications && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Specifications
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(listing.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <dt className="text-sm font-medium text-gray-500">{key}:</dt>
                  <dd className="text-sm text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contact Seller
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Send a message to {listing.sellerName} about this listing.
              </p>
              <textarea
                placeholder="Hi, I'm interested in your listing..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                  Send Message
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
