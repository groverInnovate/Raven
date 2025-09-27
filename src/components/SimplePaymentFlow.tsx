"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { generatePaymentAddress, sendPaymentToStealthAddress, estimatePaymentGas } from '../lib/stealthPaymentService';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface SimplePaymentFlowProps {
  sellerWalletAddress: string;
  sellerName: string;
  amount: string;
  currency?: string;
  itemTitle: string;
  onPaymentComplete?: (txHash: string) => void;
  className?: string;
}

export default function SimplePaymentFlow({
  sellerWalletAddress,
  sellerName,
  amount,
  currency = 'ETH',
  itemTitle,
  onPaymentComplete,
  className = ''
}: SimplePaymentFlowProps) {
  const { wallet } = useWallet();
  const [paymentStep, setPaymentStep] = useState<'prepare' | 'confirm' | 'sending' | 'complete'>('prepare');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [gasEstimate, setGasEstimate] = useState<any>(null);

  const preparePayment = async () => {
    try {
      setError('');
      setPaymentStep('prepare');
      
      console.log('Preparing private payment...');
      
      // Generate stealth payment address
      const paymentInfo = await generatePaymentAddress(sellerWalletAddress, amount, currency);
      setPaymentAddress(paymentInfo.paymentAddress);
      
      // Estimate gas costs
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const gasInfo = await estimatePaymentGas(paymentInfo, provider);
        setGasEstimate(gasInfo);
      }
      
      setPaymentStep('confirm');
      console.log('Payment prepared:', paymentInfo);
    } catch (err: any) {
      console.error('Error preparing payment:', err);
      setError(err.message || 'Failed to prepare payment');
    }
  };

  const sendPayment = async () => {
    try {
      if (!wallet?.address || !paymentAddress) return;
      
      setError('');
      setPaymentStep('sending');
      
      console.log('Sending private payment...');
      
      // Get signer
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Send payment
        const hash = await sendPaymentToStealthAddress({
          paymentAddress,
          amount,
          currency,
          recipientAddress: sellerWalletAddress
        }, signer);
        
        setTxHash(hash);
        setPaymentStep('complete');
        
        if (onPaymentComplete) {
          onPaymentComplete(hash);
        }
        
        console.log('Payment sent successfully:', hash);
      }
    } catch (err: any) {
      console.error('Error sending payment:', err);
      setError(err.message || 'Failed to send payment');
      setPaymentStep('confirm');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Private Payment
          {paymentStep === 'complete' && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✅ Sent
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item:</span>
              <span className="font-medium">{itemTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seller:</span>
              <span className="font-medium">{sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{amount} {currency}</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Payment Steps */}
        {paymentStep === 'prepare' && (
          <div className="space-y-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">🛡️ Enhanced Privacy</h4>
              <p className="text-sm text-blue-800">
                This payment will be sent privately. The seller can receive it, but external 
                observers cannot link it to their identity.
              </p>
            </div>
            
            <Button
              onClick={preparePayment}
              variant="primary"
              className="w-full"
            >
              🔐 Prepare Private Payment
            </Button>
          </div>
        )}

        {paymentStep === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✅ Payment Ready</h4>
              <p className="text-sm text-green-800">
                Your private payment address has been generated. Click confirm to send the payment.
              </p>
            </div>

            {/* Payment Address (Optional to show) */}
            <details className="border border-gray-200 rounded-lg">
              <summary className="p-3 cursor-pointer text-sm font-medium text-gray-700 hover:bg-gray-50">
                🔧 Technical Details (Optional)
              </summary>
              <div className="p-3 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Private Payment Address:</span>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded border mt-1 break-all">
                      {paymentAddress}
                    </div>
                  </div>
                  {gasEstimate && (
                    <div>
                      <span className="font-medium text-gray-700">Estimated Gas Cost:</span>
                      <div className="text-xs text-gray-600 mt-1">
                        ~{gasEstimate.gasCost} ETH (Total: ~{gasEstimate.totalCost} ETH)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </details>

            <div className="flex gap-2">
              <Button
                onClick={() => setPaymentStep('prepare')}
                variant="outline"
                className="flex-1"
              >
                ← Back
              </Button>
              <Button
                onClick={sendPayment}
                variant="primary"
                className="flex-1"
              >
                💸 Confirm Payment
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 'sending' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h4 className="font-medium text-gray-900 mb-2">Sending Private Payment...</h4>
            <p className="text-sm text-gray-600">
              Please confirm the transaction in your wallet
            </p>
          </div>
        )}

        {paymentStep === 'complete' && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
              <div className="text-4xl mb-2">✅</div>
              <h4 className="font-semibold text-green-900 mb-2">Payment Sent Successfully!</h4>
              <p className="text-sm text-green-800">
                Your private payment has been sent. The seller will be able to detect and 
                collect it automatically.
              </p>
            </div>

            {txHash && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Hash:
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border font-mono text-sm break-all">
                  {txHash}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setPaymentStep('prepare');
                setPaymentAddress('');
                setTxHash('');
                setError('');
                setGasEstimate(null);
              }}
              variant="outline"
              className="w-full"
            >
              Send Another Payment
            </Button>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-gray-50 p-3 rounded-lg border">
          <p className="text-xs text-gray-600">
            <strong>🔒 Privacy Note:</strong> This payment uses stealth addresses to protect 
            both your privacy and the seller's. The transaction is recorded on the blockchain 
            but cannot be easily linked to either party's identity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}