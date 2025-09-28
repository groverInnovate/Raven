import { ethers } from 'ethers';
import { ENS } from '@ensdomains/ensjs';
import { namehash, keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import * as secp256k1 from 'secp256k1';
import { randomBytes } from 'crypto';

interface TransactionData {
  txHash: string;
  amount: string;
  timestamp: number;
  buyer: string;
}

interface StealthKeyPair {
  stealthAddress: string;
  stealthPrivateKey: string;
  ephemeralPublicKey: string;
  sharedSecret: string;
}

interface SubdomainMapping {
  subdomain: string;
  stealthAddress: string;
  stealthPrivateKey: string; // Derived key for fund access
  ephemeralPublicKey: string;
  sharedSecret: string;
  txHash: string;
  parentHash: string;
  subHash: string;
  timestamp: number;
}

export class ENSStealthManager {
  private provider: ethers.providers.Provider;
  private ens: ENS;
  private signer: ethers.Signer;
  private parentDomain: string;
  private masterPrivateKey: string;
  private masterPublicKey: string;
  private viewingPrivateKey: string; // For scanning stealth payments
  private spendingPrivateKey: string; // For spending stealth payments
  private subdomainMappings: Map<string, SubdomainMapping> = new Map();
  
  constructor(
    provider: ethers.providers.Provider,
    signer: ethers.Signer,
    parentDomain: string,
    masterPrivateKey?: string
  ) {
    this.provider = provider;
    this.signer = signer;
    this.parentDomain = parentDomain;
    
    // Initialize or derive master keys
    if (masterPrivateKey) {
      this.masterPrivateKey = masterPrivateKey;
    } else {
      // Derive from signer if not provided
      this.masterPrivateKey = this.deriveMasterKey();
    }
    
    this.masterPublicKey = this.derivePublicKey(this.masterPrivateKey);
    
    // Derive viewing and spending keys (EIP-5564 standard)
    this.viewingPrivateKey = this.deriveViewingKey(this.masterPrivateKey);
    this.spendingPrivateKey = this.deriveSpendingKey(this.masterPrivateKey);
    
    // Initialize ENS
    this.ens = new ENS({ provider, ensAddress: this.getENSAddress() });
  }

  private getENSAddress(): string {
    const network = this.provider.network?.chainId;
    switch (network) {
      case 1: // Mainnet
        return '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
      case 5: // Goerli
        return '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
      case 11155111: // Sepolia
        return '0x0635513f179D50A207757E05759CbD106d7dFcE8';
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  }

  /**
   * Derive master key from signer (if not provided)
   */
  private deriveMasterKey(): string {
    // In production, use a more secure key derivation
    const message = `ENS Stealth Master Key for ${this.parentDomain}`;
    const messageHash = keccak256(toUtf8Bytes(message));
    return messageHash;
  }

  /**
   * Derive public key from private key
   */
  private derivePublicKey(privateKey: string): string {
    const privateKeyBytes = Buffer.from(privateKey.slice(2), 'hex');
    const publicKeyBytes = secp256k1.publicKeyCreate(privateKeyBytes, false);
    return '0x' + Buffer.from(publicKeyBytes).toString('hex');
  }

  /**
   * Derive viewing private key (for scanning)
   */
  private deriveViewingKey(masterPrivateKey: string): string {
    const data = masterPrivateKey + '01'; // Append derivation path
    return keccak256(Buffer.from(data.slice(2), 'hex'));
  }

  /**
   * Derive spending private key (for spending)
   */
  private deriveSpendingKey(masterPrivateKey: string): string {
    const data = masterPrivateKey + '02'; // Append derivation path
    return keccak256(Buffer.from(data.slice(2), 'hex'));
  }

  /**
   * Generate stealth address that you can control with your parent domain keys
   */
  private generateStealthKeyPair(txData: TransactionData): StealthKeyPair {
    // Generate ephemeral private key
    const ephemeralPrivateKey = '0x' + randomBytes(32).toString('hex');
    const ephemeralPublicKey = this.derivePublicKey(ephemeralPrivateKey);
    
    // Compute shared secret using ECDH
    const sharedSecret = this.computeSharedSecret(
      ephemeralPrivateKey,
      this.derivePublicKey(this.spendingPrivateKey)
    );
    
    // Derive stealth private key
    const stealthPrivateKey = this.deriveStealthPrivateKey(
      this.spendingPrivateKey,
      sharedSecret,
      txData
    );
    
    // Derive stealth address
    const stealthAddress = this.deriveAddressFromPrivateKey(stealthPrivateKey);
    
    return {
      stealthAddress,
      stealthPrivateKey,
      ephemeralPublicKey,
      sharedSecret
    };
  }

  /**
   * Compute ECDH shared secret
   */
  private computeSharedSecret(privateKey: string, publicKey: string): string {
    const privateKeyBytes = Buffer.from(privateKey.slice(2), 'hex');
    const publicKeyBytes = Buffer.from(publicKey.slice(2), 'hex');
    
    // Perform ECDH
    const sharedPoint = secp256k1.publicKeyTweakMul(publicKeyBytes, privateKeyBytes);
    return '0x' + Buffer.from(sharedPoint.slice(1, 33)).toString('hex'); // Use x-coordinate
  }

  /**
   * Derive stealth private key that you can use to spend funds
   */
  private deriveStealthPrivateKey(
    spendingPrivateKey: string,
    sharedSecret: string,
    txData: TransactionData
  ): string {
    // Create deterministic hash from transaction data
    const txDataHash = keccak256(toUtf8Bytes(
      `${txData.txHash}${txData.timestamp}${txData.buyer}`
    ));
    
    // Combine spending key, shared secret, and tx data
    const combinedData = spendingPrivateKey + sharedSecret.slice(2) + txDataHash.slice(2);
    const derivedKey = keccak256(Buffer.from(combinedData.slice(2), 'hex'));
    
    return derivedKey;
  }

  /**
   * Derive Ethereum address from private key
   */
  private deriveAddressFromPrivateKey(privateKey: string): string {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  }

  /**
   * Generate stealth address and create corresponding ENS subdomain
   */
  async generateStealthAddressWithSubdomain(
    transactionData: TransactionData
  ): Promise<SubdomainMapping> {
    try {
      // Generate stealth key pair that you control
      const stealthKeys = this.generateStealthKeyPair(transactionData);
      
      // Create unique subdomain name
      const subdomainName = this.generateSubdomainName(transactionData);
      const fullSubdomain = `${subdomainName}.${this.parentDomain}`;
      
      // Calculate hashes for tracking
      const parentHash = namehash(this.parentDomain);
      const subHash = namehash(fullSubdomain);
      
      // Create subdomain and set stealth address
      await this.createSubdomain(subdomainName, stealthKeys.stealthAddress);
      
      const mapping: SubdomainMapping = {
        subdomain: fullSubdomain,
        stealthAddress: stealthKeys.stealthAddress,
        stealthPrivateKey: stealthKeys.stealthPrivateKey,
        ephemeralPublicKey: stealthKeys.ephemeralPublicKey,
        sharedSecret: stealthKeys.sharedSecret,
        txHash: transactionData.txHash,
        parentHash,
        subHash,
        timestamp: transactionData.timestamp
      };
      
      // Store mapping
      this.subdomainMappings.set(fullSubdomain, mapping);
      
      return mapping;
    } catch (error) {
      console.error('Error generating stealth address with subdomain:', error);
      throw error;
    }
  }

  /**
   * Create wallet instance for stealth address (for fund access)
   */
  createStealthWallet(mapping: SubdomainMapping): ethers.Wallet {
    return new ethers.Wallet(mapping.stealthPrivateKey, this.provider);
  }

  /**
   * Transfer funds from stealth address back to parent domain owner
   */
  async withdrawFromStealthAddress(
    mapping: SubdomainMapping,
    recipient?: string
  ): Promise<ethers.ContractTransaction> {
    const stealthWallet = this.createStealthWallet(mapping);
    const recipientAddress = recipient || await this.signer.getAddress();
    
    // Get balance
    const balance = await stealthWallet.getBalance();
    
    // Estimate gas
    const gasPrice = await this.provider.getGasPrice();
    const gasLimit = 21000; // Standard transfer
    const gasCost = gasPrice.mul(gasLimit);
    
    if (balance.lte(gasCost)) {
      throw new Error('Insufficient balance to cover gas costs');
    }
    
    // Transfer remaining balance
    const transferAmount = balance.sub(gasCost);
    
    return stealthWallet.sendTransaction({
      to: recipientAddress,
      value: transferAmount,
      gasLimit,
      gasPrice
    });
  }

  /**
   * Transfer funds from parent domain to stealth address
   */
  async depositToStealthAddress(
    mapping: SubdomainMapping,
    amount: ethers.BigNumberish
  ): Promise<ethers.ContractTransaction> {
    return this.signer.sendTransaction({
      to: mapping.stealthAddress,
      value: amount
    });
  }

  /**
   * Get balance of stealth address
   */
  async getStealthBalance(mapping: SubdomainMapping): Promise<ethers.BigNumber> {
    return this.provider.getBalance(mapping.stealthAddress);
  }

  /**
   * Get balance of all stealth addresses
   */
  async getAllStealthBalances(): Promise<Map<string, ethers.BigNumber>> {
    const balances = new Map<string, ethers.BigNumber>();
    
    for (const [subdomain, mapping] of this.subdomainMappings.entries()) {
      const balance = await this.getStealthBalance(mapping);
      balances.set(subdomain, balance);
    }
    
    return balances;
  }

  /**
   * Batch withdraw from all stealth addresses
   */
  async withdrawFromAllStealthAddresses(recipient?: string): Promise<ethers.ContractTransaction[]> {
    const transactions: ethers.ContractTransaction[] = [];
    
    for (const mapping of this.subdomainMappings.values()) {
      try {
        const balance = await this.getStealthBalance(mapping);
        if (balance.gt(0)) {
          const tx = await this.withdrawFromStealthAddress(mapping, recipient);
          transactions.push(tx);
          
          // Add delay to avoid nonce issues
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Failed to withdraw from ${mapping.subdomain}:`, error);
      }
    }
    
    return transactions;
  }

  /**
   * Generate a unique subdomain name based on transaction data
   */
  private generateSubdomainName(transactionData: TransactionData): string {
    const data = `${transactionData.txHash}-${transactionData.timestamp}`;
    const hash = keccak256(toUtf8Bytes(data));
    return `tx-${hash.slice(2, 10)}`;
  }

  /**
   * Create a subdomain and set its address resolver
   */
  private async createSubdomain(
    subdomainName: string,
    stealthAddress: string
  ): Promise<void> {
    try {
      const parentNode = namehash(this.parentDomain);
      const labelHash = keccak256(toUtf8Bytes(subdomainName));
      
      const ensRegistry = new ethers.Contract(
        this.getENSAddress(),
        [
          'function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external',
          'function owner(bytes32 node) external view returns (address)',
          'function resolver(bytes32 node) external view returns (address)'
        ],
        this.signer
      );
      
      const publicResolverAddress = await this.getPublicResolverAddress();
      
      const tx = await ensRegistry.setSubnodeRecord(
        parentNode,
        labelHash,
        await this.signer.getAddress(),
        publicResolverAddress,
        3600
      );
      
      await tx.wait();
      
      await this.setSubdomainAddress(
        `${subdomainName}.${this.parentDomain}`,
        stealthAddress
      );
      
    } catch (error) {
      console.error('Error creating subdomain:', error);
      throw error;
    }
  }

  /**
   * Set address record for a subdomain
   */
  private async setSubdomainAddress(
    subdomain: string,
    address: string
  ): Promise<void> {
    try {
      const resolverAddress = await this.getPublicResolverAddress();
      const resolver = new ethers.Contract(
        resolverAddress,
        [
          'function setAddr(bytes32 node, address addr) external',
          'function addr(bytes32 node) external view returns (address)'
        ],
        this.signer
      );
      
      const node = namehash(subdomain);
      const tx = await resolver.setAddr(node, address);
      await tx.wait();
      
    } catch (error) {
      console.error('Error setting subdomain address:', error);
      throw error;
    }
  }

  private async getPublicResolverAddress(): Promise<string> {
    const network = await this.provider.getNetwork();
    switch (network.chainId) {
      case 1:
        return '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63';
      case 5:
        return '0x19c2d5D0f035563344dBB7bE5fD09c8dad62b001';
      case 11155111:
        return '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD';
      default:
        throw new Error(`No public resolver for network ${network.chainId}`);
    }
  }

  // ... (keeping existing utility methods)
  computeParentFromSubhash(subHash: string): string {
    for (const [subdomain, mapping] of this.subdomainMappings.entries()) {
      if (mapping.subHash === subHash) {
        return mapping.parentHash;
      }
    }
    return namehash(this.parentDomain);
  }

  getAllSubdomains(): SubdomainMapping[] {
    return Array.from(this.subdomainMappings.values());
  }

  getSubdomainByTxHash(txHash: string): SubdomainMapping | undefined {
    for (const mapping of this.subdomainMappings.values()) {
      if (mapping.txHash === txHash) {
        return mapping;
      }
    }
    return undefined;
  }

  async handleTransaction(transactionData: TransactionData): Promise<SubdomainMapping> {
    console.log(`Processing transaction: ${transactionData.txHash}`);
    const mapping = await this.generateStealthAddressWithSubdomain(transactionData);
    console.log(`Created subdomain: ${mapping.subdomain}`);
    console.log(`Stealth address: ${mapping.stealthAddress}`);
    console.log(`You control this address via derived private key`);
    return mapping;
  }

  /**
   * Export master public key for buyers to generate stealth addresses
   */
  getMasterPublicKey(): string {
    return this.masterPublicKey;
  }

  /**
   * Get spending public key for stealth address generation
   */
  getSpendingPublicKey(): string {
    return this.derivePublicKey(this.spendingPrivateKey);
  }

  saveMappings(): string {
    const mappingsData = {
      parentDomain: this.parentDomain,
      masterPublicKey: this.masterPublicKey,
      mappings: Array.from(this.subdomainMappings.entries())
    };
    return JSON.stringify(mappingsData, null, 2);
  }

  loadMappings(data: string): void {
    try {
      const parsedData = JSON.parse(data);
      this.subdomainMappings.clear();
      for (const [subdomain, mapping] of parsedData.mappings) {
        this.subdomainMappings.set(subdomain, mapping);
      }
    } catch (error) {
      console.error('Error loading mappings:', error);
      throw error;
    }
  }
}

// Example usage with fund management
export async function example() {
  const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
  const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);
  const parentDomain = 'yourdapp.eth';
  
  const manager = new ENSStealthManager(provider, wallet, parentDomain);
  
  // Handle new transaction
  const transactionData: TransactionData = {
    txHash: '0x1234567890abcdef...',
    amount: '1.5',
    timestamp: Date.now(),
    buyer: '0xbuyer_address...'
  };
  
  const mapping = await manager.handleTransaction(transactionData);
  
  // Check balance
  const balance = await manager.getStealthBalance(mapping);
  console.log(`Stealth address balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Withdraw funds back to parent domain owner
  if (balance.gt(0)) {
    const withdrawTx = await manager.withdrawFromStealthAddress(mapping);
    console.log(`Withdrawal transaction: ${withdrawTx.hash}`);
  }
  
  // Or withdraw from all stealth addresses at once
  const allWithdrawals = await manager.withdrawFromAllStealthAddresses();
  console.log(`Withdrew from ${allWithdrawals.length} stealth addresses`);
}

export type { TransactionData, SubdomainMapping, StealthKeyPair };
