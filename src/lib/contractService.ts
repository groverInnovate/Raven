/**
 * Smart Contract Integration Service
 * Handles all interactions with the StealthEscrow contract
 */

import { ethers } from 'ethers';

// Contract ABI (simplified for the functions we need)
export const STEALTH_ESCROW_ABI = [
  // Events
  "event DealCreated(uint256 indexed dealId, address indexed seller, address indexed stealthAddress, uint256 price, string itemTitle)",
  "event EscrowFunded(uint256 indexed dealId, address indexed buyer, uint256 buyerDeadline)",
  "event DealCompleted(uint256 indexed dealId, address indexed stealthAddress, uint256 amount)",
  "event DealRefunded(uint256 indexed dealId)",
  
  // Functions
  "function createEscrow(address stealthAddress, uint256 price, string memory message, string memory itemTitle, string memory itemDescription) public returns (uint256)",
  "function fundEscrow(uint256 dealId) public",
  "function confirmAndReleaseFunds(uint256 dealId) public",
  "function requestRefund(uint256 dealId) public",
  "function claimRefundAfterDeadline(uint256 dealId) public",
  "function getMessage(uint256 dealId) public view returns (string memory)",
  "function getDeal(uint256 dealId) public view returns (tuple(uint256 dealId, address buyer, address seller, address stealthAddress, uint256 price, string message, uint8 status, uint256 sellerResponseDeadline, uint256 buyerResponseDeadline, string itemTitle, string itemDescription))",
  "function getSellerDeals(address seller) public view returns (uint256[] memory)",
  "function getBuyerDeals(address buyer) public view returns (uint256[] memory)",
  "function getTotalDeals() public view returns (uint256)"
];

// Mock PYUSD ABI
export const PYUSD_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function mint(address to, uint256 amount) public" // For testing only
];

// Contract addresses (will be set after deployment)
export const CONTRACT_ADDRESSES = {
  STEALTH_ESCROW: process.env.NEXT_PUBLIC_ESCROW_CONTRACT || '0x0000000000000000000000000000000000000000',
  PYUSD_TOKEN: process.env.NEXT_PUBLIC_PYUSD_CONTRACT || '0x0000000000000000000000000000000000000000'
};

export enum DealStatus {
  CREATED = 0,
  LOCKED = 1,
  DISPUTE_INITIATED = 2,
  COMPLETED = 3,
  REFUNDED = 4
}

export interface EscrowDeal {
  dealId: number;
  buyer: string;
  seller: string;
  stealthAddress: string;
  price: string;
  message: string;
  status: DealStatus;
  sellerResponseDeadline: number;
  buyerResponseDeadline: number;
  itemTitle: string;
  itemDescription: string;
}

export class ContractService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private escrowContract: ethers.Contract;
  private pyusdContract: ethers.Contract;

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    
    this.escrowContract = new ethers.Contract(
      CONTRACT_ADDRESSES.STEALTH_ESCROW,
      STEALTH_ESCROW_ABI,
      signer
    );
    
    this.pyusdContract = new ethers.Contract(
      CONTRACT_ADDRESSES.PYUSD_TOKEN,
      PYUSD_ABI,
      signer
    );
  }

  /**
   * Create a new escrow deal
   */
  async createEscrow(
    stealthAddress: string,
    priceInPYUSD: string,
    apiKey: string,
    itemTitle: string,
    itemDescription: string
  ): Promise<{ dealId: number; txHash: string }> {
    try {
      console.log('Creating escrow deal:', {
        stealthAddress,
        priceInPYUSD,
        itemTitle
      });

      // Convert price to PYUSD units (6 decimals)
      const priceWei = ethers.parseUnits(priceInPYUSD, 6);

      const tx = await this.escrowContract.createEscrow(
        stealthAddress,
        priceWei,
        apiKey,
        itemTitle,
        itemDescription
      );

      const receipt = await tx.wait();
      
      // Extract deal ID from events
      const dealCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = this.escrowContract.interface.parseLog(log);
          return parsed?.name === 'DealCreated';
        } catch {
          return false;
        }
      });

      let dealId = 0;
      if (dealCreatedEvent) {
        const parsed = this.escrowContract.interface.parseLog(dealCreatedEvent);
        dealId = Number(parsed?.args.dealId);
      }

      console.log('Escrow created:', { dealId, txHash: tx.hash });
      return { dealId, txHash: tx.hash };
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw new Error('Failed to create escrow deal');
    }
  }

  /**
   * Fund an escrow deal
   */
  async fundEscrow(dealId: number): Promise<string> {
    try {
      console.log('Funding escrow deal:', dealId);

      // Get deal details to know the price
      const deal = await this.getDeal(dealId);
      const priceWei = ethers.parseUnits(deal.price, 6);

      // First approve PYUSD spending
      console.log('Approving PYUSD spending...');
      const approveTx = await this.pyusdContract.approve(
        CONTRACT_ADDRESSES.STEALTH_ESCROW,
        priceWei
      );
      await approveTx.wait();

      // Then fund the escrow
      console.log('Funding escrow...');
      const tx = await this.escrowContract.fundEscrow(dealId);
      const receipt = await tx.wait();

      console.log('Escrow funded:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error funding escrow:', error);
      throw new Error('Failed to fund escrow deal');
    }
  }

  /**
   * Get the API key/message from a deal (buyer only)
   */
  async getMessage(dealId: number): Promise<string> {
    try {
      const message = await this.escrowContract.getMessage(dealId);
      return message;
    } catch (error) {
      console.error('Error getting message:', error);
      throw new Error('Failed to get deal message');
    }
  }

  /**
   * Confirm receipt and release funds to stealth address
   */
  async confirmAndReleaseFunds(dealId: number): Promise<string> {
    try {
      console.log('Confirming and releasing funds for deal:', dealId);

      const tx = await this.escrowContract.confirmAndReleaseFunds(dealId);
      const receipt = await tx.wait();

      console.log('Funds released to stealth address:', tx.hash);
      return tx.hash;
    } catch (error) {
      console.error('Error confirming and releasing funds:', error);
      throw new Error('Failed to release funds');
    }
  }

  /**
   * Request a refund
   */
  async requestRefund(dealId: number): Promise<string> {
    try {
      const tx = await this.escrowContract.requestRefund(dealId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw new Error('Failed to request refund');
    }
  }

  /**
   * Get deal details
   */
  async getDeal(dealId: number): Promise<EscrowDeal> {
    try {
      const deal = await this.escrowContract.getDeal(dealId);
      
      return {
        dealId: Number(deal.dealId),
        buyer: deal.buyer,
        seller: deal.seller,
        stealthAddress: deal.stealthAddress,
        price: ethers.formatUnits(deal.price, 6), // Convert from wei to PYUSD
        message: deal.message,
        status: Number(deal.status) as DealStatus,
        sellerResponseDeadline: Number(deal.sellerResponseDeadline),
        buyerResponseDeadline: Number(deal.buyerResponseDeadline),
        itemTitle: deal.itemTitle,
        itemDescription: deal.itemDescription
      };
    } catch (error) {
      console.error('Error getting deal:', error);
      throw new Error('Failed to get deal details');
    }
  }

  /**
   * Get all deals for a seller
   */
  async getSellerDeals(sellerAddress: string): Promise<EscrowDeal[]> {
    try {
      const dealIds = await this.escrowContract.getSellerDeals(sellerAddress);
      const deals: EscrowDeal[] = [];

      for (const dealId of dealIds) {
        try {
          const deal = await this.getDeal(Number(dealId));
          deals.push(deal);
        } catch (error) {
          console.warn(`Failed to get deal ${dealId}:`, error);
        }
      }

      return deals;
    } catch (error) {
      console.error('Error getting seller deals:', error);
      throw new Error('Failed to get seller deals');
    }
  }

  /**
   * Get all deals for a buyer
   */
  async getBuyerDeals(buyerAddress: string): Promise<EscrowDeal[]> {
    try {
      const dealIds = await this.escrowContract.getBuyerDeals(buyerAddress);
      const deals: EscrowDeal[] = [];

      for (const dealId of dealIds) {
        try {
          const deal = await this.getDeal(Number(dealId));
          deals.push(deal);
        } catch (error) {
          console.warn(`Failed to get deal ${dealId}:`, error);
        }
      }

      return deals;
    } catch (error) {
      console.error('Error getting buyer deals:', error);
      throw new Error('Failed to get buyer deals');
    }
  }

  /**
   * Get PYUSD balance
   */
  async getPYUSDBalance(address: string): Promise<string> {
    try {
      const balance = await this.pyusdContract.balanceOf(address);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('Error getting PYUSD balance:', error);
      return '0';
    }
  }

  /**
   * Mint PYUSD for testing (only works with mock contract)
   */
  async mintPYUSD(address: string, amount: string): Promise<string> {
    try {
      const amountWei = ethers.parseUnits(amount, 6);
      const tx = await this.pyusdContract.mint(address, amountWei);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Error minting PYUSD:', error);
      throw new Error('Failed to mint PYUSD (only available in test mode)');
    }
  }

  /**
   * Get contract addresses
   */
  static getContractAddresses() {
    return CONTRACT_ADDRESSES;
  }

  /**
   * Update contract addresses (for after deployment)
   */
  static updateContractAddresses(escrowAddress: string, pyusdAddress: string) {
    CONTRACT_ADDRESSES.STEALTH_ESCROW = escrowAddress;
    CONTRACT_ADDRESSES.PYUSD_TOKEN = pyusdAddress;
  }
}

/**
 * Get deal status as human-readable string
 */
export function getDealStatusString(status: DealStatus): string {
  switch (status) {
    case DealStatus.CREATED:
      return 'Awaiting Payment';
    case DealStatus.LOCKED:
      return 'Payment Locked';
    case DealStatus.DISPUTE_INITIATED:
      return 'Dispute Active';
    case DealStatus.COMPLETED:
      return 'Completed';
    case DealStatus.REFUNDED:
      return 'Refunded';
    default:
      return 'Unknown';
  }
}

/**
 * Get deal status color for UI
 */
export function getDealStatusColor(status: DealStatus): string {
  switch (status) {
    case DealStatus.CREATED:
      return 'yellow';
    case DealStatus.LOCKED:
      return 'blue';
    case DealStatus.DISPUTE_INITIATED:
      return 'red';
    case DealStatus.COMPLETED:
      return 'green';
    case DealStatus.REFUNDED:
      return 'gray';
    default:
      return 'gray';
  }
}