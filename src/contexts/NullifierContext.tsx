"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

interface NullifierData {
  nullifier: string;
  verificationData: any;
  userAddress: string;
  timestamp: string;
  documentType: number;
  verified: boolean;
}

interface NullifierContextType {
  nullifier: string | null;
  nullifierData: NullifierData | null;
  isVerified: boolean;
  isLoading: boolean;
  setNullifier: (nullifier: string, data?: NullifierData) => void;
  clearNullifier: () => void;
  refreshNullifierData: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
}

const NullifierContext = createContext<NullifierContextType | undefined>(undefined);

const NULLIFIER_COOKIE_NAME = 'ghostpalace_nullifier';
const COOKIE_EXPIRY_DAYS = 30; // 30 days

interface NullifierProviderProps {
  children: ReactNode;
}

export function NullifierProvider({ children }: NullifierProviderProps) {
  const [nullifier, setNullifierState] = useState<string | null>(null);
  const [nullifierData, setNullifierData] = useState<NullifierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Client-side hydration safety
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load nullifier from cookie on mount
  useEffect(() => {
    if (!isClient) return;

    const savedNullifier = Cookies.get(NULLIFIER_COOKIE_NAME);
    if (savedNullifier) {
      console.log('🍪 Found saved nullifier in cookie:', savedNullifier);
      setNullifierState(savedNullifier);
      // Automatically fetch verification data
      fetchNullifierData(savedNullifier);
    } else {
      setIsLoading(false);
    }
  }, [isClient]);

  // Fetch nullifier data from API (try Supabase first, then IPFS)
  const fetchNullifierData = async (nullifierValue: string): Promise<any> => {
    try {
      console.log('🔍 Fetching nullifier data for:', nullifierValue);
      
      // Try Supabase first (faster)
      try {
        const supabaseResponse = await fetch(`/api/users/supabase/${nullifierValue}`);
        if (supabaseResponse.ok) {
          const supabaseResult = await supabaseResponse.json();
          if (supabaseResult.success && supabaseResult.data) {
            console.log('✅ Nullifier data fetched from Supabase:', supabaseResult.data);
            const data = {
              nullifier: supabaseResult.data.nullifier,
              verificationData: {
                nationality: supabaseResult.data.nationality,
                minimumAge: supabaseResult.data.minimum_age.toString(),
                verified: true
              },
              userAddress: supabaseResult.data.user_address,
              timestamp: supabaseResult.data.created_at,
              documentType: 3, // Aadhaar
              verified: true
            };
            console.log('✅ Nullifier data loaded from Supabase successfully');
            return data;
          }
        }
      } catch (supabaseError) {
        console.log('⚠️ Supabase fetch failed, trying IPFS mapping:', supabaseError);
      }
      
      // Fallback to IPFS mapping
      const response = await fetch(`/api/mapping/${nullifierValue}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 Nullifier data fetched from IPFS:', result);
      
      return result.data || null;
    } catch (error) {
      console.error('❌ Error fetching nullifier data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Set nullifier and save to cookie
  const setNullifier = (nullifierValue: string, data?: NullifierData) => {
    console.log('🔐 Setting nullifier:', nullifierValue);
    
    setNullifierState(nullifierValue);
    
    // Save to cookie with expiry
    Cookies.set(NULLIFIER_COOKIE_NAME, nullifierValue, { 
      expires: COOKIE_EXPIRY_DAYS,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    if (data) {
      setNullifierData(data);
    } else {
      // Fetch data from API
      fetchNullifierData(nullifierValue);
    }
  };

  // Clear nullifier and remove cookie
  const clearNullifier = () => {
    console.log('🗑️ Clearing nullifier');
    
    setNullifierState(null);
    setNullifierData(null);
    Cookies.remove(NULLIFIER_COOKIE_NAME);
  };

  // Refresh nullifier data from API
  const refreshNullifierData = async () => {
    if (!nullifier) return;
    
    console.log('🔄 Refreshing nullifier data');
    await fetchNullifierData(nullifier);
  };

  // Check if user is verified
  const checkVerificationStatus = async (): Promise<boolean> => {
    if (!nullifier) return false;
    
    const data = await fetchNullifierData(nullifier);
    return data?.verified || false;
  };

  const isVerified = nullifierData?.verified || false;

  const contextValue: NullifierContextType = {
    nullifier,
    nullifierData,
    isVerified,
    isLoading,
    setNullifier,
    clearNullifier,
    refreshNullifierData,
    checkVerificationStatus
  };

  return (
    <NullifierContext.Provider value={contextValue}>
      {children}
    </NullifierContext.Provider>
  );
}

// Hook to use nullifier context
export function useNullifier(): NullifierContextType {
  const context = useContext(NullifierContext);
  if (context === undefined) {
    throw new Error('useNullifier must be used within a NullifierProvider');
  }
  return context;
}

// Utility functions for cookie management
export const nullifierUtils = {
  // Get nullifier from cookie (server-side safe)
  getNullifierFromCookie: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(NULLIFIER_COOKIE_NAME) || null;
  },

  // Check if user has a saved nullifier
  hasStoredNullifier: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!Cookies.get(NULLIFIER_COOKIE_NAME);
  },

  // Clear nullifier cookie directly
  clearNullifierCookie: () => {
    Cookies.remove(NULLIFIER_COOKIE_NAME);
  }
};
