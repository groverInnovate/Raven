/**
 * Stealth Payment Generator Component (Buyer Side)
 * 
 * This component allows buyers to generate stealth addresses for payments
 * to sellers with stealth keys enabled.
 */

"use client";

import React, { useState } from 'react';
import { useStealthPayment } from '../../hooks/useStealthPayment';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StealthPaymentGeneratorProps {
  sellerMetaAddress?: string;
  onPaymentGenerated?: (stealthAddress: string, ephemeralKey: string) => void;
  className?: string;
}

export function StealthPaymentGenerator({ 
  sellerMetaAddress = '', 
  onPaymentGenerated, 
  className = '' 
}: StealthPaymentGeneratorProps) {
  const [inputMetaAddress, setInputMetaAddress] = useState(sellerMetaAddress);
  
  const {
    stealthPayment,
    isGenerating,
    error,
    generateStealthPayment,
    clearStealthPayment,
    isValidMetaAddress
  } = useStealthPayment();

  const handleGenerate = async () => {
    if (!inputMetaAddress) return;
    
    await generateStealthPayment(inputMetaAddress);
    
    if (stealthPayment && onPaymentGenerated) {
      onPaymentGenerated(stealthPayment.stealthAddress, stealthPayment.ephemeralPublicKey);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isValidInput = inputMetaAddress && isValidMetaAddress(inputMetaAddress);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Private Payment Setup
          {stealthPayment && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Ready
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🛡️ Enhanced Privacy</h4>
          <p className="text-sm text-blue-800">
            This seller has stealth addresses enabled! Your payment will be sent to a unique, 
            private address that only the seller can access, protecting both your privacy 
            and theirs.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Input Section */}
        {!stealthPayment && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seller's Stealth Meta-Address
              </label>
              <div className="space-y-2">
                <textarea
                  value={inputMetaAddress}
                  onChange={(e) => setInputMetaAddress(e.target.value)}
                  placeholder="st:eth:0x... or paste seller's stealth meta-address (line breaks will be automatically removed)"
                  className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none"
                  rows={4}
                />
                <div className="flex items-center gap-2 text-xs">
                  {inputMetaAddress && (
                    <span className={`px-2 py-1 rounded ${
                      isValidInput 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isValidInput ? '✅ Valid' : '❌ Invalid format'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!isValidInput || isGenerating}
              variant="primary"
              className="w-full"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Private Address...
                </span>
              ) : (
                '🔐 Generate Private Payment Address'
              )}
            </Button>
          </div>
        )}

        {/* Generated Payment Info */}
        {stealthPayment && (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✅ Private Payment Address Ready</h4>
              <p className="text-sm text-green-800">
                Send your payment to the address below. Only the seller can access funds 
                sent to this address, ensuring complete privacy.
              </p>
            </div>

            {/* Payment Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Payment Address (Send funds here)
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border font-mono text-sm break-all">
                  {stealthPayment.stealthAddress}
                </div>
                <Button
                  onClick={() => copyToClipboard(stealthPayment.stealthAddress)}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  📋 Copy
                </Button>
              </div>
            </div>

            {/* Technical Details (Collapsible) */}
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                🔧 Technical Details (Optional)
              </summary>
              <div className="p-3 border-t border-gray-200 space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Ephemeral Public Key:</span>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded border mt-1 break-all">
                    {stealthPayment.ephemeralPublicKey}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">View Tag:</span>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded border mt-1">
                    {stealthPayment.viewTag}
                  </div>
                </div>
              </div>
            </details>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={clearStealthPayment}
                variant="outline"
                size="sm"
              >
                🔄 Generate New Address
              </Button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-xs text-gray-600">
            <strong>🔒 Privacy Note:</strong> This stealth address is unique to this transaction. 
            The seller will be able to detect and access the payment, but external observers 
            cannot link it to the seller's identity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
