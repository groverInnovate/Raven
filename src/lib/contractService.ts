/**
 * Smart Contract Integration Service
 * Handles all interactions with the StealthEscrow contract
 */

import { ethers } from "ethers";

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
  "function getTotalDeals() public view returns (uint256)",
];

// Mock PYUSD ABI
export const PYUSD_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function mint(address to, uint256 amount) public", // For testing only
];

// Contract addresses (deployed to Sepolia testnet)
export const CONTRACT_ADDRESSES = {
  STEALTH_ESCROW:
    process.env.NEXT_PUBLIC_ESCROW_CONTRACT ||
    "0xcB7e4aB7f2efe02caf21b5a8634b5DC597663471",
  PYUSD_TOKEN:
    process.env.NEXT_PUBLIC_PYUSD_CONTRACT ||
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9", // Correct Sepolia PYUSD address
};

export enum DealStatus {
  CREATED = 0,
  LOCKED = 1,
  DISPUTE_INITIATED = 2,
  COMPLETED = 3,
  REFUNDED = 4,
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
  public provider: ethers.Provider;
  private signer: ethers.Signer;
  public escrowContract: ethers.Contract;
  public pyusdContract: ethers.Contract;

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;

    console.log("🏗️ Initializing contracts with addresses:");
    console.log("Escrow Contract:", CONTRACT_ADDRESSES.STEALTH_ESCROW);
    console.log("PYUSD Contract:", CONTRACT_ADDRESSES.PYUSD_TOKEN);

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
   * Get PYUSD balance for an address
   */
  async getPYUSDBalance(address: string): Promise<string> {
    try {
      const balance = await this.pyusdContract.balanceOf(address);
      const decimals = await this.pyusdContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting PYUSD balance:", error);
      return "0";
    }
  }

  /**
   * Check if contracts are deployed and accessible
   */
  async checkContractDeployment(): Promise<{
    escrow: boolean;
    pyusd: boolean;
  }> {
    try {
      console.log("🔍 Checking contract deployment...");

      // Check escrow contract
      const escrowCode = await this.provider.getCode(
        CONTRACT_ADDRESSES.STEALTH_ESCROW
      );
      const escrowDeployed = escrowCode !== "0x";
      console.log("Escrow contract deployed:", escrowDeployed);

      // Check PYUSD contract
      const pyusdCode = await this.provider.getCode(
        CONTRACT_ADDRESSES.PYUSD_TOKEN
      );
      const pyusdDeployed = pyusdCode !== "0x";
      console.log("PYUSD contract deployed:", pyusdDeployed);

      return { escrow: escrowDeployed, pyusd: pyusdDeployed };
    } catch (error) {
      console.error("Error checking contract deployment:", error);
      return { escrow: false, pyusd: false };
    }
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
      console.log("Creating escrow deal:", {
        stealthAddress,
        priceInPYUSD,
        itemTitle,
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
          return parsed?.name === "DealCreated";
        } catch {
          return false;
        }
      });

      let dealId = 0;
      if (dealCreatedEvent) {
        const parsed = this.escrowContract.interface.parseLog(dealCreatedEvent);
        dealId = Number(parsed?.args.dealId);
      }

      console.log("Escrow created:", { dealId, txHash: tx.hash });
      return { dealId, txHash: tx.hash };
    } catch (error: any) {
      console.error("Error creating escrow:", error);

      // Extract more specific error information
      let errorMessage = "Failed to create escrow deal";

      if (error.reason) {
        errorMessage += `: ${error.reason}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      console.error("Detailed error:", errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Fund an escrow deal
   */
  async fundEscrow(dealId: number): Promise<string> {
    try {
      console.log("💰 Funding escrow deal:", dealId);

      // Get deal details to know the price
      const deal = await this.getDeal(dealId);
      const priceWei = ethers.parseUnits(deal.price, 6);
      console.log(
        "💵 Required amount:",
        ethers.formatUnits(priceWei, 6),
        "PYUSD"
      );

      // Check current allowance
      const currentAllowance = await this.pyusdContract.allowance(
        await this.signer.getAddress(),
        CONTRACT_ADDRESSES.STEALTH_ESCROW
      );
      console.log(
        "🔍 Current allowance:",
        ethers.formatUnits(currentAllowance, 6),
        "PYUSD"
      );

      // Approve PYUSD spending if needed
      if (currentAllowance < priceWei) {
        console.log("📝 Approving PYUSD spending...");
        const approveTx = await this.pyusdContract.approve(
          CONTRACT_ADDRESSES.STEALTH_ESCROW,
          priceWei
        );
        console.log("⏳ Waiting for approval transaction...");
        await approveTx.wait();
        console.log("✅ PYUSD approval confirmed");
      } else {
        console.log("✅ Sufficient allowance already exists");
      }

      // Double-check balance before funding
      const userAddress = await this.signer.getAddress();
      const currentBalance = await this.pyusdContract.balanceOf(userAddress);
      console.log(
        "💰 User PYUSD balance:",
        ethers.formatUnits(currentBalance, 6)
      );

      if (currentBalance < priceWei) {
        throw new Error(
          `Insufficient PYUSD balance. Need: ${ethers.formatUnits(
            priceWei,
            6
          )}, Have: ${ethers.formatUnits(currentBalance, 6)}`
        );
      }

      // Then fund the escrow
      console.log("💸 Calling fundEscrow on contract...");
      console.log("📋 Deal ID:", dealId);
      console.log("👤 Buyer address:", userAddress);

      const tx = await this.escrowContract.fundEscrow(dealId);
      console.log("⏳ Waiting for funding transaction...");
      await tx.wait();

      console.log("🎉 Escrow funded successfully:", tx.hash);
      return tx.hash;
    } catch (error: any) {
      console.error("❌ Error funding escrow:", error);

      // More detailed error handling
      let errorMessage = "Failed to fund escrow deal";
      if (error.reason) {
        errorMessage += `: ${error.reason}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }

      throw new Error(errorMessage);
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
      console.error("Error getting message:", error);
      throw new Error("Failed to get deal message");
    }
  }

  /**
   * Confirm receipt and release funds to stealth address
   */
  async confirmAndReleaseFunds(dealId: number): Promise<string> {
    try {
      console.log("Confirming and releasing funds for deal:", dealId);

      const tx = await this.escrowContract.confirmAndReleaseFunds(dealId);
      await tx.wait();

      console.log("Funds released to stealth address:", tx.hash);
      return tx.hash;
    } catch (error) {
      console.error("Error confirming and releasing funds:", error);
      throw new Error("Failed to release funds");
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
      console.error("Error requesting refund:", error);
      throw new Error("Failed to request refund");
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
        itemDescription: deal.itemDescription,
      };
    } catch (error) {
      console.error("Error getting deal:", error);
      throw new Error("Failed to get deal details");
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
      console.error("Error getting seller deals:", error);
      throw new Error("Failed to get seller deals");
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
      console.error("Error getting buyer deals:", error);
      throw new Error("Failed to get buyer deals");
    }
  }

  /**
   * Create a contract service instance with fallback RPC
   */
  static async createWithFallback(
    providedSigner?: ethers.Signer
  ): Promise<ContractService> {
    let provider: ethers.Provider;
    let finalSigner: ethers.Signer;

    if (providedSigner && providedSigner.provider) {
      provider = providedSigner.provider;
      finalSigner = providedSigner;
    } else if (typeof window !== "undefined" && (window as any).ethereum) {
      const browserProvider = new ethers.BrowserProvider(
        (window as any).ethereum
      );
      provider = browserProvider;
      finalSigner = await browserProvider.getSigner();
    } else {
      // Fallback to Infura RPC
      provider = new ethers.JsonRpcProvider(
        "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
      );
      // Create a random wallet for read-only operations
      finalSigner = new ethers.Wallet(
        ethers.Wallet.createRandom().privateKey,
        provider
      );
    }

    return new ContractService(provider, finalSigner);
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
      console.error("Error minting PYUSD:", error);
      throw new Error("Failed to mint PYUSD (only available in test mode)");
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
      return "Awaiting Payment";
    case DealStatus.LOCKED:
      return "Payment Locked";
    case DealStatus.DISPUTE_INITIATED:
      return "Dispute Active";
    case DealStatus.COMPLETED:
      return "Completed";
    case DealStatus.REFUNDED:
      return "Refunded";
    default:
      return "Unknown";
  }
}

/**
 * Get deal status color for UI
 */
export function getDealStatusColor(status: DealStatus): string {
  switch (status) {
    case DealStatus.CREATED:
      return "yellow";
    case DealStatus.LOCKED:
      return "blue";
    case DealStatus.DISPUTE_INITIATED:
      return "red";
    case DealStatus.COMPLETED:
      return "green";
    case DealStatus.REFUNDED:
      return "gray";
    default:
      return "gray";
  }
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
