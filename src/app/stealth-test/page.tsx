"use client";

import React, { useState } from 'react';
import { PageLayout } from '../../components';
import { StealthKeyManager } from '../../components/stealth/StealthKeyManager';
import { StealthPaymentScanner } from '../../components/stealth/StealthPaymentScanner';
import { StealthPaymentGenerator } from '../../components/stealth/StealthPaymentGenerator';
import { StealthTestUtility } from '../../components/stealth/StealthTestUtility';
import { StealthDebugInfo } from '../../components/stealth/StealthDebugInfo';
import { useWallet } from '../../contexts/WalletContext';

export default function StealthTestPage() {
  const { wallet } = useWallet();
  const [activeTab, setActiveTab] = useState<'keys' | 'generate' | 'scan' | 'test'>('keys');

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Stealth Payment System Test
          </h1>
          <p className="text-gray-600">
            Test the complete stealth payment system with real blockchain integration
          </p>
        </div>

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
                  ({wallet.balance} ETH on {wallet.network})
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
                onClick={() => setActiveTab('keys')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keys'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🔑 Stealth Keys
              </button>
              <button
                onClick={() => setActiveTab('generate')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generate'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💰 Generate Payment
              </button>
              <button
                onClick={() => setActiveTab('scan')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'scan'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🔍 Scan Payments
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'test'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                🧪 Test Utility
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'keys' && (
            <div>
              <StealthKeyManager />
              
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">📋 How Stealth Keys Work</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Spending Key:</strong> Used to spend funds from stealth addresses</li>
                  <li>• <strong>Viewing Key:</strong> Used to detect incoming payments</li>
                  <li>• <strong>Meta-Address:</strong> Public identifier buyers use to generate stealth addresses</li>
                  <li>• Keys are generated deterministically from your wallet signature</li>
                  <li>• Same wallet will always generate the same stealth keys</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'generate' && (
            <div>
              <StealthPaymentGenerator />
              
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Payment Generation Process</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Enter the seller's stealth meta-address</li>
                  <li>• System generates a unique stealth address for this payment</li>
                  <li>• Send ETH or tokens to the generated stealth address</li>
                  <li>• Only the seller can detect and recover these funds</li>
                  <li>• Each payment uses a completely different address</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'scan' && (
            <div>
              <StealthPaymentScanner />
              
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">🔍 Blockchain Scanning</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Real Implementation:</strong> Scans Ethereum blockchain for payments</li>
                  <li>• <strong>ETH Detection:</strong> Finds direct ETH transfers to stealth addresses</li>
                  <li>• <strong>Token Detection:</strong> Scans ERC-20 token transfers (USDC, USDT, DAI)</li>
                  <li>• <strong>ERC-5564 Events:</strong> Detects standard stealth payment announcements</li>
                  <li>• <strong>Efficient Scanning:</strong> Uses event logs and batch requests</li>
                  <li>• <strong>Fallback:</strong> Shows mock data if blockchain scanning fails</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <StealthTestUtility />
              
              <StealthDebugInfo />
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">🧪 End-to-End Testing</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• <strong>Complete Workflow:</strong> Test the entire stealth payment process</li>
                  <li>• <strong>Real Transactions:</strong> Send actual ETH to generated stealth addresses</li>
                  <li>• <strong>Automatic Detection:</strong> Scanner will find your test payments</li>
                  <li>• <strong>Fund Recovery:</strong> Sweep funds back to your main wallet</li>
                  <li>• <strong>Privacy Verified:</strong> Confirm that stealth addresses work as expected</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">✅ System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Implemented Features:</span>
              <ul className="text-green-600 mt-1 space-y-1">
                <li>✅ Stealth key generation (Fluidkey SDK)</li>
                <li>✅ Stealth address generation</li>
                <li>✅ Private key recovery</li>
                <li>✅ Real blockchain scanning</li>
                <li>✅ ETH and ERC-20 fund sweeping</li>
                <li>✅ Complete UI components</li>
              </ul>
            </div>
            <div>
              <span className="text-green-700 font-medium">Blockchain Integration:</span>
              <ul className="text-green-600 mt-1 space-y-1">
                <li>✅ Real ETH balance checking</li>
                <li>✅ Transaction history scanning</li>
                <li>✅ ERC-20 token detection</li>
                <li>✅ Gas fee calculation</li>
                <li>✅ Transaction broadcasting</li>
                <li>✅ Receipt confirmation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Development Notes */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">🚧 Development Notes</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• For production, consider using indexing services (The Graph, Alchemy) for efficient scanning</li>
            <li>• Implement proper ephemeral key storage and management</li>
            <li>• Add support for more ERC-20 tokens and other networks</li>
            <li>• Consider implementing ERC-5564 announcement events for better discoverability</li>
            <li>• Add proper error handling and retry mechanisms for blockchain operations</li>
            <li>• Implement key derivation from viewing keys for better privacy</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}