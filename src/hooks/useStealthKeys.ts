/**
 * React Hook for Stealth Key Management
 * 
 * This hook provides a clean interface for managing stealth keys
 * in the Aadhaar Shield application.
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  StealthKeys,
  generateStealthKeysFromWallet,
  saveStealthKeysToStorage,
  loadStealthKeysFromStorage,
  clearStealthKeysFromStorage,
  formatStealthMetaAddress
} from '../lib/stealth';
import { useWallet } from '../contexts/WalletContext';

export interface UseStealthKeysReturn {
  stealthKeys: StealthKeys | null;
  isGenerating: boolean;
  hasStealthKeys: boolean;
  formattedMetaAddress: string | null;
  generateStealthKeys: () => Promise<void>;
  clearStealthKeys: () => void;
  error: string | null;
}

export function useStealthKeys(): UseStealthKeysReturn {
  const { wallet } = useWallet();
  const [stealthKeys, setStealthKeys] = useState<StealthKeys | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing stealth keys on mount
  useEffect(() => {
    const loadExistingKeys = () => {
      try {
        const existingKeys = loadStealthKeysFromStorage();
        if (existingKeys) {
          setStealthKeys(existingKeys);
        }
      } catch (err) {
        console.error('Error loading stealth keys:', err);
        setError('Failed to load existing stealth keys');
      }
    };

    loadExistingKeys();
  }, []);

  // Generate new stealth keys
  const generateStealthKeys = useCallback(async () => {
    if (!wallet?.address) {
      setError('Wallet not connected');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Create a signer from the connected wallet
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Generate stealth keys
        const keys = await generateStealthKeysFromWallet(wallet.address, signer);
        
        // Save to storage and state
        saveStealthKeysToStorage(keys);
        setStealthKeys(keys);
        
        console.log('Stealth keys generated successfully');
      } else {
        throw new Error('Ethereum provider not available');
      }
    } catch (err: any) {
      console.error('Error generating stealth keys:', err);
      setError(err.message || 'Failed to generate stealth keys');
    } finally {
      setIsGenerating(false);
    }
  }, [wallet?.address]);

  // Clear stealth keys
  const clearStealthKeys = useCallback(() => {
    clearStealthKeysFromStorage();
    setStealthKeys(null);
    setError(null);
  }, []);

  // Computed values
  const hasStealthKeys = stealthKeys !== null;
  const formattedMetaAddress = stealthKeys 
    ? formatStealthMetaAddress(stealthKeys.stealthMetaAddress)
    : null;

  return {
    stealthKeys,
    isGenerating,
    hasStealthKeys,
    formattedMetaAddress,
    generateStealthKeys,
    clearStealthKeys,
    error
  };
}
