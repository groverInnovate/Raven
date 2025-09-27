"use client";

import React, { useState } from 'react';
import { PageLayout } from '../../components';
import SimplePaymentFlow from '../../components/SimplePaymentFlow';
import SimplePaymentDashboard from '../../components/SimplePaymentDashboard';
import OnboardingStatus from '../../components/OnboardingStatus';
import WalletDetection from '../../components/WalletDetection';
import WalletConnectionTest from '../../components/WalletConnectionTest';
import { useWallet } from '../../contexts/WalletContext';

export default function SimpleTestPage() {
  const { wallet } = useWallet();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // Mock seller data for testing
  const mockSeller = {
    walletAddress: '0x742d35Cc6634C0532925a3b8D0C9C0532925a3b8',
    name: 'John Seller',
    itemTitle: 'Vintage Leather Jacket',
    price: '0.01' // Small amount for testing
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Simple Payment Test
          </h1>
          <p className="text-gray-600">
            Test the complete simplified stealth payment workflow
          </p>
        </div>

        {/* Onboarding Status */}
        <OnboardingStatus className="mb-6" />

        {/* Wallet Detection */}
        <WalletDetection className="mb-6" />

        {/* Wallet Connection Test */}
        <WalletConnectionTest className="mb-6" />

        {/* Wallet Status */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-800 font-medium">Wallet Status:</span>
            {wallet?.address ? (
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅ Connected</span>
                <span className="font-mono text-sm text-gray-600">
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </span>
                <span className="text-sm text-gray-600">
                  ({wallet.balance} ETH)
                </span>
              </div>
            ) : (
              <span className="text-red-600">❌ Not Connected</span>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('buy')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'buy'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🛒 Buy (Send Payment)
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sell'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💰 Sell (Receive Payments)
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'buy' && (
            <div>
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">🧪 Test Buying Flow</h3>
                <p className="text-sm text-yellow-800">
                  This simulates buying an item with private payments. The payment will be sent 
                  to a stealth address that only the seller can access.
                </p>
              </div>

              <SimplePaymentFlow
                sellerWalletAddress={mockSeller.walletAddress}
                sellerName={mockSeller.name}
                amount={mockSeller.price}
                itemTitle={mockSeller.itemTitle}
                onPaymentComplete={(txHash) => {
                  console.log('Payment completed:', txHash);
                  alert(`Payment sent! Transaction: ${txHash.slice(0, 10)}...`);
                }}
              />

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">✅ What Happens Next</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your payment is sent to a unique stealth address</li>
                  <li>• Only the seller can detect and collect this payment</li>
                  <li>• External observers cannot link the payment to the seller</li>
                  <li>• The seller will see the payment in their dashboard</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'sell' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">💰 Test Selling Flow</h3>
                <p className="text-sm text-blue-800">
                  This shows incoming private payments. If you've sent a test payment using the 
                  "Buy" tab, it should appear here after scanning.
                </p>
              </div>

              <SimplePaymentDashboard />

              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🔍 How Detection Works</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• System automatically scans for payments to your stealth addresses</li>
                  <li>• Payments appear in the dashboard when detected</li>
                  <li>• Click "Collect" to transfer funds to your main wallet</li>
                  <li>• All transactions maintain complete privacy</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">🎯 Simplified Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-gray-700 font-medium">For Buyers:</span>
              <ol className="text-gray-600 mt-1 space-y-1 list-decimal list-inside">
                <li>Click "Prepare Private Payment"</li>
                <li>System generates stealth address automatically</li>
                <li>Confirm and send payment</li>
                <li>Done! Payment is private and secure</li>
              </ol>
            </div>
            <div>
              <span className="text-gray-700 font-medium">For Sellers:</span>
              <ol className="text-gray-600 mt-1 space-y-1 list-decimal list-inside">
                <li>Complete onboarding (automatic stealth setup)</li>
                <li>Click "Scan" to check for payments</li>
                <li>Click "Collect" to receive funds</li>
                <li>Done! Funds transferred to main wallet</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Technical Note */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">🔧 Behind the Scenes</h3>
          <p className="text-sm text-purple-800">
            This simplified interface hides all the complex cryptography. Users just click buttons, 
            and the system handles stealth address generation, blockchain scanning, and fund recovery 
            automatically. The technical complexity is completely abstracted away.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}