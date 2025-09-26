"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navigation />

      {/* Hero Section */}
      <main className="ghost-container py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="text-blue-600">GhostPalace</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            India's trusted peer-to-peer marketplace with secure escrow transactions.
            Buy and sell with confidence using blockchain-powered protection and 
            Aadhar verification.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="ghost-button-primary px-8 py-3 rounded-lg text-lg inline-flex items-center justify-center"
            >
              🛍️ Start Shopping
            </Link>
            <Link
              href="/onboarding"
              className="ghost-button-secondary px-8 py-3 rounded-lg text-lg"
            >
              📦 Start Selling
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="ghost-card p-6">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Escrow Protection
            </h3>
            <p className="text-gray-600">
              Funds are locked in smart contract escrow until delivery is confirmed.
              Built-in dispute resolution protects both buyers and sellers.
            </p>
          </div>
          
          <div className="ghost-card p-6">
            <div className="text-3xl mb-4">🇮🇳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aadhar Verified
            </h3>
            <p className="text-gray-600">
              All users are verified through Aadhar authentication, ensuring
              trusted transactions within the Indian marketplace ecosystem.
            </p>
          </div>
          
          <div className="ghost-card p-6">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Built-in Chat
            </h3>
            <p className="text-gray-600">
              Communicate directly with buyers and sellers through our integrated
              chat system. Track all conversations in your dashboard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
