"use client";

import { useState } from 'react';
import { Button, Badge, Modal, ModalBody, ModalFooter } from '../ui';
import { useWallet } from '../../contexts/WalletContext';
import { getAvailableWallet } from '../../lib/walletUtils';
import { cn } from '../../lib/theme';

interface WalletConnectProps {
  className?: string;
}

export default function WalletConnect({ className }: WalletConnectProps) {
  const { wallet, isConnecting, connectWallet, disconnectWallet, isClient } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const walletInfo = getAvailableWallet();



  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
    } catch (error: any) {
      console.error('Connection error:', error);
      
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === 4001) {
        errorMessage = 'Connection rejected by user. Please try again and approve the connection.';
      } else if (error.code === -32002) {
        errorMessage = 'Connection request already pending. Please check MetaMask.';
      } else if (error.code === -32603 && error.message?.includes('circuit breaker')) {
        errorMessage = `${walletInfo.name} is temporarily busy. Please wait a moment and try again.`;
      } else if (error.message?.includes('temporarily unavailable')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setShowModal(true);
    }
  };



  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet?.isConnected) {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        {/* Wallet Info */}
        <div className="hidden sm:flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="text-sm">
            <div className="font-medium text-green-800">{formatAddress(wallet.address)}</div>
            <div className="text-green-600">{wallet.balance} ETH</div>
          </div>
        </div>

        {/* Network Badge */}
        <Badge variant="secondary" size="sm">
          {wallet.network}
        </Badge>

        {/* Disconnect Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        loading={isConnecting}
        onClick={handleConnect}
        icon="🔗"
        iconPosition="left"
        className={className}
      >
        {isConnecting ? 'Connecting...' : `Connect ${walletInfo.name}`}
      </Button>

      {/* Error Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Wallet Connection"
        size="sm"
      >
        <ModalBody>
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">{error}</p>
            
            {!walletInfo.isAvailable && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Install a Web3 Wallet</h4>
                <p className="text-sm text-blue-800 mb-3">
                  You need a Web3 wallet to connect and make transactions.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => window.open('https://metamask.io/download/', '_blank')}
                    className="w-full"
                  >
                    Download MetaMask
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://coindcx.com/', '_blank')}
                    className="w-full"
                  >
                    Get CoinDCX Wallet
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
