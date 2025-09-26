"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for existing connection on mount
  useEffect(() => {
    if (isClient) {
      checkExistingConnection();
    }
  }, [isClient]);

  const checkExistingConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        console.log('Checking for existing wallet connection...');
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWalletInternal();
        }
      } catch (error) {
        console.error('Error checking existing connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    await connectWalletInternal();
  };

  const connectWalletInternal = async () => {
    if (!isClient || typeof window === 'undefined') {
      console.log('Not on client side, skipping wallet connection');
      return;
    }

    if (!window.ethereum) {
      throw new Error('No wallet detected. Please install MetaMask or another Ethereum wallet.');
    }

    setIsConnecting(true);

    try {
      // Wait for MetaMask to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      // Handle multiple providers
      let provider = window.ethereum;
      if (window.ethereum.providers?.length > 0) {
        const metaMaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask);
        provider = metaMaskProvider || window.ethereum.providers[0];
      }

      console.log('Requesting wallet connection...');
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Get network and balance
      const [chainId, balance] = await Promise.all([
        provider.request({ method: 'eth_chainId' }),
        provider.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        })
      ]);

      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

      const walletInfo: WalletInfo = {
        address: accounts[0],
        balance: balanceInEth,
        network: getNetworkName(chainId),
        isConnected: true,
      };

      setWallet(walletInfo);
      console.log('Wallet connected globally:', walletInfo);

      // Set up event listeners
      if (window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      throw error;
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

  const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai',
      '0xa86a': 'Avalanche Mainnet',
      '0xa869': 'Avalanche Fuji',
      '0xaa36a7': 'Sepolia Testnet',
    };
    return networks[chainId] || `Network ${chainId}`;
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
