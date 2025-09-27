/**
 * Stealth Payment Service
 * Simplified interface that hides all complexity from users
 */

import { ethers } from 'ethers';
import { generateStealthAddressForRecipient, scanForStealthPayments, sweepStealthFunds, loadStealthKeysFromStorage } from './stealth';
import { getUserStealthMetaAddress } from './userProfile';

export interface SimplePaymentInfo {
  paymentAddress: string;
  amount: string;
  currency: string;
  recipientAddress: string;
}

export interface DetectedPayment {
  id: string;
  amount: string;
  currency: string;
  timestamp: string;
  canSweep: boolean;
  stealthAddress: string;
}

/**
 * Generate payment address for a seller (buyer side)
 * This hides all the complexity of stealth address generation
 */
export async function generatePaymentAddress(
  sellerWalletAddress: string,
  amount: string,
  currency: string = 'ETH'
): Promise<SimplePaymentInfo> {
  try {
    // Get seller's stealth meta-address from their profile
    const sellerMetaAddress = getUserStealthMetaAddress(sellerWalletAddress);
    
    if (!sellerMetaAddress) {
      throw new Error('Seller has not enabled private payments yet');
    }
    
    // Generate stealth address (this handles all the crypto complexity)
    const stealthPayment = generateStealthAddressForRecipient(sellerMetaAddress);
    
    console.log('Generated payment address for seller:', {
      seller: sellerWalletAddress,
      paymentAddress: stealthPayment.stealthAddress,
      amount,
      currency
    });
    
    return {
      paymentAddress: stealthPayment.stealthAddress,
      amount,
      currency,
      recipientAddress: sellerWalletAddress
    };
  } catch (error) {
    console.error('Error generating payment address:', error);
    throw new Error('Failed to generate private payment address');
  }
}

/**
 * Send payment to stealth address (buyer side)
 * This handles the actual transaction
 */
export async function sendPaymentToStealthAddress(
  paymentInfo: SimplePaymentInfo,
  signer: ethers.Signer
): Promise<string> {
  try {
    console.log('Sending payment to stealth address:', paymentInfo);
    
    if (paymentInfo.currency === 'ETH') {
      // Send ETH
      const tx = await signer.sendTransaction({
        to: paymentInfo.paymentAddress,
        value: ethers.parseEther(paymentInfo.amount)
      });
      
      console.log('Payment sent:', tx.hash);
      return tx.hash;
    } else {
      // TODO: Handle ERC-20 tokens
      throw new Error('Token payments not yet implemented');
    }
  } catch (error) {
    console.error('Error sending payment:', error);
    throw new Error('Failed to send payment');
  }
}

/**
 * Check for incoming payments (seller side)
 * This scans the blockchain and returns simple payment info
 */
export async function checkForIncomingPayments(
  provider?: ethers.Provider
): Promise<DetectedPayment[]> {
  try {
    // Load seller's stealth keys
    const stealthKeys = loadStealthKeysFromStorage();
    if (!stealthKeys) {
      throw new Error('No stealth keys found. Please complete onboarding first.');
    }
    
    console.log('Checking for incoming payments...');
    
    // Scan blockchain (this handles all the complexity)
    const payments = await scanForStealthPayments(stealthKeys, provider);
    
    // Convert to simple format
    const detectedPayments: DetectedPayment[] = payments.map((payment, index) => ({
      id: `payment_${index}_${payment.stealthAddress.slice(-8)}`,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: payment.timestamp,
      canSweep: !payment.recovered && parseFloat(payment.amount) > 0,
      stealthAddress: payment.stealthAddress
    }));
    
    console.log(`Found ${detectedPayments.length} incoming payments`);
    return detectedPayments;
  } catch (error) {
    console.error('Error checking for payments:', error);
    throw new Error('Failed to check for incoming payments');
  }
}

/**
 * Collect payment (seller side)
 * This sweeps funds from stealth address to main wallet
 */
export async function collectPayment(
  paymentId: string,
  destinationAddress: string,
  signer: ethers.Signer
): Promise<string> {
  try {
    // Load seller's stealth keys
    const stealthKeys = loadStealthKeysFromStorage();
    if (!stealthKeys) {
      throw new Error('No stealth keys found');
    }
    
    // Get all payments to find the one to collect
    const payments = await scanForStealthPayments(stealthKeys);
    const paymentToCollect = payments.find((p, index) => 
      `payment_${index}_${p.stealthAddress.slice(-8)}` === paymentId
    );
    
    if (!paymentToCollect) {
      throw new Error('Payment not found');
    }
    
    console.log('Collecting payment:', paymentId);
    
    // Sweep funds (this handles all the crypto complexity)
    const txHash = await sweepStealthFunds(
      stealthKeys,
      paymentToCollect,
      destinationAddress,
      signer
    );
    
    console.log('Payment collected:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error collecting payment:', error);
    throw new Error('Failed to collect payment');
  }
}

/**
 * Check if user can receive private payments
 */
export function canReceivePrivatePayments(walletAddress: string): boolean {
  const metaAddress = getUserStealthMetaAddress(walletAddress);
  return !!metaAddress;
}

/**
 * Get user's payment receiving status
 */
export function getPaymentReceivingStatus(walletAddress: string): {
  canReceive: boolean;
  metaAddress?: string;
  setupRequired: boolean;
} {
  const metaAddress = getUserStealthMetaAddress(walletAddress);
  
  return {
    canReceive: !!metaAddress,
    metaAddress: metaAddress || undefined,
    setupRequired: !metaAddress
  };
}

/**
 * Estimate gas for payment
 */
export async function estimatePaymentGas(
  paymentInfo: SimplePaymentInfo,
  provider: ethers.Provider
): Promise<{
  gasEstimate: bigint;
  gasCost: string;
  totalCost: string;
}> {
  try {
    const gasEstimate = await provider.estimateGas({
      to: paymentInfo.paymentAddress,
      value: ethers.parseEther(paymentInfo.amount)
    });
    
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    
    const gasCost = gasEstimate * gasPrice;
    const totalCost = ethers.parseEther(paymentInfo.amount) + gasCost;
    
    return {
      gasEstimate,
      gasCost: ethers.formatEther(gasCost),
      totalCost: ethers.formatEther(totalCost)
    };
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw new Error('Failed to estimate transaction cost');
  }
}