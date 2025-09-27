/**
 * React Hook for Stealth Payment Scanning
 * 
 * This hook provides functionality for sellers to scan for and recover
 * stealth payments made to their stealth addresses.
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  StealthKeys,
  StealthPayment,
  scanForStealthPayments,
  sweepStealthFunds,
  loadStealthKeysFromStorage
} from '../lib/stealth';
import { useWallet } from '../contexts/WalletContext';

export interface UseStealthPaymentScannerReturn {
  stealthPayments: StealthPayment[];
  isScanning: boolean;
  isSweeping: boolean;
  scanForPayments: () => Promise<void>;
  sweepPayment: (payment: StealthPayment) => Promise<string | null>;
  error: string | null;
  totalUnrecoveredAmount: string;
}

export function useStealthPaymentScanner(): UseStealthPaymentScannerReturn {
  const { wallet } = useWallet();
  const [stealthPayments, setStealthPayments] = useState<StealthPayment[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scan for stealth payments
  const scanForPayments = useCallback(async () => {
    setIsScanning(true);
    setError(null);

    try {
      // Load seller's stealth keys
      const stealthKeys = loadStealthKeysFromStorage();
      if (!stealthKeys) {
        throw new Error('No stealth keys found. Please generate stealth keys first.');
      }

      console.log('Scanning for stealth payments...');
      
      // Get provider for blockchain scanning
      let provider: ethers.Provider | undefined;
      if (typeof window !== 'undefined' && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      // Scan for payments (now async)
      const payments = await scanForStealthPayments(stealthKeys, provider);
      setStealthPayments(payments);

      console.log(`Found ${payments.length} stealth payments`);
    } catch (err: any) {
      console.error('Error scanning for stealth payments:', err);
      setError(err.message || 'Failed to scan for stealth payments');
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Sweep a specific payment
  const sweepPayment = useCallback(async (payment: StealthPayment): Promise<string | null> => {
    if (!wallet?.address) {
      setError('Wallet not connected');
      return null;
    }

    setIsSweeping(true);
    setError(null);

    try {
      // Load seller's stealth keys
      const stealthKeys = loadStealthKeysFromStorage();
      if (!stealthKeys) {
        throw new Error('No stealth keys found');
      }

      // Create signer
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Sweep the funds
        const txHash = await sweepStealthFunds(
          stealthKeys,
          payment,
          wallet.address,
          signer
        );

        // Update the payment status
        setStealthPayments(prev => 
          prev.map(p => 
            p.stealthAddress === payment.stealthAddress 
              ? { ...p, recovered: true, transactionHash: txHash }
              : p
          )
        );

        console.log('Payment swept successfully:', txHash);
        return txHash;
      } else {
        throw new Error('Ethereum provider not available');
      }
    } catch (err: any) {
      console.error('Error sweeping payment:', err);
      setError(err.message || 'Failed to sweep payment');
      return null;
    } finally {
      setIsSweeping(false);
    }
  }, [wallet?.address]);

  // Calculate total unrecovered amount
  const totalUnrecoveredAmount = stealthPayments
    .filter(payment => !payment.recovered)
    .reduce((total, payment) => {
      return (parseFloat(total) + parseFloat(payment.amount)).toString();
    }, '0');

  // Auto-scan on mount
  useEffect(() => {
    if (wallet?.address) {
      scanForPayments();
    }
  }, [wallet?.address, scanForPayments]);

  return {
    stealthPayments,
    isScanning,
    isSweeping,
    scanForPayments,
    sweepPayment,
    error,
    totalUnrecoveredAmount
  };
}
