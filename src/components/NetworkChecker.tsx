"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { isConnectedToSepolia, switchToSepolia, getCurrentNetwork, getSepoliaFaucets, SEPOLIA_NETWORK } from '../lib/networkConfig';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface NetworkCheckerProps {
  className?: string;
}

export default function NetworkChecker({ className = '' }: NetworkCheckerProps) {
  const { wallet } = useWallet();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<{ chainId: number; name: string } | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && wallet?.address) {
      checkNetwork();
    }
  }, [isClient, wallet?.address]);

  const checkNetwork = async () => {
    try {
      const [isCorrect, network] = await Promise.all([
        isConnectedToSepolia(),
        getCurrentNetwork()
      ]);
      
      setIsCorrectNetwork(isCorrect);
      setCurrentNetwork(network);
      setError('');
    } catch (err: any) {
      console.error('Error checking network:', err);
      setError('Failed to check network');
    }
  };

  const handleSwitchNetwork = async () => {
    setIsSwitching(true);
    setError('');

    try {
      await switchToSepolia();
      // Wait a bit for the network to switch
      setTimeout(() => {
        checkNetwork();
        setIsSwitching(false);
      }, 1000);
    } catch (err: any) {
      console.error('Error switching network:', err);
      setError(err.message || 'Failed to switch network');
      setIsSwitching(false);
    }
  };

  if (!isClient || !wallet?.address) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🌐 Network Status
          {isCorrectNetwork ? (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Correct
            </span>
          ) : (
            <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
              ❌ Wrong Network
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Network Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">
              Current Network
            </div>
            <div className="text-sm text-gray-600">
              {currentNetwork ? currentNetwork.name : 'Unknown'}
            </div>
          </div>
          <div className={`w-3 h-3 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>

        {/* Required Network Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="font-medium text-blue-900 mb-1">Required Network</div>
          <div className="text-sm text-blue-800">
            {SEPOLIA_NETWORK.name} (Chain ID: {SEPOLIA_NETWORK.chainId})
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

        {/* Switch Network Button */}
        {!isCorrectNetwork && (
          <Button
            onClick={handleSwitchNetwork}
            disabled={isSwitching}
            variant="primary"
            className="w-full"
          >
            {isSwitching ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Switching Network...
              </span>
            ) : (
              `🔄 Switch to ${SEPOLIA_NETWORK.name}`
            )}
          </Button>
        )}

        {/* Success Message */}
        {isCorrectNetwork && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <span className="text-lg">✅</span>
              <span className="font-medium">Connected to Sepolia Testnet</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You're ready to test the smart contracts!
            </p>
          </div>
        )}

        {/* Faucet Links */}
        {isCorrectNetwork && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-900 mb-2">💰 Need Sepolia ETH?</h4>
            <p className="text-sm text-yellow-800 mb-2">
              Get free Sepolia ETH for gas fees from these faucets:
            </p>
            <div className="space-y-1">
              {getSepoliaFaucets().map((faucet, index) => (
                <a
                  key={index}
                  href={faucet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {faucet.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2">📋 Setup Instructions</h4>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Switch to Sepolia testnet using the button above</li>
            <li>Get some Sepolia ETH from a faucet for gas fees</li>
            <li>Use the Contract Tester to mint test PYUSD</li>
            <li>Test the complete escrow workflow</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}