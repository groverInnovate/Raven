"use client";

import React, { useState, useEffect } from 'react';
import { loadStealthKeysFromStorage } from '../../lib/stealth';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StealthDebugInfoProps {
  className?: string;
}

export function StealthDebugInfo({ className = '' }: StealthDebugInfoProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const stealthKeys = loadStealthKeysFromStorage();
    if (stealthKeys) {
      // Get stored ephemeral keys
      const storageKey = `ephemeral_keys_${stealthKeys.stealthMetaAddress}`;
      const storedKeys = localStorage.getItem(storageKey);
      const ephemeralKeys = storedKeys ? JSON.parse(storedKeys) : {};

      setDebugInfo({
        hasStealthKeys: true,
        metaAddress: stealthKeys.stealthMetaAddress,
        metaAddressLength: stealthKeys.stealthMetaAddress.length,
        storedAddresses: Object.keys(ephemeralKeys),
        ephemeralKeysCount: Object.keys(ephemeralKeys).length,
        ephemeralKeys: ephemeralKeys
      });
    } else {
      setDebugInfo({
        hasStealthKeys: false
      });
    }
  }, []);

  if (!debugInfo) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🐛 Debug Information
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-semibold text-gray-900 mb-2">Stealth Keys Status</h4>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Has Stealth Keys:</span>
              <span className={debugInfo.hasStealthKeys ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.hasStealthKeys ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            {debugInfo.hasStealthKeys && (
              <>
                <div className="flex justify-between">
                  <span>Meta Address Length:</span>
                  <span>{debugInfo.metaAddressLength} chars</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Meta Address:</span>
                  <div className="font-mono text-xs bg-white p-2 rounded border mt-1 break-all">
                    {debugInfo.metaAddress}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {debugInfo.hasStealthKeys && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Stored Stealth Addresses</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Count:</span>
                <span className="font-medium">{debugInfo.ephemeralKeysCount}</span>
              </div>
              
              {debugInfo.storedAddresses.length > 0 ? (
                <div className="mt-2">
                  <span className="font-medium">Addresses to scan:</span>
                  <div className="mt-1 space-y-1">
                    {debugInfo.storedAddresses.map((address: string, index: number) => (
                      <div key={address} className="font-mono text-xs bg-white p-2 rounded border">
                        {index + 1}. {address}
                        <div className="text-gray-500 mt-1">
                          Created: {new Date(debugInfo.ephemeralKeys[address].timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-blue-700 mt-2">
                  No stealth addresses generated yet. Use the "Test Utility" tab to create some.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">How Scanning Works</h4>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Generate stealth keys (seller setup)</li>
            <li>2. Buyer generates stealth address using seller's meta-address</li>
            <li>3. System stores the ephemeral key for that address</li>
            <li>4. Buyer sends ETH to the stealth address</li>
            <li>5. Scanner checks all stored addresses for balances</li>
            <li>6. If balance found, payment is detected and can be swept</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}