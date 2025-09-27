"use client";

import { useState } from "react";
import Link from "next/link";
import ListingCard from "../../components/ListingCard";
import CreateListingModal from "../../components/business/CreateListingModal";
import StatusBadge from "../../components/StatusBadge";
import OnboardingStatus from "../../components/OnboardingStatus";
import SimplePaymentDashboard from "../../components/SimplePaymentDashboard";
import NullifierDebug from "../../components/debug/NullifierDebug";

// Mock data for user's listings and purchases
const mockUserListings = [
  {
    id: "1",
    title: "MacBook Pro 16-inch",
    description: "2023 MacBook Pro with M2 chip, 16GB RAM, 512GB SSD.",
    price: 120000,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop",
    seller: "0x1234...5678",
    sellerName: "You",
    sellerRating: 4.8,
    category: "Electronics",
    condition: "Like New",
    location: "Mumbai, India",
    createdAt: "2024-01-15",
    status: "active" as const
  }
];

const mockUserPurchases = [
  {
    id: "2",
    title: "Vintage Leather Jacket",
    description: "Authentic vintage leather jacket from the 1980s.",
    price: 8500,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop",
    seller: "0x9876...5432",
    sellerName: "VintageCollector",
    sellerRating: 4.9,
    category: "Fashion",
    condition: "Excellent",
    location: "Delhi, India",
    createdAt: "2024-01-10",
    status: "funds_locked" as const,
    escrowId: "escrow_001"
  }
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'purchases' | 'profile' | 'payments'>('listings');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userListings, setUserListings] = useState(mockUserListings);
  
  // Mock user data
  const userData = {
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    aadharVerified: true,
    walletAddress: "0x1234567890abcdef",
    balance: 25000,
    totalSales: 3,
    totalPurchases: 7,
    rating: 4.8,
    joinedDate: "2023-12-01"
  };

  const handleCreateListing = () => {
    // Modal handles API call internally, just close modal and optionally refresh listings
    setIsCreateModalOpen(false);
    // TODO: Refresh listings from API here if needed
  };

  const handleWithdraw = () => {
    alert(`Withdrawing ₹${userData.balance} to your bank account...`);
  };

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
                href="/listings"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/dashboard"
                className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your listings, purchases, and profile</p>
        </div>

        {/* Onboarding Status */}
        <OnboardingStatus className="mb-6" />
        {/* Debug Component - Remove after testing */}
        <NullifierDebug />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">₹{userData.balance.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Available Balance</div>
            <button
              onClick={handleWithdraw}
              className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
            >
              Withdraw
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-green-600">{userData.totalSales}</div>
            <div className="text-sm text-gray-600">Total Sales</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
            <div className="text-2xl font-bold text-purple-600">{userData.totalPurchases}</div>
            <div className="text-sm text-gray-600">Total Purchases</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
            <div className="flex items-center space-x-1">
              <div className="text-2xl font-bold text-yellow-600">{userData.rating}</div>
              <span className="text-yellow-500">⭐</span>
            </div>
            <div className="text-sm text-gray-600">Your Rating</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-blue-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'listings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Listings ({userListings.length})
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'purchases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Purchases ({mockUserPurchases.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💰 Payments
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* My Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    + Create Listing
                  </button>
                </div>
                
                {userListings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📦</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-4">Create your first listing to start selling</p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                    >
                      Create Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} userType="seller" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Purchases Tab */}
            {activeTab === 'purchases' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">My Purchases</h2>
                
                {mockUserPurchases.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
                    <p className="text-gray-600 mb-4">Start shopping to see your purchases here</p>
                    <Link
                      href="/listings"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-block"
                    >
                      Browse Listings
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockUserPurchases.map((purchase) => (
                      <div key={purchase.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={purchase.image}
                              alt={purchase.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{purchase.title}</h3>
                              <p className="text-sm text-gray-600">₹{purchase.price}</p>
                              <p className="text-xs text-gray-500">Seller: {purchase.sellerName}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <StatusBadge status={purchase.status} />
                            {purchase.escrowId && (
                              <Link
                                href={`/escrow/${purchase.escrowId}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                              >
                                View Escrow
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile</h2>
                
                <div className="max-w-2xl">
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {userData.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{userData.name}</h3>
                        <p className="text-gray-600">{userData.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {userData.aadharVerified ? (
                            <span className="text-green-600 text-sm">✅ Aadhar Verified</span>
                          ) : (
                            <span className="text-red-600 text-sm">❌ Aadhar Not Verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Wallet Address:</span>
                      <span className="text-gray-600 font-mono text-sm">{userData.walletAddress}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Member Since:</span>
                      <span className="text-gray-600">{new Date(userData.joinedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Total Sales:</span>
                      <span className="text-gray-600">{userData.totalSales}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-900">Total Purchases:</span>
                      <span className="text-gray-600">{userData.totalPurchases}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="font-medium text-gray-900">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">{userData.rating}</span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors mr-4">
                      Edit Profile
                    </button>
                    {!userData.aadharVerified && (
                      <Link
                        href="/onboarding"
                        className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md font-medium transition-colors inline-block"
                      >
                        Complete Aadhar Verification
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Private Payments</h2>
                <SimplePaymentDashboard />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateListing}
      />
    </div>
  );
}
