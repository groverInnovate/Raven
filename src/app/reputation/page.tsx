"use client"
import React, { useState, useMemo } from 'react';

// Types
interface Seller {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  totalVotes: number;
  status: 'Active' | 'Suspended' | 'New';
  joinDate: string;
  lastActive: string;
  services: string[];
  verified: boolean;
  responseTime: string;
  completionRate: number;
}

// Star Rating Component
const StarRating: React.FC<{
  rating: number;
  totalStars?: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, totalStars = 5, size = 'md' }) => {
  const starSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }[size];

  return (
    <div className="flex items-center gap-1">
      {[...Array(totalStars)].map((_, index) => {
        const isFilled = index < Math.floor(rating);
        const isHalfFilled = index < rating && index >= Math.floor(rating);
        
        return (
          <div key={index} className={`${starSize} relative`}>
            <svg
              className={`${starSize} ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {isHalfFilled && (
              <svg
                className={`${starSize} absolute top-0 left-0 text-yellow-400`}
                fill="currentColor"
                viewBox="0 0 20 20"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            )}
          </div>
        );
      })}
      <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>
    </div>
  );
};

// Seller Card Component
const SellerCard: React.FC<{
  seller: Seller;
  rank: number;
}> = ({ seller, rank }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      case 'New':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-yellow-600 font-bold';
    if (rank <= 10) return 'text-gray-700 font-semibold';
    return 'text-gray-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${getRankColor(rank)}`}>
            #{rank}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{seller.name}</h3>
              {seller.verified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-600">{seller.category}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(seller.status)}`}>
          {seller.status}
        </span>
      </div>

      <p className="text-gray-700 mb-4 text-sm">{seller.description}</p>

      <div className="flex items-center justify-between mb-4">
        <StarRating rating={seller.rating} />
        <div className="text-sm text-gray-600">
          {seller.totalVotes.toLocaleString()} votes
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Response Time:</span>
          <span className="ml-2 font-medium">{seller.responseTime}</span>
        </div>
        <div>
          <span className="text-gray-500">Completion Rate:</span>
          <span className="ml-2 font-medium">{seller.completionRate}%</span>
        </div>
        <div>
          <span className="text-gray-500">Joined:</span>
          <span className="ml-2 font-medium">{seller.joinDate}</span>
        </div>
        <div>
          <span className="text-gray-500">Last Active:</span>
          <span className="ml-2 font-medium">{seller.lastActive}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {seller.services.slice(0, 3).map((service, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
          >
            {service}
          </span>
        ))}
        {seller.services.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
            +{seller.services.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
};

// Main Sellers Page Component
const SellersPage: React.FC = () => {
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'newest'>('rating');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'New' | 'Suspended'>('all');

  // Dummy data - replace with actual API call
  const sellers: Seller[] = [
    {
      id: '1',
      name: 'API Master Solutions',
      category: 'API Development & Integration',
      description: 'Expert in RESTful APIs, GraphQL, and microservices architecture. Specialized in payment gateways and third-party integrations.',
      rating: 4.9,
      totalVotes: 1247,
      status: 'Active',
      joinDate: 'Jan 2023',
      lastActive: '2 hours ago',
      services: ['REST API', 'GraphQL', 'Payment Integration', 'OAuth', 'Webhooks'],
      verified: true,
      responseTime: '< 1 hour',
      completionRate: 98
    },
    {
      id: '2',
      name: 'CloudSync Technologies',
      category: 'Cloud Services & DevOps',
      description: 'Full-stack cloud solutions with expertise in AWS, Azure, and GCP. DevOps automation and CI/CD pipeline specialists.',
      rating: 4.8,
      totalVotes: 892,
      status: 'Active',
      joinDate: 'Mar 2023',
      lastActive: '1 day ago',
      services: ['AWS Integration', 'Docker APIs', 'Kubernetes', 'CI/CD', 'Monitoring'],
      verified: true,
      responseTime: '2 hours',
      completionRate: 96
    },
    {
      id: '3',
      name: 'Data Pipeline Pros',
      category: 'Data Processing & Analytics',
      description: 'Advanced data processing APIs, ETL pipelines, and real-time analytics solutions for enterprise clients.',
      rating: 4.7,
      totalVotes: 654,
      status: 'Active',
      joinDate: 'Jun 2023',
      lastActive: '3 hours ago',
      services: ['ETL APIs', 'Analytics', 'Data Streaming', 'ML APIs', 'Reporting'],
      verified: false,
      responseTime: '4 hours',
      completionRate: 94
    },
    {
      id: '4',
      name: 'Mobile API Hub',
      category: 'Mobile Backend Services',
      description: 'Specialized mobile backend APIs, push notifications, user authentication, and mobile app integrations.',
      rating: 4.6,
      totalVotes: 433,
      status: 'Active',
      joinDate: 'Aug 2023',
      lastActive: '6 hours ago',
      services: ['Mobile APIs', 'Push Notifications', 'User Auth', 'Social Login', 'File Upload'],
      verified: true,
      responseTime: '3 hours',
      completionRate: 92
    },
    {
      id: '5',
      name: 'Security First APIs',
      category: 'Cybersecurity & Compliance',
      description: 'Security-focused API development with compliance standards (SOC2, HIPAA, PCI-DSS). Penetration testing APIs.',
      rating: 4.5,
      totalVotes: 287,
      status: 'Active',
      joinDate: 'Oct 2023',
      lastActive: '12 hours ago',
      services: ['Security APIs', 'Compliance', 'Encryption', 'Audit Logs', 'Penetration Testing'],
      verified: true,
      responseTime: '6 hours',
      completionRate: 89
    },
    {
      id: '6',
      name: 'Blockchain Builders',
      category: 'Blockchain & Web3',
      description: 'Cutting-edge blockchain APIs, smart contract interactions, DeFi protocols, and NFT marketplace integrations.',
      rating: 4.3,
      totalVotes: 156,
      status: 'New',
      joinDate: 'Dec 2024',
      lastActive: '1 day ago',
      services: ['Blockchain APIs', 'Smart Contracts', 'DeFi', 'NFT APIs', 'Web3 Integration'],
      verified: false,
      responseTime: '8 hours',
      completionRate: 87
    },
    {
      id: '7',
      name: 'E-commerce API Solutions',
      category: 'E-commerce & Retail',
      description: 'Complete e-commerce API suite including inventory management, order processing, and payment systems.',
      rating: 4.4,
      totalVotes: 321,
      status: 'Active',
      joinDate: 'May 2023',
      lastActive: '4 hours ago',
      services: ['Inventory APIs', 'Order Management', 'Payment Processing', 'Shipping', 'Analytics'],
      verified: true,
      responseTime: '2 hours',
      completionRate: 93
    },
    {
      id: '8',
      name: 'AI Integration Experts',
      category: 'Artificial Intelligence & ML',
      description: 'AI-powered APIs for machine learning, natural language processing, computer vision, and predictive analytics.',
      rating: 4.6,
      totalVotes: 198,
      status: 'Active',
      joinDate: 'Sep 2024',
      lastActive: '1 hour ago',
      services: ['ML APIs', 'NLP', 'Computer Vision', 'Predictive Analytics', 'Chatbots'],
      verified: false,
      responseTime: '3 hours',
      completionRate: 91
    }
  ];

  const filteredAndSortedSellers = useMemo(() => {
    let filtered = sellers;
    
    if (filterStatus !== 'all') {
      filtered = sellers.filter(seller => seller.status === filterStatus);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'votes':
          return b.totalVotes - a.totalVotes;
        case 'newest':
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        default:
          return 0;
      }
    });
  }, [sellers, sortBy, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Reputation System</h1>
          <p className="text-gray-600">Ranked API service providers in our P2P marketplace</p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-900">How Rankings Work</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Sellers are ranked based on their star rating, number of votes, completion rate, and response time. 
                  Verified sellers and those with higher completion rates get priority in rankings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{sellers.length}</div>
            <div className="text-sm text-gray-600">Total Sellers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {sellers.filter(s => s.status === 'Active').length}
            </div>
            <div className="text-sm text-gray-600">Active Sellers</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {(sellers.reduce((acc, seller) => acc + seller.rating, 0) / sellers.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">
              {sellers.reduce((acc, seller) => acc + seller.totalVotes, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'votes' | 'newest')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="votes">Most Votes</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'Active' | 'New' | 'Suspended')}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sellers</option>
                  <option value="Active">Active</option>
                  <option value="New">New</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredAndSortedSellers.length} sellers
            </div>
          </div>
        </div>

        {/* Sellers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedSellers.map((seller, index) => (
            <SellerCard 
              key={seller.id} 
              seller={seller} 
              rank={index + 1}
            />
          ))}
        </div>

        {filteredAndSortedSellers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No sellers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellersPage;
