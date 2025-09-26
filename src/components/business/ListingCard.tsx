import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, Button, Badge } from '../ui';
import StatusBadge, { StatusType } from './StatusBadge';

export interface Listing {
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
  status?: StatusType;
}

interface ListingCardProps {
  listing: Listing;
  userType?: 'buyer' | 'seller';
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
}

export default function ListingCard({ 
  listing, 
  userType = 'buyer',
  onEdit,
  onView 
}: ListingCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onEdit?.(listing.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    onView?.(listing.id);
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card hover className="overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 w-full">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            className="object-cover"
          />
          
          {/* Condition Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="default" size="sm">
              {listing.condition}
            </Badge>
          </div>
          
          {/* Status Badge */}
          {listing.status && (
            <div className="absolute top-3 left-3">
              <StatusBadge status={listing.status} size="sm" />
            </div>
          )}
        </div>
        
        <CardContent>
          {/* Title and Price */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <div className="text-right ml-2">
              <div className="text-lg font-bold text-blue-600">
                ₹{listing.price.toLocaleString()}
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
          
          {/* Category and Location */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <Badge variant="secondary" size="sm">
              {listing.category}
            </Badge>
            <div className="flex items-center space-x-1">
              <span>📍</span>
              <span>{listing.location}</span>
            </div>
          </div>
          
          {/* Seller Info */}
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
              <span className="text-gray-500">
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Seller Actions */}
          {userType === 'seller' && (
            <div className="mt-3 flex space-x-2">
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-1"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleView}
              >
                View
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
