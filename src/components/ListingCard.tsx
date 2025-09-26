import Link from "next/link";
import Image from "next/image";
import StatusBadge from "./StatusBadge";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  seller: string;
  sellerName: string;
  sellerRating: number;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  status?: 'active' | 'pending' | 'completed' | 'disputed' | 'cancelled';
}

interface ListingCardProps {
  listing: Listing;
  userType?: 'buyer' | 'seller';
}

export default function ListingCard({ listing, userType = 'buyer' }: ListingCardProps) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="relative h-48 w-full">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
              {listing.condition}
            </span>
          </div>
          {listing.status && (
            <div className="absolute top-3 left-3">
              <StatusBadge status={listing.status} size="sm" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {listing.title}
            </h3>
            <div className="text-right ml-2">
              <div className="text-lg font-bold text-blue-600">
                ₹{listing.price}
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                {listing.category}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>{listing.location}</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span>👤</span>
                  <span className="text-gray-700 font-medium">{listing.sellerName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-gray-600 font-medium">{listing.sellerRating}</span>
                </div>
              </div>
              <span className="text-gray-500">{new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          {userType === 'seller' && (
            <div className="mt-3 flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors">
                Edit
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-md text-sm font-medium transition-colors">
                View
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
