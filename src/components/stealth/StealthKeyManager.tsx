/**
 * Stealth Key Manager Component
 * 
 * This component handles the generation and management of stealth keys
 * for sellers in the Aadhaar Shield marketplace.
 */

"use client";

import React from 'react';
import { useStealthKeys } from '../../hooks/useStealthKeys';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StealthKeyManagerProps {
  onKeysGenerated?: (metaAddress: string) => void;
  className?: string;
}

export function StealthKeyManager({ onKeysGenerated, className = '' }: StealthKeyManagerProps) {
  const {
    stealthKeys,
    isGenerating,
    hasStealthKeys,
    formattedMetaAddress,
    generateStealthKeys,
    clearStealthKeys,
    error
  } = useStealthKeys();

  const handleGenerateKeys = async () => {
    await generateStealthKeys();
    if (formattedMetaAddress && onKeysGenerated) {
      onKeysGenerated(formattedMetaAddress);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Stealth Address Setup
          {hasStealthKeys && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">🛡️ Financial Privacy</h4>
          <p className="text-sm text-blue-800">
            Stealth addresses ensure your payments remain private. Buyers can send payments 
            to unique addresses that only you can access, protecting your financial privacy 
            while maintaining your verified reputation.
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

        {/* Key Generation Section */}
        {!hasStealthKeys ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Setup Required</h4>
              <p className="text-sm text-yellow-800 mb-3">
                Generate your stealth keys to enable private payments. This requires signing 
                a message with your wallet to create deterministic keys tied to your identity.
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Keys are generated from your wallet signature</li>
                <li>• Same wallet will always generate the same keys</li>
                <li>• Keys are stored locally and encrypted</li>
                <li>• Required for receiving private payments</li>
              </ul>
            </div>

            <Button
              onClick={handleGenerateKeys}
              disabled={isGenerating}
              variant="primary"
              className="w-full"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Stealth Keys...
                </span>
              ) : (
                '🔑 Generate Stealth Keys'
              )}
            </Button>
          </div>
        ) : (
          /* Key Management Section */
          <div className="space-y-4">
            {/* Success Message */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✅ Stealth Keys Active</h4>
              <p className="text-sm text-green-800">
                Your stealth keys are ready! Buyers can now send you private payments 
                using your stealth meta-address.
              </p>
            </div>

            {/* Meta Address Display */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Stealth Meta-Address
              </label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-gray-50 rounded-lg border font-mono text-sm break-all">
                  {formattedMetaAddress}
                </div>
                <Button
                  onClick={() => formattedMetaAddress && copyToClipboard(formattedMetaAddress)}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  📋 Copy
                </Button>
              </div>
              <p className="text-xs text-gray-600">
                Share this address with buyers for private payments
              </p>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="font-medium text-gray-700">Spending Key:</span>
                <div className="font-mono text-xs bg-gray-50 p-2 rounded border">
                  {stealthKeys?.spendingPublicKey.slice(0, 20)}...
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-gray-700">Viewing Key:</span>
                <div className="font-mono text-xs bg-gray-50 p-2 rounded border">
                  {stealthKeys?.viewingPublicKey.slice(0, 20)}...
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleGenerateKeys}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                🔄 Regenerate Keys
              </Button>
              <Button
                onClick={clearStealthKeys}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                🗑️ Clear Keys
              </Button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-xs text-gray-600">
            <strong>🔒 Security Note:</strong> Your stealth keys are stored locally and 
            tied to your wallet. Keep your wallet secure and backed up. If you lose 
            access to your wallet, you'll need to regenerate these keys.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
