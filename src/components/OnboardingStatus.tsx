"use client";

import React from 'react';
import Link from 'next/link';
import { useWallet } from '../contexts/WalletContext';
import { needsOnboarding } from '../lib/userProfile';

interface OnboardingStatusProps {
  className?: string;
}

export default function OnboardingStatus({ className = '' }: OnboardingStatusProps) {
  const { wallet } = useWallet();
  
  if (!wallet?.address) return null;
  
  const onboardingStatus = needsOnboarding(wallet.address);
  
  // Don't show if user is fully onboarded
  if (onboardingStatus.isComplete) return null;
  
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">🚀</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-1">
            Complete Your Setup
          </h3>
          
          <div className="space-y-2 text-sm text-blue-800">
            {onboardingStatus.needsVerification && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-300 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                </span>
                <span>Verify your identity with Aadhaar</span>
              </div>
            )}
            
            {!onboardingStatus.needsVerification && onboardingStatus.needsStealthKeys && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </span>
                <span className="line-through text-blue-600">Verify your identity with Aadhaar</span>
              </div>
            )}
            
            {onboardingStatus.needsStealthKeys && (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-300 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                </span>
                <span>Enable private payments</span>
              </div>
            )}
          </div>
          
          <div className="mt-3">
            <Link
              href="/get-started"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Continue Setup
              <span className="text-xs">→</span>
            </Link>
          </div>
        </div>
        
        <button className="flex-shrink-0 text-blue-400 hover:text-blue-600">
          <span className="sr-only">Dismiss</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}