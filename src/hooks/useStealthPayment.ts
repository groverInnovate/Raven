/**
 * React Hook for Stealth Payment Generation (Buyer Side)
 * 
 * This hook allows buyers to generate stealth addresses for payments
 * to sellers who have stealth keys enabled.
 */

import { useState, useCallback } from 'react';
import {
  StealthAddressGeneration,
  generateStealthAddressForRecipient,
  isValidStealthMetaAddress,
  parseStealthMetaAddress
} from '../lib/stealth';

export interface UseStealthPaymentReturn {
  stealthPayment: StealthAddressGeneration | null;
  isGenerating: boolean;
  error: string | null;
  generateStealthPayment: (sellerMetaAddress: string) => Promise<void>;
  clearStealthPayment: () => void;
  isValidMetaAddress: (address: string) => boolean;
}

export function useStealthPayment(): UseStealthPaymentReturn {
  const [stealthPayment, setStealthPayment] = useState<StealthAddressGeneration | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate stealth address for payment
  const generateStealthPayment = useCallback(async (sellerMetaAddress: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Validate the meta-address format
      if (!sellerMetaAddress) {
        throw new Error('Seller stealth meta-address is required');
      }

      // Clean and normalize the input
      let cleanInput = sellerMetaAddress.replace(/\s+/g, '').trim();

      // Parse formatted address if needed
      let cleanMetaAddress = cleanInput;
      if (cleanInput.startsWith('st:eth:')) {
        cleanMetaAddress = parseStealthMetaAddress(cleanInput);
      }

      // Validate the address
      if (!isValidStealthMetaAddress(cleanMetaAddress)) {
        throw new Error('Invalid stealth meta-address format');
      }

      // Generate stealth address for this payment
      const payment = generateStealthAddressForRecipient(cleanMetaAddress);
      
      setStealthPayment(payment);
      console.log('Stealth payment address generated:', payment.stealthAddress);
      
    } catch (err: any) {
      console.error('Error generating stealth payment:', err);
      setError(err.message || 'Failed to generate stealth payment address');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Clear stealth payment
  const clearStealthPayment = useCallback(() => {
    setStealthPayment(null);
    setError(null);
  }, []);

  // Validate meta-address
  const isValidMetaAddress = useCallback((address: string) => {
    try {
      if (!address) return false;
      
      // Clean and normalize the input
      let cleanInput = address.replace(/\s+/g, '').trim();
      
      let cleanAddress = cleanInput;
      if (cleanInput.startsWith('st:eth:')) {
        cleanAddress = parseStealthMetaAddress(cleanInput);
      }
      
      return isValidStealthMetaAddress(cleanAddress);
    } catch {
      return false;
    }
  }, []);

  return {
    stealthPayment,
    isGenerating,
    error,
    generateStealthPayment,
    clearStealthPayment,
    isValidMetaAddress
  };
}
