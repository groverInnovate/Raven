"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { checkForIncomingPayments, collectPayment, getPaymentReceivingStatus } from '../lib/stealthPaymentService';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface SimplePaymentDashboardProps {
  className?: string;
}

export default function SimplePaymentDashboard({ className = '' }: SimplePaymentDashboardProps) {
  const { wallet } = useWallet();
  const [payments, setPayments] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCollecting, setIsCollecting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [lastScan, setLastScan] = useState<Date | null>(null);

  const paymentStatus = wallet?.address ? getPaymentReceivingStatus(wallet.address) : null;

  const scanForPayments = async () => {
    if (!wallet?.address) return;
    
    setIsScanning(true);
    setError('');
    
    try {
      console.log('Scanning for incoming payments...');
      
      // Get provider
      let provider;
      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      const detectedPayments = await checkForIncomingPayments(provider);
      setPayments(detectedPayments);
      setLastScan(new Date());
      
      console.log(`Found ${detectedPayments.length} payments`);
    } catch (err: any) {
      console.error('Error scanning for payments:', err);
      setError(err.message || 'Failed to scan for payments');
    } finally {
      setIsScanning(false);
    }
  };

  const handleCollectPayment = async (paymentId: string) => {
    if (!wallet?.address) return;
    
    setIsCollecting(paymentId);
    setError('');
    
    try {
      console.log('Collecting payment:', paymentId);
      
      // Get signer
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        const txHash = await collectPayment(paymentId, wallet.address, signer);
        console.log('Payment collected:', txHash);
        
        // Refresh payments list
        await scanForPayments();
      }
    } catch (err: any) {
      console.error('Error collecting payment:', err);
      setError(err.message || 'Failed to collect payment');
    } finally {
      setIsCollecting(null);
    }
  };

  // Auto-scan on mount
  useEffect(() => {
    if (wallet?.address && paymentStatus?.canReceive) {
      scanForPayments();
    }
  }, [wallet?.address, paymentStatus?.canReceive]);

  if (!wallet?.address) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">👛</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Connect your wallet to check for incoming payments</p>
        </CardContent>
      </Card>
    );
  }

  if (!paymentStatus?.canReceive) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Setup Required</h3>
          <p className="text-gray-600 mb-4">
            Complete your onboarding to start receiving private payments
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/get-started'}>
            Complete Setup
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalPendingAmount = payments
    .filter(p => p.canSweep)
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            💰 Incoming Payments
            {totalPendingAmount > 0 && (
              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                {totalPendingAmount.toFixed(4)} ETH pending
              </span>
            )}
          </span>
          
          <Button
            onClick={scanForPayments}
            disabled={isScanning}
            variant="outline"
            size="sm"
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Scanning...
              </span>
            ) : (
              '🔄 Scan'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Last Scan Info */}
        {lastScan && (
          <div className="text-xs text-gray-500 text-center">
            Last scanned: {lastScan.toLocaleTimeString()}
          </div>
        )}

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💸</div>
            <p className="text-lg font-medium">No payments found</p>
            <p className="text-sm">Private payments will appear here when received</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`border rounded-lg p-4 ${
                  payment.canSweep 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {payment.canSweep ? '💰' : '✅'}
                    </span>
                    <span className="font-semibold text-lg">
                      {payment.amount} {payment.currency}
                    </span>
                    {!payment.canSweep && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        Collected
                      </span>
                    )}
                  </div>
                  
                  {payment.canSweep && (
                    <Button
                      onClick={() => handleCollectPayment(payment.id)}
                      disabled={isCollecting === payment.id}
                      variant="primary"
                      size="sm"
                    >
                      {isCollecting === payment.id ? (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Collecting...
                        </span>
                      ) : (
                        '💸 Collect'
                      )}
                    </Button>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Received:</span>
                    <span>{new Date(payment.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {payments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Payments:</span>
                <div className="font-semibold text-blue-900">{payments.length}</div>
              </div>
              <div>
                <span className="text-blue-700">Ready to Collect:</span>
                <div className="font-semibold text-blue-900">
                  {payments.filter(p => p.canSweep).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">ℹ️ How it works</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Buyers send payments to your private addresses automatically</li>
            <li>• Click "Scan" to check for new incoming payments</li>
            <li>• Use "Collect" to transfer funds to your main wallet</li>
            <li>• All transactions maintain complete privacy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}