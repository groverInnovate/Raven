"use client";

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Badge } from '../ui';

export default function WalletDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      checkWalletEnvironment();
    }
  }, [isClient]);

  const checkWalletEnvironment = () => {
    const info: any = {
      isClient: typeof window !== 'undefined',
      hasEthereum: typeof window !== 'undefined' && !!window.ethereum,
      hasMetaMask: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
      providers: []
    };

    if (typeof window !== 'undefined' && window.ethereum) {
      // Check for multiple providers
      if (window.ethereum.providers) {
        info.providers = window.ethereum.providers.map((p: any) => ({
          isMetaMask: p.isMetaMask,
          isCoinbaseWallet: p.isCoinbaseWallet,
          isRabby: p.isRabby
        }));
      } else {
        info.providers = [{
          isMetaMask: window.ethereum.isMetaMask,
          isCoinbaseWallet: window.ethereum.isCoinbaseWallet,
          isRabby: window.ethereum.isRabby
        }];
      }
    }

    setDebugInfo(info);
  };

  const testConnection = async () => {
    if (!window.ethereum) {
      alert('No ethereum provider found!');
      return;
    }

    try {
      console.log('Testing wallet connection...');
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Test connection result:', accounts);
      alert(`Connection successful! Account: ${accounts[0]}`);
    } catch (error: any) {
      console.error('Test connection failed:', error);
      alert(`Connection failed: ${error.message}`);
    }
  };

  if (!isClient) {
    return <div>Loading wallet debug info...</div>;
  }

  return (
    <Card className="mt-4">
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">🔧 Wallet Debug Info</h3>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span>Client Side:</span>
            <Badge variant={debugInfo.isClient ? 'success' : 'danger'}>
              {debugInfo.isClient ? 'Yes' : 'No'}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <span>Ethereum Provider:</span>
            <Badge variant={debugInfo.hasEthereum ? 'success' : 'danger'}>
              {debugInfo.hasEthereum ? 'Found' : 'Not Found'}
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <span>MetaMask:</span>
            <Badge variant={debugInfo.hasMetaMask ? 'success' : 'warning'}>
              {debugInfo.hasMetaMask ? 'Detected' : 'Not Detected'}
            </Badge>
          </div>

          {debugInfo.providers.length > 0 && (
            <div>
              <span className="font-medium">Detected Providers:</span>
              <div className="mt-2 space-y-1">
                {debugInfo.providers.map((provider: any, index: number) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                    {provider.isMetaMask && <Badge variant="info" size="sm" className="mr-1">MetaMask</Badge>}
                    {provider.isCoinbaseWallet && <Badge variant="secondary" size="sm" className="mr-1">Coinbase</Badge>}
                    {provider.isRabby && <Badge variant="warning" size="sm" className="mr-1">Rabby</Badge>}
                    {!provider.isMetaMask && !provider.isCoinbaseWallet && !provider.isRabby && (
                      <Badge variant="default" size="sm">Unknown</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button 
              onClick={testConnection} 
              variant="outline" 
              size="sm"
              disabled={!debugInfo.hasEthereum}
            >
              Test Direct Connection
            </Button>
          </div>

          <details className="text-xs text-gray-600">
            <summary className="cursor-pointer">Show Raw Debug Data</summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
