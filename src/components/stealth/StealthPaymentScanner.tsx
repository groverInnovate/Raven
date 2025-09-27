/**
 * Stealth Payment Scanner Component
 * 
 * This component allows sellers to scan for and recover stealth payments
 * made to their stealth addresses.
 */

"use client";

import React from 'react';
import { useStealthPaymentScanner } from '../../hooks/useStealthPaymentScanner';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface StealthPaymentScannerProps {
  className?: string;
}

export function StealthPaymentScanner({ className = '' }: StealthPaymentScannerProps) {
  const {
    stealthPayments,
    isScanning,
    isSweeping,
    scanForPayments,
    sweepPayment,
    error,
    totalUnrecoveredAmount
  } = useStealthPaymentScanner();

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString() + ' ' + 
           new Date(timestamp).toLocaleTimeString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Stealth Payment Scanner
          {parseFloat(totalUnrecoveredAmount) > 0 && (
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {totalUnrecoveredAmount} ETH pending
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Scan Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={scanForPayments}
            disabled={isScanning}
            variant="primary"
          >
            {isScanning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Scanning...
              </span>
            ) : (
              '🔄 Scan for Payments'
            )}
          </Button>
          
          <div className="text-sm text-gray-600">
            Last scan: {stealthPayments.length > 0 ? 'Just now' : 'Never'}
          </div>
        </div>

        {/* Payments List */}
        {stealthPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-lg font-medium">No stealth payments found</p>
            <p className="text-sm">Payments made to your stealth addresses will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Found {stealthPayments.length} stealth payment{stealthPayments.length !== 1 ? 's' : ''}
            </h3>
            
            {stealthPayments.map((payment, index) => (
              <div
                key={`${payment.stealthAddress}-${index}`}
                className={`border rounded-lg p-4 ${
                  payment.recovered 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {payment.recovered ? '✅' : '💰'}
                    </span>
                    <span className="font-semibold text-lg">
                      {payment.amount} {payment.currency}
                    </span>
                    {payment.recovered && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        Recovered
                      </span>
                    )}
                  </div>
                  
                  {!payment.recovered && (
                    <Button
                      onClick={() => sweepPayment(payment)}
                      disabled={isSweeping}
                      variant="primary"
                      size="sm"
                    >
                      {isSweeping ? (
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sweeping...
                        </span>
                      ) : (
                        '💸 Sweep Funds'
                      )}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Stealth Address:</span>
                    <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                      {formatAddress(payment.stealthAddress)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Received:</span>
                    <div className="text-gray-600 mt-1">
                      {formatDate(payment.timestamp)}
                    </div>
                  </div>
                  
                  {payment.transactionHash && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">Transaction:</span>
                      <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
                        {formatAddress(payment.transactionHash)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {stealthPayments.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📊 Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Total Payments:</span>
                <div className="font-semibold text-blue-900">{stealthPayments.length}</div>
              </div>
              <div>
                <span className="text-blue-700">Pending Recovery:</span>
                <div className="font-semibold text-blue-900">
                  {stealthPayments.filter(p => !p.recovered).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">ℹ️ How it works</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Buyers generate unique stealth addresses for each payment</li>
            <li>• This scanner detects payments made to your stealth addresses</li>
            <li>• Use "Sweep Funds" to transfer money to your main wallet</li>
            <li>• All transactions maintain complete privacy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
