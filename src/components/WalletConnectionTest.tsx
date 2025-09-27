"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getAvailableWallet, isWalletAvailable } from '../lib/walletUtils';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface WalletConnectionTestProps {
  className?: string;
}

export default function WalletConnectionTest({ className = '' }: WalletConnectionTestProps) {
  const { wallet, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const runTests = () => {
    const results = [];
    
    try {
      // Test 1: Check if window.ethereum exists
      results.push({
        test: 'window.ethereum exists',
        result: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined',
        details: typeof window !== 'undefined' ? typeof window.ethereum : 'window not available'
      });

      // Test 2: Check wallet availability
      results.push({
        test: 'isWalletAvailable()',
        result: isWalletAvailable(),
        details: isWalletAvailable() ? 'Wallet detected' : 'No wallet found'
      });

      // Test 3: Get wallet info
      const walletInfo = getAvailableWallet();
      results.push({
        test: 'getAvailableWallet()',
        result: walletInfo.isAvailable,
        details: `${walletInfo.name} - ${walletInfo.isAvailable ? 'Available' : 'Not available'}`
      });

      // Test 4: Check specific wallet properties
      if (typeof window !== 'undefined' && window.ethereum) {
        results.push({
          test: 'Wallet properties',
          result: true,
          details: {
            isMetaMask: window.ethereum.isMetaMask || false,
            isCoinDCX: window.ethereum.isCoinDCX || false,
            isTrust: window.ethereum.isTrust || false,
            isRabby: window.ethereum.isRabby || false
          }
        });
      }

      // Test 5: Check if request method exists
      results.push({
        test: 'ethereum.request method',
        result: typeof window !== 'undefined' && window.ethereum && typeof window.ethereum.request === 'function',
        details: typeof window !== 'undefined' && window.ethereum ? typeof window.ethereum.request : 'N/A'
      });

    } catch (error: any) {
      results.push({
        test: 'Test execution',
        result: false,
        details: error.message
      });
    }

    setTestResults(results);
  };

  const testConnection = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setTestResults(prev => [...prev, {
        test: 'Connection attempt',
        result: false,
        details: error.message
      }]);
    }
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Wallet Connection Test
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} variant="outline" size="sm">
            Run Tests
          </Button>
          <Button onClick={testConnection} variant="primary" size="sm" disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Test Connection'}
          </Button>
          {wallet && (
            <Button onClick={disconnectWallet} variant="outline" size="sm">
              Disconnect
            </Button>
          )}
        </div>

        {/* Current Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium mb-2">Current Status</h4>
          <div className="text-sm space-y-1">
            <div>Connected: {wallet ? '✅ Yes' : '❌ No'}</div>
            {wallet && (
              <>
                <div>Address: {wallet.address}</div>
                <div>Balance: {wallet.balance} ETH</div>
                <div>Network: {wallet.network}</div>
              </>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results</h4>
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                result.result ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={result.result ? 'text-green-600' : 'text-red-600'}>
                    {result.result ? '✅' : '❌'}
                  </span>
                  <span className="font-medium">{result.test}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {typeof result.details === 'object' 
                    ? JSON.stringify(result.details, null, 2)
                    : result.details
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Troubleshooting</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure your wallet extension is installed and enabled</li>
            <li>• Try refreshing the page if tests fail</li>
            <li>• Check if your wallet is unlocked</li>
            <li>• Some wallets may need to be manually connected first</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}