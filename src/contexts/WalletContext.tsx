"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  isWalletAvailable,
  getAvailableWallet,
  waitForWallet, 
  handleWalletError, 
  safeWalletRequest,
  getNetworkName,
  formatBalance
} from '../lib/walletUtils';

export interface WalletInfo {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isClient: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState<number>(0);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for existing connection on mount with delay
  useEffect(() => {
    if (isClient) {
      // Add delay to prevent rapid requests and let wallet load
      const timer = setTimeout(() => {
        checkExistingConnection().catch(error => {
          console.log('Initial connection check failed:', error.message);
        });
      }, 2000); // Increased delay to 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isClient]);

  const checkExistingConnection = async () => {
    if (!isWalletAvailable()) {
      console.log('No Web3 wallet available, skipping connection check');
      return;
    }

    try {
      const walletInfo = getAvailableWallet();
      console.log(`Detected wallet: ${walletInfo.name}`);

      // Rate limiting: don't check too frequently
      const now = Date.now();
      if (now - lastConnectionAttempt < 3000) {
        console.log('Rate limiting: skipping connection check');
        return;
      }
      setLastConnectionAttempt(now);

      console.log(`Checking for existing ${walletInfo.name} connection...`);
      
      // Wait for wallet to be ready
      const isReady = await waitForWallet(2000);
      if (!isReady) {
        console.log(`${walletInfo.name} not ready, skipping connection check`);
        return;
      }
      
      // Use safe wallet request
      const accounts = await safeWalletRequest('eth_accounts', [], 1);
        
      if (accounts && accounts.length > 0) {
        console.log(`Found existing ${walletInfo.name} connection, connecting...`);
        await connectWalletInternal(true);
      } else {
        console.log('No existing connection found');
      }
    } catch (error: any) {
      const errorMessage = handleWalletError(error);
      console.error('Error checking existing connection:', errorMessage);
      
      // Don't throw error for existing connection checks
      // Just log and continue
    }
  };

  const connectWallet = async () => {
    await connectWalletInternal(false);
  };

  const connectWalletInternal = async (isExistingConnection: boolean = false) => {
    if (!isClient) {
      console.log('Not on client side, skipping wallet connection');
      return;
    }

    if (!isWalletAvailable()) {
      throw new Error('No Web3 wallet is installed. Please install MetaMask, CoinDCX wallet, or another Web3 wallet to continue.');
    }

    // Rate limiting for connection attempts
    const now = Date.now();
    if (!isExistingConnection && now - lastConnectionAttempt < 5000) {
      console.log('Rate limiting: connection attempt too soon');
      return;
    }
    setLastConnectionAttempt(now);

    setIsConnecting(true);

    try {
      const walletInfo = getAvailableWallet();
      
      // Wait for wallet to be ready
      const isReady = await waitForWallet(3000);
      if (!isReady) {
        throw new Error(`${walletInfo.name} is not ready. Please refresh the page and try again.`);
      }

      console.log(`Requesting ${walletInfo.name} connection...`);
      
      // Use safe wallet requests with retry logic
      const method = isExistingConnection ? 'eth_accounts' : 'eth_requestAccounts';
      const accounts = await safeWalletRequest(method, [], isExistingConnection ? 1 : 2);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Get network and balance with safe requests
      const [chainId, balance] = await Promise.all([
        safeWalletRequest('eth_chainId'),
        safeWalletRequest('eth_getBalance', [accounts[0], 'latest'])
      ]);

      const balanceInEth = formatBalance((parseInt(balance, 16) / Math.pow(10, 18)).toString());

      const connectedWallet: WalletInfo = {
        address: accounts[0],
        balance: balanceInEth,
        network: getNetworkName(chainId),
        isConnected: true,
      };

      setWallet(connectedWallet);
      console.log(`${walletInfo.name} connected successfully:`, {
        address: connectedWallet.address.slice(0, 10) + '...',
        network: connectedWallet.network,
        balance: connectedWallet.balance
      });

      // Set up event listeners safely
      try {
        if (window.ethereum.removeAllListeners) {
          window.ethereum.removeAllListeners('accountsChanged');
          window.ethereum.removeAllListeners('chainChanged');
        }
        
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      } catch (listenerError) {
        console.warn('Could not set up event listeners:', listenerError);
      }

    } catch (error: any) {
      const errorMessage = handleWalletError(error);
      console.error('Wallet connection failed:', errorMessage);
      
      // For existing connections, don't throw error, just log
      if (isExistingConnection) {
        console.log('Skipping error throw for existing connection check');
        return;
      }
      
      // For new connections, throw the user-friendly error
      throw new Error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    
    // Remove event listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      if (window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    }
    
    console.log('Wallet disconnected globally');
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      // Reconnect with new account
      connectWalletInternal();
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes to avoid issues
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };



  const value: WalletContextType = {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    isClient,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
