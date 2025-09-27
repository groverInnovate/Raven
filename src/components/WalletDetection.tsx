"use client";

import React, { useState, useEffect } from 'react';
import { getAvailableWallet, isWalletAvailable } from '../lib/walletUtils';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface WalletDetectionProps {
  className?: string;
}

export default function WalletDetection({ className = '' }: WalletDetectionProps) {
  const [walletInfo, setWalletInfo] = useState<{ name: string; isAvailable: boolean } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const info = getAvailableWallet();
      setWalletInfo(info);
    }
  }, [isClient]);

  if (!isClient || !walletInfo) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          👛 Wallet Detection
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${walletInfo.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div>
            <div className="font-medium">
              {walletInfo.isAvailable ? `${walletInfo.name} Detected` : 'No Wallet Detected'}
            </div>
            <div className="text-sm text-gray-600">
              {walletInfo.isAvailable 
                ? `Ready to connect with ${walletInfo.name}`
                : 'Please install a Web3 wallet to continue'
              }
            </div>
          </div>
        </div>

        {!walletInfo.isAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Supported Wallets</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-yellow-800">MetaMask</span>
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Download
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-800">CoinDCX Wallet</span>
                <a 
                  href="https://coindcx.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Get App
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-800">Trust Wallet</span>
                <a 
                  href="https://trustwallet.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        )}

        {walletInfo.isAvailable && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">✅ Wallet Ready</h4>
            <p className="text-sm text-green-800">
              {walletInfo.name} is installed and ready to use. You can now connect your wallet 
              and start using the private payment features.
            </p>
          </div>
        )}

        {/* Debug info for developers */}
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 space-y-1">
            <div>Wallet Available: {isWalletAvailable() ? 'Yes' : 'No'}</div>
            <div>Detected Wallet: {walletInfo.name}</div>
            <div>Window.ethereum: {typeof window !== 'undefined' && window.ethereum ? 'Present' : 'Missing'}</div>
            {typeof window !== 'undefined' && window.ethereum && (
              <>
                <div>isMetaMask: {window.ethereum.isMetaMask ? 'Yes' : 'No'}</div>
                <div>isCoinDCX: {window.ethereum.isCoinDCX ? 'Yes' : 'No'}</div>
                <div>isTrust: {window.ethereum.isTrust ? 'Yes' : 'No'}</div>
              </>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}