"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import StatusBadge from "../../../components/StatusBadge";

// Mock escrow data
const mockEscrowData = {
  escrow_001: {
    id: "escrow_001",
    listingId: "2",
    title: "Vintage Leather Jacket",
    description: "Authentic vintage leather jacket from the 1980s. Excellent condition with minimal wear.",
    price: 8500,
    currency: "INR",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
    seller: {
      address: "0x9876...5432",
      name: "VintageCollector",
      rating: 4.9
    },
    buyer: {
      address: "0x1234...5678",
      name: "Rajesh Kumar",
      rating: 4.8
    },
    status: "funds_locked" as const,
    createdAt: "2024-01-10T10:00:00Z",
    fundsLockedAt: "2024-01-10T10:30:00Z",
    expectedDelivery: "2024-01-15T18:00:00Z",
    disputeDeadline: "2024-01-20T18:00:00Z",
    messages: [
      {
        id: "1",
        sender: "buyer",
        senderName: "Rajesh Kumar",
        message: "Hi! I'm interested in purchasing this jacket. Is it still available?",
        timestamp: "2024-01-10T09:00:00Z"
      },
      {
        id: "2",
        sender: "seller",
        senderName: "VintageCollector",
        message: "Yes, it's available! The jacket is in excellent condition as described.",
        timestamp: "2024-01-10T09:15:00Z"
      },
      {
        id: "3",
        sender: "buyer",
        senderName: "Rajesh Kumar",
        message: "Great! I'll proceed with the purchase. When can you ship it?",
        timestamp: "2024-01-10T09:30:00Z"
      },
      {
        id: "4",
        sender: "seller",
        senderName: "VintageCollector",
        message: "I can ship it today via courier. You should receive it by January 15th.",
        timestamp: "2024-01-10T10:00:00Z"
      },
      {
        id: "5",
        sender: "system",
        senderName: "System",
        message: "Funds have been locked in escrow. Seller can now proceed with shipping.",
        timestamp: "2024-01-10T10:30:00Z"
      }
    ]
  }
};

export default function EscrowDetailPage() {
  const params = useParams();
  const escrowId = params.id as string;
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockEscrowData.escrow_001?.messages || []);
  const [userRole] = useState<'buyer' | 'seller'>('buyer'); // This would come from auth context

  const escrowData = mockEscrowData[escrowId as keyof typeof mockEscrowData];

  if (!escrowData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Escrow Not Found</h1>
          <p className="text-gray-600 mb-4">The escrow transaction you're looking for doesn't exist.</p>
          <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      sender: userRole,
      senderName: userRole === 'buyer' ? escrowData.buyer.name : escrowData.seller.name,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const handleConfirmDelivery = () => {
    if (confirm("Are you sure you want to confirm delivery? This will release the funds to the seller.")) {
      alert("Delivery confirmed! Funds have been released to the seller.");
    }
  };

  const handleChallengeDispute = () => {
    if (confirm("Are you sure you want to raise a dispute? This will involve our dispute resolution team.")) {
      alert("Dispute raised! Our team will review the case within 24 hours.");
    }
  };

  const handleClaimFunds = () => {
    if (confirm("Are you sure you want to claim the funds? Make sure the item has been delivered.")) {
      alert("Funds claimed! The amount will be transferred to your wallet.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
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
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/listings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
            <li>/</li>
            <li className="text-gray-900">Escrow #{escrowId}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Escrow Transaction</h1>
              <p className="text-gray-600">ID: {escrowData.id}</p>
            </div>
            <StatusBadge status={escrowData.status} size="lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Item Details & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Item Details */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
              <div className="flex space-x-4">
                <div className="relative h-32 w-32 flex-shrink-0">
                  <Image
                    src={escrowData.image}
                    alt={escrowData.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{escrowData.title}</h3>
                  <p className="text-gray-600 mb-3">{escrowData.description}</p>
                  <div className="text-2xl font-bold text-blue-600">₹{escrowData.price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Status:</span>
                  <StatusBadge status={escrowData.status} />
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Funds Locked:</span>
                  <span className="text-gray-600">{formatDate(escrowData.fundsLockedAt)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Expected Delivery:</span>
                  <span className="text-gray-600">{formatDate(escrowData.expectedDelivery)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-900">Dispute Deadline:</span>
                  <span className="text-orange-600 font-medium">{getTimeRemaining(escrowData.disputeDeadline)}</span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Participants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Buyer</h3>
                  <p className="text-blue-800">{escrowData.buyer.name}</p>
                  <p className="text-sm text-blue-600">{escrowData.buyer.address}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-blue-800 ml-1">{escrowData.buyer.rating}</span>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Seller</h3>
                  <p className="text-green-800">{escrowData.seller.name}</p>
                  <p className="text-sm text-green-600">{escrowData.seller.address}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-green-800 ml-1">{escrowData.seller.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userRole === 'buyer' && (
                  <>
                    <button
                      onClick={handleConfirmDelivery}
                      className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      ✅ Confirm Delivery
                    </button>
                    <button
                      onClick={handleChallengeDispute}
                      className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                    >
                      ⚠️ Raise Dispute
                    </button>
                  </>
                )}
                {userRole === 'seller' && (
                  <button
                    onClick={handleClaimFunds}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    💰 Claim Funds
                  </button>
                )}
                <Link
                  href={`/listings/${escrowData.listingId}`}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  📦 View Listing
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
                <p className="text-sm text-gray-600">Communicate with the other party</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === userRole ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'system'
                          ? 'bg-yellow-100 text-yellow-800 mx-auto text-center text-sm'
                          : message.sender === userRole
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {message.sender !== 'system' && (
                        <div className="text-xs opacity-75 mb-1">{message.senderName}</div>
                      )}
                      <div>{message.message}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
