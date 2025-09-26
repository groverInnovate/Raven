// IPFS Service for decentralized listing storage
// Note: Using mock implementation for development. Install 'ipfs-http-client' for production use.

export interface IPFSListing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string;
  images: string[];
  seller: string;
  sellerName: string;
  location: string;
  isAdultOnly: boolean;
  isIndiaOnly: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: {
    ipfsHash: string;
    blockchainTxHash?: string;
  };
}

class IPFSService {
  private readonly IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
  private readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
  private mockStorage: Map<string, IPFSListing> = new Map();

  constructor() {
    console.log('IPFS Service initialized with mock implementation');
    // Initialize with some mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockListings = this.mockSearchListings('');
    mockListings.forEach(listing => {
      this.mockStorage.set(listing.metadata.ipfsHash, listing);
    });
  }

  async uploadListing(listing: Omit<IPFSListing, 'metadata'>): Promise<IPFSListing> {
    // Mock IPFS upload for development
    const result = this.mockUploadListing(listing);
    
    // Store in mock storage
    this.mockStorage.set(result.metadata.ipfsHash, result);
    
    console.log('Listing uploaded to mock IPFS:', result.metadata.ipfsHash);
    return result;
  }

  async getListing(ipfsHash: string): Promise<IPFSListing | null> {
    // Get from mock storage first
    const stored = this.mockStorage.get(ipfsHash);
    if (stored) {
      return stored;
    }
    
    // Return mock data for development
    return this.mockGetListing(ipfsHash);
  }

  async uploadImage(file: File): Promise<string> {
    // Mock image upload for development
    const result = this.mockUploadImage(file);
    console.log('Image uploaded to mock IPFS:', result);
    return result;
  }

  async searchListings(query: string = ''): Promise<IPFSListing[]> {
    // Get all listings from mock storage
    const allListings = Array.from(this.mockStorage.values());
    
    // Add default mock listings
    const mockListings = this.mockSearchListings(query);
    
    // Combine and deduplicate
    const combined = [...allListings, ...mockListings];
    const unique = combined.filter((listing, index, self) => 
      index === self.findIndex(l => l.id === listing.id)
    );
    
    // Filter by query if provided
    if (query) {
      return unique.filter(listing => 
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    return unique;
  }

  getIPFSUrl(hash: string): string {
    return `${this.IPFS_GATEWAY}${hash}`;
  }

  getPinataUrl(hash: string): string {
    return `${this.PINATA_GATEWAY}${hash}`;
  }

  // Mock methods for development
  private mockUploadListing(listing: Omit<IPFSListing, 'metadata'>): IPFSListing {
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      ...listing,
      updatedAt: new Date().toISOString(),
      metadata: {
        ipfsHash: mockHash,
      }
    };
  }

  private mockGetListing(ipfsHash: string): IPFSListing {
    return {
      id: Date.now().toString(),
      title: "Mock IPFS Listing",
      description: "This is a mock listing retrieved from IPFS hash: " + ipfsHash,
      price: 25000,
      currency: "INR",
      category: "Electronics",
      condition: "New",
      images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"],
      seller: "0x1234...5678",
      sellerName: "Mock Seller",
      location: "Mumbai, India",
      isAdultOnly: false,
      isIndiaOnly: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        ipfsHash,
      }
    };
  }

  private mockUploadImage(file: File): string {
    // Create a mock IPFS URL
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
    return `${this.IPFS_GATEWAY}${mockHash}`;
  }

  private mockSearchListings(query: string): IPFSListing[] {
    // Return mock listings for development
    const mockListings: IPFSListing[] = [
      {
        id: "1",
        title: "iPhone 14 Pro Max - IPFS Stored",
        description: "Brand new iPhone 14 Pro Max stored on IPFS for decentralized marketplace",
        price: 125000,
        currency: "INR",
        category: "Electronics",
        condition: "New",
        images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"],
        seller: "0x1234...5678",
        sellerName: "Tech Seller",
        location: "Mumbai, India",
        isAdultOnly: false,
        isIndiaOnly: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          ipfsHash: "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o",
        }
      },
      {
        id: "2",
        title: "MacBook Pro M2 - Decentralized Listing",
        description: "MacBook Pro with M2 chip, stored on IPFS for permanent availability",
        price: 180000,
        currency: "INR",
        category: "Electronics",
        condition: "Like New",
        images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop"],
        seller: "0x5678...9012",
        sellerName: "Apple Reseller",
        location: "Bangalore, India",
        isAdultOnly: false,
        isIndiaOnly: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          ipfsHash: "QmPChd2hVbrJ1bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF36A",
        }
      }
    ];

    if (query) {
      return mockListings.filter(listing => 
        listing.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    return mockListings;
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
export default ipfsService;
