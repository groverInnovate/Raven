// Nullifier Mapping Service for Pinata IPFS
// Maintains a single JSON object with nullifier as key and verification data as value

interface NullifierMapping {
  [nullifier: string]: {
    verificationData: any;
    userAddress: string;
    timestamp: string;
    documentType: number;
  };
}

class NullifierMappingService {
  private readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
  private readonly MAPPING_NAME = 'GhostPalace-Nullifier-Mapping';
  private currentMappingHash: string | null = null;

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (process.env.NEXT_PUBLIC_PINATA_JWT) {
      headers['Authorization'] = `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`;
    } else if (process.env.NEXT_PUBLIC_PINATA_API) {
      headers['pinata_api_key'] = process.env.NEXT_PUBLIC_PINATA_API;
      if (process.env.NEXT_PUBLIC_PINATA_SECRET) {
        headers['pinata_secret_api_key'] = process.env.NEXT_PUBLIC_PINATA_SECRET;
      }
    }

    return headers;
  }

  // Get the current mapping from Pinata
  async getCurrentMapping(): Promise<NullifierMapping> {
    try {
      console.log('📥 Fetching current nullifier mapping from Pinata...');
      
      // Search for the mapping file
      const response = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&metadata[name]=${this.MAPPING_NAME}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.rows.length === 0) {
        console.log('📝 No existing mapping found, creating new one');
        return {};
      }

      // Get the latest mapping (most recent)
      const latestPin = data.rows[0];
      this.currentMappingHash = latestPin.ipfs_pin_hash;
      
      // Fetch the actual mapping data
      const mappingResponse = await fetch(`${this.PINATA_GATEWAY}${latestPin.ipfs_pin_hash}`);
      
      if (!mappingResponse.ok) {
        throw new Error(`IPFS fetch error: ${mappingResponse.status}`);
      }
      
      const mapping = await mappingResponse.json();
      console.log(`✅ Retrieved mapping with ${Object.keys(mapping).length} entries`);
      
      return mapping;
    } catch (error) {
      console.error('❌ Error fetching current mapping:', error);
      return {};
    }
  }

  // Update the mapping with new nullifier data
  async updateMapping(nullifier: string, userData: {
    verificationData: any;
    userAddress: string;
    documentType: number;
  }, options: { skipIfExists?: boolean } = {}): Promise<{ success: boolean; ipfsHash?: string; error?: string; skipped?: boolean }> {
    try {
      console.log(`📝 Updating mapping for nullifier: ${nullifier}`);
      
      // Get current mapping
      const currentMapping = await this.getCurrentMapping();
      
      // Check if nullifier already exists and skip if requested
      if (options.skipIfExists && currentMapping[nullifier]) {
        console.log(`⏭️ Nullifier ${nullifier} already exists, skipping update`);
        return {
          success: true,
          skipped: true,
          ipfsHash: this.currentMappingHash || undefined
        };
      }
      
      // Add/update the nullifier entry
      currentMapping[nullifier] = {
        ...userData,
        timestamp: new Date().toISOString()
      };

      console.log(`📊 Mapping now contains ${Object.keys(currentMapping).length} entries`);
      
      // Upload updated mapping to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          pinataContent: currentMapping,
          pinataMetadata: {
            name: this.MAPPING_NAME,
            keyvalues: {
              type: 'nullifier_mapping',
              totalEntries: Object.keys(currentMapping).length.toString(),
              lastUpdated: new Date().toISOString(),
              version: Date.now().toString()
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const result = await response.json();
      const newHash = result.IpfsHash;
      
      console.log(`✅ Mapping updated successfully: ${newHash}`);
      console.log(`🔗 IPFS Link: ${this.PINATA_GATEWAY}${newHash}`);
      
      // Unpin the old mapping to save space (optional)
      if (this.currentMappingHash && this.currentMappingHash !== newHash) {
        try {
          await fetch(`https://api.pinata.cloud/pinning/unpin/${this.currentMappingHash}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          console.log(`🗑️ Unpinned old mapping: ${this.currentMappingHash}`);
        } catch (error) {
          console.warn('⚠️ Failed to unpin old mapping:', error);
        }
      }
      
      this.currentMappingHash = newHash;
      
      return {
        success: true,
        ipfsHash: newHash
      };
    } catch (error) {
      console.error('❌ Error updating mapping:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get data for a specific nullifier
  async getNullifierData(nullifier: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log(`🔍 Looking up nullifier: ${nullifier}`);
      
      const mapping = await this.getCurrentMapping();
      
      if (mapping[nullifier]) {
        console.log(`✅ Found data for nullifier: ${nullifier}`);
        return {
          success: true,
          data: mapping[nullifier]
        };
      } else {
        console.log(`❌ No data found for nullifier: ${nullifier}`);
        return {
          success: false,
          error: 'Nullifier not found in mapping'
        };
      }
    } catch (error) {
      console.error('❌ Error looking up nullifier:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get the current mapping IPFS hash
  getCurrentMappingHash(): string | null {
    return this.currentMappingHash;
  }

  // Get direct IPFS link to the mapping
  getMappingLink(): string | null {
    if (this.currentMappingHash) {
      return `${this.PINATA_GATEWAY}${this.currentMappingHash}`;
    }
    return null;
  }
}

// Export singleton instance
export const nullifierMappingService = new NullifierMappingService();
export default nullifierMappingService;
