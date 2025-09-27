/**
 * Seller Payment Scanner Test Page
 * 
 * This page allows sellers to test the stealth payment scanning and recovery functionality.
 */

"use client";

import React from 'react';
import { PageLayout, Navigation } from '../../components';
import { StealthPaymentScanner } from '../../components/stealth/StealthPaymentScanner';

export default function SellerScannerPage() {
  return (
    <PageLayout>
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🔍 Seller Payment Scanner
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Scan for and recover stealth payments made to your stealth addresses. 
              This tool helps sellers detect and access funds sent privately by buyers.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 How to Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Prerequisites:</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Complete seller onboarding with stealth keys</li>
                  <li>✅ Have buyers generate payment addresses</li>
                  <li>✅ Connect your wallet</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Testing Flow:</h3>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Click "Scan for Payments" to detect stealth payments</li>
                  <li>2. Review found payments in the list below</li>
                  <li>3. Use "Sweep Funds" to recover payments to your wallet</li>
                  <li>4. Monitor transaction status and confirmations</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Payment Scanner Component */}
          <StealthPaymentScanner />

          {/* Technical Details */}
          <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔧 Technical Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Payment Detection:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Scans blockchain events for stealth addresses</li>
                  <li>• Uses ephemeral public keys to verify ownership</li>
                  <li>• Filters payments belonging to your stealth keys</li>
                  <li>• Real-time detection of new payments</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Fund Recovery:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Recovers private keys for stealth addresses</li>
                  <li>• Calculates optimal gas fees for transfers</li>
                  <li>• Sweeps funds to your main wallet address</li>
                  <li>• Maintains complete transaction privacy</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <span className="text-lg">🔒</span>
              <span className="font-semibold">Privacy Protected</span>
            </div>
            <p className="text-green-700 text-sm">
              All stealth payment operations maintain complete privacy. External observers cannot 
              link payments to your identity or determine the relationship between different transactions.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
