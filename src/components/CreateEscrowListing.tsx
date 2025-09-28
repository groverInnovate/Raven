"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { ContractService } from '../lib/contractService';
import { getUserStealthMetaAddress, getUserProfile } from '../lib/userProfile';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface CreateEscrowListingProps {
  className?: string;
  onListingCreated?: (dealId: number, txHash: string) => void;
}

export default function CreateEscrowListing({ className = '', onListingCreated }: CreateEscrowListingProps) {
  const { wallet } = useWallet();
  const [contractService, setContractService] = useState<ContractService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    apiKey: '',
    category: 'API Services'
  });

  useEffect(() => {
    if (wallet?.address && typeof window !== 'undefined' && window.ethereum) {
      initializeContract();
      loadStealthMetaAddress();
    }
  }, [wallet?.address]);

  const initializeContract = async () => {
    try {
      console.log('🔧 Initializing contract service...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      console.log('📡 Provider:', provider);
      console.log('✍️ Signer address:', await signer.getAddress());
      
      const service = new ContractService(provider, signer);
      setContractService(service);
      
      // Test PYUSD balance
      if (wallet?.address) {
        const balance = await service.getPYUSDBalance(wallet.address);
        console.log('💰 PYUSD Balance:', balance);
      }
      
      console.log('✅ Contract service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing contract:', error);
      setError('Failed to initialize contract service: ' + (error as Error).message);
    }
  };

  const loadStealthMetaAddress = async () => {
    if (!wallet?.address) return;
    
    try {
      const metaAddress = getUserStealthMetaAddress(wallet.address);
      console.log('🔍 Loading stealth meta-address for:', wallet.address);
      console.log('📍 Found stealth meta-address:', metaAddress);
      
      if (metaAddress) {
        setStealthMetaAddress(metaAddress);
      } else {
        console.warn('⚠️ No stealth meta-address found for user');
        setError('No stealth meta-address found. Please complete seller onboarding first.');
      }
    } catch (error) {
      console.error('❌ Error loading stealth meta-address:', error);
      setError('Failed to load stealth meta-address');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!formData.apiKey.trim()) {
      setError('API key is required');
      return false;
    }
    if (!stealthMetaAddress) {
      setError('Stealth meta-address is required. Please complete seller onboarding.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractService || !wallet?.address) {
      setError('Please connect your wallet');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Creating escrow listing with data:', {
        ...formData,
        stealthMetaAddress,
        walletAddress: wallet.address
      });

      // Check network
      const network = await contractService.provider.getNetwork();
      console.log('🌐 Current network:', network);
      
      if (network.chainId !== 11155111n) { // Sepolia chainId
        throw new Error(`Wrong network. Please switch to Sepolia testnet. Current: ${network.name} (${network.chainId})`);
      }

      // Check contract deployment first
      console.log('🔍 Checking contract deployment...');
      const deployment = await contractService.checkContractDeployment();
      console.log('📋 Contract deployment status:', deployment);
      
      if (!deployment.escrow) {
        throw new Error('Escrow contract is not deployed or not accessible');
      }
      if (!deployment.pyusd) {
        throw new Error('PYUSD contract is not deployed or not accessible');
      }

      // Generate actual stealth address from meta-address
      console.log('🔐 Generating stealth address from meta-address...');
      const { generateStealthAddressForRecipient } = await import('../lib/stealth');
      const stealthAddressData = generateStealthAddressForRecipient(stealthMetaAddress);
      console.log('📍 Generated stealth address:', stealthAddressData.stealthAddress);

      // Create the escrow deal on-chain
      console.log('📝 Calling contractService.createEscrow...');
      const result = await contractService.createEscrow(
        stealthAddressData.stealthAddress, // Use the actual stealth address, not meta-address
        formData.price,
        formData.apiKey,
        formData.title,
        formData.description
      );

      console.log('✅ Escrow deal created successfully:', result);

      // Store listing in Supabase
      const listingData = {
        dealId: result.dealId,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        apiKey: formData.apiKey,
        stealthMetaAddress,
        txHash: result.txHash,
        sellerAddress: wallet.address,
        status: 'active'
      };

      console.log('💾 Storing listing in database:', listingData);
      
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      console.log('📡 API response status:', response.status);
      const apiResult = await response.json();
      console.log('📡 API response data:', apiResult);

      if (apiResult.success) {
        console.log('✅ Listing stored in database successfully:', apiResult);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          price: '',
          apiKey: '',
          category: 'API Services'
        });

        // Call callback
        if (onListingCreated) {
          onListingCreated(result.dealId, result.txHash);
        }

        alert(`✅ Listing created successfully!\nDeal ID: ${result.dealId}\nTransaction: ${result.txHash}`);
      } else {
        throw new Error(apiResult.error || 'Failed to store listing');
      }

    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (!wallet?.address) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">👛</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Connect your wallet to create listings with escrow protection</p>
        </CardContent>
      </Card>
    );
  }

  if (!stealthMetaAddress) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stealth Keys Required</h3>
          <p className="text-gray-600 mb-4">
            You need to set up stealth keys to receive private payments as a seller.
            Please complete the seller onboarding process first.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/get-started'}
              variant="primary"
            >
              Complete Seller Setup
            </Button>
            <div className="text-xs text-gray-500">
              Connected wallet: {wallet?.address?.slice(0, 6)}...{wallet?.address?.slice(-4)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📦 Create API Listing with Escrow
          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Protected
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              API Service Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Weather Data API, Payment Processing API"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your API service, features, and usage instructions..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (PYUSD) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="10.00"
                step="0.01"
                min="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="API Services">API Services</option>
                <option value="Data Services">Data Services</option>
                <option value="AI/ML Services">AI/ML Services</option>
                <option value="Payment Services">Payment Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
              API Key / Access Token *
            </label>
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              placeholder="sk-1234567890abcdef... (This will be revealed to buyers after payment)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              🔒 This API key will be securely stored in the escrow contract and only revealed to buyers after payment
            </p>
          </div>

          {/* Stealth Address Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🔐 Privacy Protection Enabled</h4>
            <p className="text-sm text-blue-800 mb-2">
              Payments will be sent to your stealth meta-address for complete privacy:
            </p>
            <div className="bg-white p-2 rounded border font-mono text-xs break-all text-gray-700">
              {stealthMetaAddress}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  console.log('🔍 Debug info:');
                  console.log('Wallet address:', wallet?.address);
                  console.log('Stealth meta-address:', stealthMetaAddress);
                  console.log('User profile:', getUserProfile(wallet?.address || ''));
                }}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                Debug Info
              </button>
              <button
                type="button"
                onClick={loadStealthMetaAddress}
                className="text-xs bg-blue-200 hover:bg-blue-300 px-2 py-1 rounded"
              >
                Reload Address
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (contractService) {
                    const deployment = await contractService.checkContractDeployment();
                    const network = await contractService.provider.getNetwork();
                    alert(`Network: ${network.name} (${network.chainId})\nEscrow: ${deployment.escrow}\nPYUSD: ${deployment.pyusd}`);
                  }
                }}
                className="text-xs bg-green-200 hover:bg-green-300 px-2 py-1 rounded"
              >
                Test Contracts
              </button>
              <button
                type="button"
                onClick={() => window.open('/listings/1', '_blank')}
                className="text-xs bg-purple-200 hover:bg-purple-300 px-2 py-1 rounded"
              >
                🛒 Demo Buy Flow
              </button>
            </div>
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
          <Button
            type="submit"
            disabled={isLoading}
            variant="primary"
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Listing...
              </span>
            ) : (
              '📦 Create Escrow Listing'
            )}
          </Button>

          {/* Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">📋 How Escrow Listings Work</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Your listing is created with an on-chain escrow contract</li>
              <li>• Buyers pay into the escrow to access your API key</li>
              <li>• Funds are held securely until buyer confirms receipt</li>
              <li>• Upon confirmation, funds are sent to your stealth address</li>
              <li>• Complete privacy protection for all transactions</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}