/**
 * Wallet Utilities
 * Helper functions for wallet connections and error handling
 */

/**
 * Check if any Web3 wallet is available
 */
export function isWalletAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined';
}

/**
 * Check if MetaMask is available and ready
 */
export function isMetaMaskAvailable(): boolean {
  return isWalletAvailable() && window.ethereum.isMetaMask;
}

/**
 * Check if CoinDCX wallet is available
 */
export function isCoinDCXAvailable(): boolean {
  return isWalletAvailable() && window.ethereum.isCoinDCX;
}

/**
 * Get available wallet info
 */
export function getAvailableWallet(): { name: string; isAvailable: boolean } {
  try {
    if (!isWalletAvailable()) {
      return { name: 'None', isAvailable: false };
    }

    if (window.ethereum?.isCoinDCX) {
      return { name: 'CoinDCX', isAvailable: true };
    }
    
    if (window.ethereum?.isMetaMask) {
      return { name: 'MetaMask', isAvailable: true };
    }

    if (window.ethereum?.isTrust) {
      return { name: 'Trust Wallet', isAvailable: true };
    }

    if (window.ethereum?.isRabby) {
      return { name: 'Rabby', isAvailable: true };
    }

    // Generic Web3 wallet
    return { name: 'Web3 Wallet', isAvailable: true };
  } catch (error) {
    console.error('Error detecting wallet:', error);
    return { name: 'Unknown', isAvailable: false };
  }
}

/**
 * Wait for any Web3 wallet to be ready
 */
export async function waitForWallet(timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isWalletAvailable()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isWalletAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Handle wallet errors with user-friendly messages
 */
export function handleWalletError(error: any): string {
  console.error('Wallet error:', error);

  const walletInfo = getAvailableWallet();
  const walletName = walletInfo.name;

  // Circuit breaker error (MetaMask specific)
  if (error.code === -32603 && error.message?.includes('circuit breaker')) {
    return `${walletName} is temporarily busy. Please wait 30 seconds and try again.`;
  }

  // User rejected
  if (error.code === 4001) {
    return 'Connection was rejected. Please approve the connection request in MetaMask.';
  }

  // Already processing
  if (error.code === -32002) {
    return 'A connection request is already pending. Please check MetaMask.';
  }

  // Unauthorized
  if (error.code === 4100) {
    return 'Please unlock your MetaMask wallet and try again.';
  }

  // Unsupported method
  if (error.code === 4200) {
    return 'This operation is not supported by your wallet.';
  }

  // Disconnected
  if (error.code === 4900) {
    return 'MetaMask is disconnected. Please connect to a network.';
  }

  // Chain disconnected
  if (error.code === 4901) {
    return 'MetaMask is not connected to the requested network.';
  }

  // Generic error with message
  if (error.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry user rejections
      if (error.code === 4001) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe wallet request with error handling
 */
export async function safeWalletRequest(
  method: string,
  params?: any[],
  retries: number = 2
): Promise<any> {
  if (!isWalletAvailable()) {
    const walletInfo = getAvailableWallet();
    throw new Error(`No Web3 wallet is installed or available. Please install ${walletInfo.name || 'a Web3 wallet'}.`);
  }

  return retryWithBackoff(async () => {
    return await window.ethereum.request({
      method,
      params: params || []
    });
  }, retries);
}

/**
 * Check if error is a circuit breaker error
 */
export function isCircuitBreakerError(error: any): boolean {
  return error.code === -32603 && 
         error.message?.includes('circuit breaker');
}

/**
 * Get user-friendly network name
 */
export function getNetworkName(chainId: string): string {
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
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string, length: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Format balance for display
 */
export function formatBalance(balance: string, decimals: number = 4): string {
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
}