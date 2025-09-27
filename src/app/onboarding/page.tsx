"use client"
import React, { useState } from 'react';
import { Search, ChevronDown, Play, Pause, ShoppingBag, Package } from 'lucide-react';

const GhostPalaceInterface = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const services = [
    "Payments API",
    "Geolocation APIs", 
    "Social Media APIs",
    "Cloud Service",
    "Communication",
    "Data"
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-r from-black/70 via-black/50 to-black/30 absolute z-10"></div>
        <div className="w-full h-full bg-black relative">
          {/* Simulated video background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-teal-800/80 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-800/60 via-red-900/60 to-pink-800/60 animate-pulse delay-1000"></div>
          
          {/* Video overlay pattern to simulate real video */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-repeat" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                                   radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                   backgroundSize: '50px 50px'
                 }}>
            </div>
          </div>
        </div>
      </div>

      {/* Video Control Button */}
      <button
        onClick={toggleVideo}
        className="absolute bottom-8 right-8 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
      >
        {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Header */}
      <header className="relative z-20 bg-transparent">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="text-white text-2xl font-bold flex items-center gap-2">
              <span></span>
              Hyena
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-white hover:text-blue-400 transition-colors">
              Browse Listings
            </button>
            <button className="text-white hover:text-blue-400 transition-colors">
              Dashboard
            </button>
            <div className="flex items-center space-x-1 text-white cursor-pointer">
              <span className="text-sm">🇮🇳</span>
            </div>
            <button className="text-white hover:text-blue-400 transition-colors">
              Sign in
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-black px-4 py-2 rounded transition-all">
              Join
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex flex-col justify-center min-h-[70vh] px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-4">
              Welcome to Raven
            </h1>
            <p className="text-white/90 text-xl md:text-2xl mb-12 leading-relaxed">
              Let's get you set up for secure trading in India's trusted P2P marketplace.
            </p>
            
            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="flex items-center bg-white rounded-lg overflow-hidden shadow-lg">
                <input
                  type="text"
                  placeholder="Search for any item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
                />
                <button className="bg-gray-900 hover:bg-black text-white p-4 transition-colors">
                  <Search size={24} />
                </button>
              </div>
            </div>

            {/* Service Tags */}
            <div className="flex flex-wrap gap-3 mb-16">
              {services.map((service, index) => (
                <button
                  key={index}
                  className="bg-transparent border border-white/30 text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-200 backdrop-blur-sm"
                >
                  {service}
                </button>
              ))}
            </div>

            {/* Role Selection Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white p-6 rounded-xl transition-all duration-200 group text-left">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl group-hover:scale-110 transition-transform"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">I want to Buy</h3>
                    <p className="text-white/80 text-sm">Browse and purchase items from verified sellers across India</p>
                  </div>
                </div>
                <div className="text-sm text-blue-300">
                  ✓ Escrow protection ✓ Secure payments ✓ Dispute resolution
                </div>
              </button>

              <button className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white p-6 rounded-xl transition-all duration-200 group text-left">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl group-hover:scale-110 transition-transform"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">I want to Sell</h3>
                    <p className="text-white/80 text-sm">List your items and reach millions of verified buyers</p>
                  </div>
                </div>
                <div className="text-sm text-blue-300">
                  ✓ Easy listing ✓ Secure transactions ✓ Fast withdrawals
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GhostPalaceInterface;
