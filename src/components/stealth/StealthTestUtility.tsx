"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../../contexts/WalletContext';
import { loadStealthKeysFromStorage } from '../../lib/stealth';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StealthTestUtilityProps {
  className?: string;
}

export function StealthTestUtility({ className = '' }: StealthTestUtilityProps) {
  const { wallet } = useWallet();
  const [testAmount, setTestAmount] = useState('0.001');
  const [testAddress, setTestAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  const sendTestPayment = async () => {
    if (!wallet?.address || !testAddress) return;

    setIsSending(true);
    setError('');
    setTxHash('');

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Send test payment
        const tx = await signer.sendTransaction({
          to: testAddress,
          value: ethers.parseEther(testAmount)
        });

        console.log('Test payment sent:', tx.hash);
        setTxHash(tx.hash);

        // Wait for confirmation
        await tx.wait();
        console.log('Test payment confirmed');
      }
    } catch (err: any) {
      console.error('Error sending test payment:', err);
      setError(err.message || 'Failed to send test payment');
    } finally {
      setIsSending(false);
    }
  };

  const generateTestAddress = () => {
    const stealthKeys = loadStealthKeysFromStorage();
    if (!stealthKeys) {
      setError('No stealth keys found. Please generate stealth keys first.');
      return;
    }

    // Generate a test stealth address
    const ephemeralWallet = ethers.Wallet.createRandom();
    const ephemeralPrivateKey = ephemeralWallet.privateKey;
    
    const combinedData = ethers.concat([
      ethers.toUtf8Bytes(stealthKeys.stealthMetaAddress),
      ethers.toUtf8Bytes(ephemeralPrivateKey)
    ]);
    
    const stealthSeed = ethers.keccak256(combinedData);
    const stealthWallet = new ethers.Wallet(stealthSeed);
    
    setTestAddress(stealthWallet.address);
    
    // Store the ephemeral key for scanning
    if (typeof window !== 'undefined') {
      const storageKey = `ephemeral_keys_${stealthKeys.stealthMetaAddress}`;
      const existing = localStorage.getItem(storageKey);
      const keys = existing ? JSON.parse(existing) : {};
      
      keys[stealthWallet.address.toLowerCase()] = {
        ephemeralPrivateKey,
        timestamp: new Date().toISOString(),
        metaAddress: stealthKeys.stealthMetaAddress
      };
      
      localStorage.setItem(storageKey, JSON.stringify(keys));
    }
    
    console.log('Generated test stealth address:', stealthWallet.address);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Stealth Payment Test Utility
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Test Utility</h4>
          <p className="text-sm text-yellow-800">
            This utility helps you test the stealth payment system by generating test addresses 
            and sending small amounts of ETH to them.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Generate Test Address */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">1. Generate Test Stealth Address</h4>
          <Button
            onClick={generateTestAddress}
            variant="outline"
            className="w-full"
          >
            🎯 Generate Test Address
          </Button>
          
          {testAddress && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Generated Test Address:
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm break-all">
                {testAddress}
              </div>
            </div>
          )}
        </div>

        {/* Send Test Payment */}
        {testAddress && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">2. Send Test Payment</h4>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Amount (ETH):
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                step="0.001"
                min="0.001"
                max="0.1"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <Button
              onClick={sendTestPayment}
              disabled={!wallet?.address || isSending}
              variant="primary"
              className="w-full"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Test Payment...
                </span>
              ) : (
                `💸 Send ${testAmount} ETH`
              )}
            </Button>

            {txHash && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Hash:
                </label>
                <div className="p-3 bg-green-50 rounded-lg border font-mono text-sm break-all">
                  {txHash}
                </div>
                <p className="text-sm text-green-600">
                  ✅ Payment sent! Now go to the "Scan Payments" tab to detect it.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Testing Steps</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Make sure you have stealth keys generated</li>
            <li>2. Click "Generate Test Address" to create a stealth address</li>
            <li>3. Send a small amount of ETH to the generated address</li>
            <li>4. Go to "Scan Payments" tab and click "Scan for Payments"</li>
            <li>5. You should see the payment detected and ready to sweep</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}