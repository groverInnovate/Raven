"use client";

import { useState } from "react";
import { Modal, ModalBody, ModalFooter, Input, Button, Badge } from '../ui';
import { Listing } from './ListingCard';
import { ipfsService, IPFSListing } from '../../lib/ipfs';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (listing: Partial<Listing>) => void;
}

const categories = [
  'Electronics', 'Fashion', 'Furniture', 'Books', 'Sports', 
  'Art', 'Jewelry', 'Collectibles', 'Home & Garden', 'Other'
];

const conditions = ['New', 'Like New', 'Excellent', 'Good', 'Fair'];

export default function CreateListingModal({ isOpen, onClose, onSubmit }: CreateListingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'New',
    isAdultOnly: false,
    isIndiaOnly: false,
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create IPFS listing data
      const ipfsListingData: Omit<IPFSListing, 'metadata'> = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: 'INR',
        category: formData.category,
        condition: formData.condition,
        images: formData.image ? [formData.image] : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'],
        seller: '0x1234...5678', // This would come from connected wallet
        sellerName: 'You',
        location: 'India',
        isAdultOnly: formData.isAdultOnly,
        isIndiaOnly: formData.isIndiaOnly,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Upload to IPFS
      console.log('Uploading listing to IPFS...');
      const ipfsListing = await ipfsService.uploadListing(ipfsListingData);
      
      // Convert to regular listing format for the UI
      const newListing: Listing = {
        ...ipfsListing,
        image: ipfsListing.images[0],
        sellerRating: 4.5,
        status: 'active' as const,
      };
      
      console.log('Listing uploaded to IPFS with hash:', ipfsListing.metadata.ipfsHash);
      
      await onSubmit(newListing);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Electronics',
        condition: 'New',
        isAdultOnly: false,
        isIndiaOnly: false,
        image: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Listing"
      description="List your item on the marketplace"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-6">
            {/* Title */}
            <Input
              label="Title"
              placeholder="Enter item title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="ghost-input w-full px-3 py-2 text-sm resize-none"
                placeholder="Describe your item in detail"
                required
              />
            </div>

            {/* Price and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                min="0"
                step="0.01"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="ghost-input w-full px-3 py-2 text-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="ghost-input w-full px-3 py-2 text-sm"
              >
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Image URL */}
            <Input
              label="Image URL (Optional)"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              helperText="Add a URL to an image of your item"
            />

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="adultOnly"
                  checked={formData.isAdultOnly}
                  onChange={(e) => setFormData({ ...formData, isAdultOnly: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="adultOnly" className="flex items-center text-sm text-gray-700">
                  <Badge variant="danger" size="sm" className="mr-2">
                    18+
                  </Badge>
                  Adult content/age-restricted item
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="indiaOnly"
                  checked={formData.isIndiaOnly}
                  onChange={(e) => setFormData({ ...formData, isIndiaOnly: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="indiaOnly" className="flex items-center text-sm text-gray-700">
                  <Badge variant="secondary" size="sm" className="mr-2">
                    🇮🇳
                  </Badge>
                  Available only to Indian buyers
                </label>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
          >
            Create Listing
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
