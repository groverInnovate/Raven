"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { generateStealthAddressForRecipient } from '../lib/stealth';
import { getUserStealthMetaAddress } from '../lib/userProfile';
import { ContractService } from '../lib/contractService';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface CreateListingWithEscrowProps {
  onListingCreated?: (dealId: number, txHash: string) => void;
  onClose?: () => void;
  className?: string;
}

export default function CreateListingWithEscrow({
  onListingCreated,
  onClose,
  className = ''
}: CreateListingWithEscrowProps) {
  const { wallet } = useWallet();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    apiKey: '',
    category: 'API Access'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'creating' | 'success'>('form');
  const [createdDeal, setCreatedDeal] = useState<{ dealId: number; txHash: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet?.address) {
      setError('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!formData.title || !formData.description || !formData.price || !formData.apiKey) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setIsCreating(true);
    setError('');
    setStep('creating');

    try {
      // Get seller's stealth meta-address
      const sellerMetaAddress = getUserStealthMetaAddress(wallet.address);
      if (!sellerMetaAddress) {
        throw new Error('Please complete your onboarding to enable stealth payments');
      }

      console.log('Creating listing with stealth integration...');

      // Generate a stealth address for this specific listing
      const stealthPayment = generateStealthAddressForRecipient(sellerMetaAddress);
      console.log('Generated stealth address:', stealthPayment.stealthAddress);

      // Get contract service
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractService = new ContractService(provider, signer);

        // Create escrow deal
        const result = await contractService.createEscrow(
          stealthPayment.stealthAddress,
          formData.price,
          formData.apiKey,
          formData.title,
          formData.description
        );

        console.log('Escrow deal created:', result);
        setCreatedDeal(result);
        setStep('success');

        if (onListingCreated) {
          onListingCreated(result.dealId, result.txHash);
        }
      } else {
        throw new Error('Ethereum provider not available');
      }
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing');
      setStep('form');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      apiKey: '',
      category: 'API Access'
    });
    setError('');
    setStep('form');
    setCreatedDeal(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            📝 Create New Listing
            {step === 'success' && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ✅ Created
              </span>
            )}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Premium Trading API Access"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service or API in detail..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (PYUSD) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="100"
                step="0.01"
                min="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key / Service Details *
              </label>
              <textarea
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="sk-1234567890abcdef... or service access details"
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be encrypted and only visible to the buyer after payment
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="API Access">API Access</option>
                <option value="Software License">Software License</option>
                <option value="Digital Service">Digital Service</option>
                <option value="Consultation">Consultation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isCreating || !wallet?.address}
                className="flex-1"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Listing...
                  </span>
                ) : (
                  '🚀 Create Listing'
                )}
              </Button>
              
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        )}

        {step === 'creating' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Your Listing</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Generating stealth address for private payments</p>
              <p>🔄 Creating escrow contract on blockchain</p>
              <p>⏳ Please confirm the transaction in your wallet</p>
            </div>
          </div>
        )}

        {step === 'success' && createdDeal && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Listing Created Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your listing is now live with secure escrow protection
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Deal ID:</span>
                  <span className="font-mono text-green-900">#{createdDeal.dealId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Transaction:</span>
                  <span className="font-mono text-green-900 text-xs">
                    {createdDeal.txHash.slice(0, 10)}...
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>✅ Escrow contract created with stealth address</p>
              <p>✅ API key securely stored (buyer access only)</p>
              <p>✅ Private payments enabled</p>
              <p>✅ Automatic fund release on confirmation</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={resetForm}
                variant="outline"
                className="flex-1"
              >
                Create Another
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="primary"
                className="flex-1"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">🔐 How It Works</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your listing creates a secure escrow contract</li>
            <li>• Buyers pay PYUSD into the escrow</li>
            <li>• API key is revealed only after payment</li>
            <li>• Funds are released to your stealth address</li>
            <li>• Complete privacy for both parties</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}