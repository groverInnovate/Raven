/**
 * Network Configuration and Helpers
 * Ensures users are connected to the correct network
 */

import { ethers } from 'ethers';

export const SEPOLIA_NETWORK = {
  chainId: 11155111,
  chainIdHex: '0xaa36a7',
  name: 'Sepolia Testnet',
  rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia Ether',
    symbol: 'ETH',
    decimals: 18
  }
};

/**
 * Check if user is connected to Sepolia testnet
 */
export async function isConnectedToSepolia(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    return Number(network.chainId) === SEPOLIA_NETWORK.chainId;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
}

/**
 * Switch to Sepolia testnet
 */
export async function switchToSepolia(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not available');
  }

  try {
    // Try to switch to Sepolia
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: SEPOLIA_NETWORK.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // If the network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_NETWORK.chainIdHex,
              chainName: SEPOLIA_NETWORK.name,
              rpcUrls: [SEPOLIA_NETWORK.rpcUrl],
              blockExplorerUrls: [SEPOLIA_NETWORK.blockExplorer],
              nativeCurrency: SEPOLIA_NETWORK.nativeCurrency,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding Sepolia network:', addError);
        throw new Error('Failed to add Sepolia network to wallet');
      }
    } else {
      console.error('Error switching to Sepolia:', switchError);
      throw new Error('Failed to switch to Sepolia network');
    }
  }
}

/**
 * Get current network info
 */
export async function getCurrentNetwork(): Promise<{ chainId: number; name: string } | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    
    return {
      chainId: Number(network.chainId),
      name: getNetworkName(Number(network.chainId))
    };
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
}

/**
 * Get network name by chain ID
 */
function getNetworkName(chainId: number): string {
  const networks: { [key: number]: string } = {
    1: 'Ethereum Mainnet',
    11155111: 'Sepolia Testnet',
    5: 'Goerli Testnet',
    137: 'Polygon Mainnet',
    80001: 'Polygon Mumbai',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli',
    10: 'Optimism',
    420: 'Optimism Goerli'
  };
  
  return networks[chainId] || `Unknown Network (${chainId})`;
}

/**
 * Get Sepolia ETH faucet URLs
 */
export function getSepoliaFaucets(): Array<{ name: string; url: string }> {
  return [
    {
      name: 'Alchemy Faucet',
      url: 'https://sepoliafaucet.com/'
    },
    {
      name: 'Infura Faucet',
      url: 'https://www.infura.io/faucet/sepolia'
    },
    {
      name: 'Chainlink Faucet',
      url: 'https://faucets.chain.link/sepolia'
    }
  ];
}