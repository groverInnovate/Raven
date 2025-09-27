"use client";

import { useState } from "react";
import Modal, { ModalBody, ModalFooter } from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNullifier } from '../../contexts/NullifierContext';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
}

export default function CreateListingModal({ isOpen, onClose, onSubmit }: CreateListingModalProps) {
  const { nullifier, isVerified } = useNullifier();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    api_key: '',
    price: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.api_key || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    // Get nullifier from localStorage as primary source
    const localStorageNullifier = typeof window !== 'undefined' ? localStorage.getItem('nullifier') : null;
    const nullifierToUse = localStorageNullifier || nullifier;

    if (!nullifierToUse) {
      setError('You must be verified to create listings. Please complete verification first.');
      return;
    }
    
    console.log('📝 Creating listing with nullifier from localStorage:', localStorageNullifier);
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nullifier: nullifierToUse,
          title: formData.title,
          description: formData.description,
          api_key: formData.api_key,
          price: parseFloat(formData.price)
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Listing created successfully!');
        setFormData({ title: '', description: '', api_key: '', price: '' });
        setTimeout(() => {
          onClose();
          onSubmit?.();
        }, 1500);
      } else {
        setError(result.error || 'Failed to create listing');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Create New Listing
              </h2>
              <p className="text-gray-600">
                Add your API service to the marketplace
              </p>
            </div>

            {/* Verification Status */}
            {!isVerified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ You must complete Aadhaar verification to create listings
                  </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter listing title"
                required
                disabled={isSubmitting}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your API service (optional)"
                  disabled={isSubmitting}
                  rows={3}
                  className="ghost-input w-full px-3 py-2 text-sm resize-none"
                />
              </div>

              <Input
                label="API Key"
                value={formData.api_key}
                onChange={(e) => handleInputChange('api_key', e.target.value)}
                placeholder="Enter your API key"
                required
                disabled={isSubmitting}
              />

              <Input
                label="Price (INR)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                required
                disabled={isSubmitting}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={(() => {
                const localStorageNullifier = typeof window !== 'undefined' ? localStorage.getItem('nullifier') : null;
                const hasVerification = localStorageNullifier || isVerified;
                return isSubmitting || !hasVerification;
              })()}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
