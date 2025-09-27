/**
 * Blockchain Configuration for Stealth Payments
 */

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface TokenConfig {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

// Network configurations
export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  sepolia: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  polygon: {
    name: 'Polygon Mainnet',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};

// Token configurations by network
export const TOKENS: Record<string, Record<string, TokenConfig>> = {
  mainnet: {
    USDC: {
      address: '0xA0b86a33E6441b8435b662c8b8b8b8b8b8b8b8b8',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin'
    },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD'
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      decimals: 18,
      name: 'Dai Stablecoin'
    }
  },
  sepolia: {
    USDC: {
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin (Sepolia)'
    }
  },
  polygon: {
    USDC: {
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin (PoS)'
    },
    USDT: {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      decimals: 6,
      name: 'Tether USD (PoS)'
    }
  }
};

// Scanner configuration
export const SCANNER_CONFIG = {
  // Default number of blocks to scan backwards
  DEFAULT_BLOCK_RANGE: 5000,
  
  // Maximum blocks to scan in a single request
  MAX_BLOCK_RANGE: 1000,
  
  // Number of stealth addresses to generate for scanning
  STEALTH_ADDRESS_COUNT: 50,
  
  // Batch size for parallel requests
  BATCH_SIZE: 10,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // ms
  
  // Gas configuration
  DEFAULT_GAS_PRICE: '20', // gwei
  GAS_LIMIT_BUFFER: 1.2, // 20% buffer
  
  // Supported ERC standards
  SUPPORTED_STANDARDS: {
    ERC20: true,
    ERC721: false, // NFTs - future implementation
    ERC1155: false, // Multi-token - future implementation
    ERC5564: true // Stealth addresses
  }
};

// Helper functions
export function getNetworkConfig(chainId: number): NetworkConfig | null {
  return Object.values(NETWORKS).find(network => network.chainId === chainId) || null;
}

export function getTokenConfig(chainId: number, symbol: string): TokenConfig | null {
  const network = getNetworkConfig(chainId);
  if (!network) return null;
  
  const networkKey = Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === chainId);
  if (!networkKey) return null;
  
  return TOKENS[networkKey]?.[symbol.toUpperCase()] || null;
}

export function getSupportedTokens(chainId: number): TokenConfig[] {
  const network = getNetworkConfig(chainId);
  if (!network) return [];
  
  const networkKey = Object.keys(NETWORKS).find(key => NETWORKS[key].chainId === chainId);
  if (!networkKey) return [];
  
  return Object.values(TOKENS[networkKey] || {});
}

// RPC URL helpers
export function getRpcUrl(chainId: number): string {
  const network = getNetworkConfig(chainId);
  return network?.rpcUrl || NETWORKS.mainnet.rpcUrl;
}

export function getBlockExplorer(chainId: number): string {
  const network = getNetworkConfig(chainId);
  return network?.blockExplorer || NETWORKS.mainnet.blockExplorer;
}

// Development/testing configuration
export const DEV_CONFIG = {
  // Use mock data when blockchain scanning fails
  USE_MOCK_DATA: true,
  
  // Enable detailed logging
  VERBOSE_LOGGING: true,
  
  // Shorter block ranges for faster testing
  TEST_BLOCK_RANGE: 100,
  
  // Mock payment configuration
  MOCK_PAYMENTS: {
    ETH_AMOUNT: '0.1',
    TOKEN_AMOUNT: '100',
    DEFAULT_TOKEN: 'USDC'
  }
};

export default {
  NETWORKS,
  TOKENS,
  SCANNER_CONFIG,
  DEV_CONFIG,
  getNetworkConfig,
  getTokenConfig,
  getSupportedTokens,
  getRpcUrl,
  getBlockExplorer
};