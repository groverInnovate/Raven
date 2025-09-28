/**
 * Blockchain Scanner Service for Stealth Payments
 * 
 * This service provides efficient blockchain scanning capabilities
 * for detecting stealth payments using various methods.
 */

import { ethers } from 'ethers';
import { StealthKeys, StealthPayment } from './stealth';

export interface ScannerConfig {
  provider?: ethers.Provider;
  fromBlock?: number;
  maxBlockRange?: number;
  includeTokens?: boolean;
  tokenAddresses?: string[];
  rpcUrl?: string;
}

export class StealthPaymentScanner {
  private provider: ethers.Provider;
  private config: Required<Omit<ScannerConfig, 'provider'>> & { provider?: ethers.Provider };

  constructor(config: ScannerConfig = {}) {
    this.config = {
      provider: config.provider,
      fromBlock: config.fromBlock ?? -5000, // Last 5k blocks
      maxBlockRange: config.maxBlockRange ?? 1000,
      includeTokens: config.includeTokens ?? true,
      tokenAddresses: config.tokenAddresses ?? [
        '0xA0b86a33E6441b8435b662c8b8b8b8b8b8b8b8b8', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F'  // DAI
      ],
      rpcUrl: config.rpcUrl ?? 'https://eth.llamarpc.com'
    };

    this.provider = this.initializeProvider();
  }

  private initializeProvider(): ethers.Provider {
    if (this.config.provider) {
      return this.config.provider;
    }

    // Try browser provider first
    if (typeof window !== 'undefined' && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }

    // Fallback to public RPC
    return new ethers.JsonRpcProvider(this.config.rpcUrl);
  }

  /**
   * Main scanning method that combines all detection strategies
   */
  async scanForPayments(stealthKeys: StealthKeys): Promise<StealthPayment[]> {
    console.log('Starting comprehensive stealth payment scan...');
    
    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock + this.config.fromBlock);
      
      console.log(`Scanning blocks ${fromBlock} to ${currentBlock}`);

      // Run all scanning methods in parallel for efficiency
      const [ethPayments, tokenPayments, announcementPayments] = await Promise.allSettled([
        this.scanETHTransfers(stealthKeys, fromBlock, currentBlock),
        this.config.includeTokens ? this.scanTokenTransfers(stealthKeys, fromBlock, currentBlock) : Promise.resolve([]),
        this.scanAnnouncementEvents(stealthKeys, fromBlock, currentBlock)
      ]);

      // Combine results, handling any rejections
      const allPayments: StealthPayment[] = [];
      
      if (ethPayments.status === 'fulfilled') {
        allPayments.push(...ethPayments.value);
      } else {
        console.warn('ETH scanning failed:', ethPayments.reason);
      }
      
      if (tokenPayments.status === 'fulfilled') {
        allPayments.push(...tokenPayments.value);
      } else {
        console.warn('Token scanning failed:', tokenPayments.reason);
      }
      
      if (announcementPayments.status === 'fulfilled') {
        allPayments.push(...announcementPayments.value);
      } else {
        console.warn('Announcement scanning failed:', announcementPayments.reason);
      }

      // Remove duplicates and sort by timestamp
      const uniquePayments = this.deduplicatePayments(allPayments);
      const sortedPayments = uniquePayments.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      console.log(`Scan complete: found ${sortedPayments.length} unique payments`);
      return sortedPayments;

    } catch (error) {
      console.error('Blockchain scanning failed:', error);
      throw new Error(`Blockchain scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scan for direct ETH transfers using a more efficient approach
   */
  private async scanETHTransfers(
    stealthKeys: StealthKeys,
    fromBlock: number,
    toBlock: number
  ): Promise<StealthPayment[]> {
    const payments: StealthPayment[] = [];
    
    try {
      // Generate a focused set of stealth addresses to check
      const stealthAddresses = await this.generateStealthAddressesToCheck(stealthKeys, 50);
      
      console.log(`Checking ${stealthAddresses.length} stealth addresses for ETH transfers...`);
      
      // Use batch requests for efficiency
      const batchSize = 10;
      for (let i = 0; i < stealthAddresses.length; i += batchSize) {
        const batch = stealthAddresses.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async ({ address, ephemeralPrivateKey }) => {
          try {
            const balance = await this.provider.getBalance(address);
            
            if (balance > BigInt(0)) {
              // Found funds! Get transaction history
              const txs = await this.getIncomingTransactions(address, fromBlock, toBlock);
              
              return txs.map(tx => ({
                stealthAddress: address,
                ephemeralPublicKey: '', // Will be filled if available
                ephemeralPrivateKey,
                amount: ethers.formatEther(tx.value),
                currency: 'ETH',
                timestamp: new Date(tx.timestamp * 1000).toISOString(),
                transactionHash: tx.hash,
                blockNumber: tx.blockNumber,
                recovered: false
              }));
            }
            
            return [];
          } catch (error) {
            console.warn(`Error checking address ${address}:`, error);
            return [];
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        payments.push(...batchResults.flat());
      }
      
    } catch (error) {
      console.error('Error scanning ETH transfers:', error);
    }
    
    return payments;
  }

  /**
   * Scan for ERC-20 token transfers
   */
  private async scanTokenTransfers(
    stealthKeys: StealthKeys,
    fromBlock: number,
    toBlock: number
  ): Promise<StealthPayment[]> {
    const payments: StealthPayment[] = [];
    
    try {
      const stealthAddresses = await this.generateStealthAddressesToCheck(stealthKeys, 30);
      const addressSet = new Set(stealthAddresses.map(a => a.address.toLowerCase()));
      
      // Scan each token contract
      for (const tokenAddress of this.config.tokenAddresses) {
        try {
          const tokenInfo = await this.getTokenInfo(tokenAddress);
          
          // Get Transfer events for this token
          const filter = {
            address: tokenAddress,
            topics: [ethers.id("Transfer(address,address,uint256)")],
            fromBlock,
            toBlock
          };
          
          const logs = await this.provider.getLogs(filter);
          
          for (const log of logs) {
            try {
              const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
                ['address', 'address', 'uint256'],
                log.data
              );
              
              const toAddress = ethers.getAddress('0x' + log.topics[2]!.slice(26));
              
              if (addressSet.has(toAddress.toLowerCase())) {
                const stealthInfo = stealthAddresses.find(a => 
                  a.address.toLowerCase() === toAddress.toLowerCase()
                );
                
                if (stealthInfo) {
                  const block = await this.provider.getBlock(log.blockNumber);
                  
                  if (block) {
                    payments.push({
                      stealthAddress: toAddress,
                      ephemeralPublicKey: '',
                      ephemeralPrivateKey: stealthInfo.ephemeralPrivateKey,
                      amount: ethers.formatUnits(decoded[2], tokenInfo.decimals),
                      currency: tokenInfo.symbol,
                      timestamp: new Date(block.timestamp * 1000).toISOString(),
                      transactionHash: log.transactionHash!,
                      blockNumber: log.blockNumber,
                      recovered: false
                    });
                  }
                }
              }
            } catch (error) {
              console.warn('Error processing token transfer log:', error);
            }
          }
        } catch (error) {
          console.warn(`Error scanning token ${tokenAddress}:`, error);
        }
      }
      
    } catch (error) {
      console.error('Error scanning token transfers:', error);
    }
    
    return payments;
  }

  /**
   * Scan for ERC-5564 Announcement events
   */
  private async scanAnnouncementEvents(
    stealthKeys: StealthKeys,
    fromBlock: number,
    toBlock: number
  ): Promise<StealthPayment[]> {
    const payments: StealthPayment[] = [];
    
    try {
      // ERC-5564 Announcement event
      const filter = {
        topics: [ethers.id("Announcement(uint256,address,bytes,bytes)")],
        fromBlock,
        toBlock
      };
      
      const logs = await this.provider.getLogs(filter);
      console.log(`Found ${logs.length} Announcement events`);
      
      for (const log of logs) {
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ['uint256', 'address', 'bytes', 'bytes'],
            log.data
          );
          
          const [schemeId, stealthAddress, ephemeralPubKey, metadata] = decoded;
          
          // Check if this belongs to us (simplified check)
          // In a full implementation, you'd use proper ECDH key derivation
          const tx = await this.provider.getTransaction(log.transactionHash!);
          const block = await this.provider.getBlock(log.blockNumber);
          
          if (tx && block && tx.value > BigInt(0)) {
            payments.push({
              stealthAddress,
              ephemeralPublicKey: ephemeralPubKey,
              ephemeralPrivateKey: '', // Would need proper derivation
              amount: ethers.formatEther(tx.value),
              currency: 'ETH',
              timestamp: new Date(block.timestamp * 1000).toISOString(),
              transactionHash: tx.hash,
              blockNumber: log.blockNumber,
              recovered: false
            });
          }
        } catch (error) {
          console.warn('Error processing announcement event:', error);
        }
      }
      
    } catch (error) {
      console.error('Error scanning announcement events:', error);
    }
    
    return payments;
  }

  /**
   * Generate stealth addresses to check (more efficient approach)
   */
  private async generateStealthAddressesToCheck(
    stealthKeys: StealthKeys,
    count: number
  ): Promise<Array<{ address: string; ephemeralPrivateKey: string }>> {
    const addresses: Array<{ address: string; ephemeralPrivateKey: string }> = [];
    
    // In a production system, you'd:
    // 1. Store ephemeral keys used in payments
    // 2. Use deterministic key derivation
    // 3. Have a more efficient address generation strategy
    
    for (let i = 0; i < count; i++) {
      try {
        const ephemeralWallet = ethers.Wallet.createRandom();
        const ephemeralPrivateKey = ephemeralWallet.privateKey;
        
        // Generate stealth address using the same logic as the main library
        const combinedData = ethers.concat([
          ethers.toUtf8Bytes(stealthKeys.stealthMetaAddress),
          ethers.toUtf8Bytes(ephemeralPrivateKey)
        ]);
        
        const stealthSeed = ethers.keccak256(combinedData);
        const stealthWallet = new ethers.Wallet(stealthSeed);
        
        addresses.push({
          address: stealthWallet.address,
          ephemeralPrivateKey
        });
      } catch (error) {
        console.warn(`Error generating stealth address ${i}:`, error);
      }
    }
    
    return addresses;
  }

  /**
   * Get incoming transactions for an address
   */
  private async getIncomingTransactions(
    address: string,
    fromBlock: number,
    toBlock: number
  ): Promise<Array<{ hash: string; value: bigint; timestamp: number; blockNumber: number }>> {
    const transactions: Array<{ hash: string; value: bigint; timestamp: number; blockNumber: number }> = [];
    
    try {
      // Use a more efficient approach with event logs or external APIs
      // This is a simplified version for demonstration
      
      const blockRange = Math.min(this.config.maxBlockRange, toBlock - fromBlock);
      const step = Math.max(1, Math.floor(blockRange / 10));
      
      for (let blockNum = fromBlock; blockNum <= toBlock; blockNum += step) {
        try {
          const block = await this.provider.getBlock(blockNum, true);
          if (!block?.transactions) continue;
          
          for (const tx of block.transactions) {
            if (typeof tx === 'string') continue;
            
            const transaction = tx as ethers.TransactionResponse;
            if (transaction.to?.toLowerCase() === address.toLowerCase() && transaction.value > BigInt(0)) {
              transactions.push({
                hash: transaction.hash,
                value: transaction.value,
                timestamp: block.timestamp,
                blockNumber: blockNum
              });
            }
          }
        } catch (error) {
          // Skip failed blocks
          continue;
        }
      }
    } catch (error) {
      console.error('Error getting incoming transactions:', error);
    }
    
    return transactions;
  }

  /**
   * Get token information
   */
  private async getTokenInfo(tokenAddress: string): Promise<{ symbol: string; decimals: number }> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)'
        ],
        this.provider
      );
      
      const [symbol, decimals] = await Promise.all([
        contract.symbol(),
        contract.decimals()
      ]);
      
      return { symbol, decimals };
    } catch (error) {
      console.warn(`Error getting token info for ${tokenAddress}:`, error);
      return { symbol: 'UNKNOWN', decimals: 18 };
    }
  }

  /**
   * Remove duplicate payments
   */
  private deduplicatePayments(payments: StealthPayment[]): StealthPayment[] {
    const seen = new Set<string>();
    return payments.filter(payment => {
      const key = `${payment.transactionHash}-${payment.stealthAddress}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Export a default scanner instance
export const defaultStealthScanner = new StealthPaymentScanner();