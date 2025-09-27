import { NextResponse } from "next/server";

// Store and retrieve user verification data by nullifier
interface UserVerificationData {
  nullifier: string;
  verificationData: any;
  userAddress: string;
  timestamp: string;
  documentType: number;
}

// Helper function to get Pinata auth headers
function getPinataAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  // Prefer JWT if available, fallback to API key
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

// Store user verification data
export async function POST(
  request: Request,
  { params }: { params: { nullifier: string } }
) {
  try {
    const { nullifier } = params;
    const body = await request.json();
    
    console.log(`📝 Storing verification data for nullifier: ${nullifier}`);
    
    const userData: UserVerificationData = {
      nullifier,
      verificationData: body.verificationData,
      userAddress: body.userAddress,
      timestamp: new Date().toISOString(),
      documentType: body.documentType
    };

    // Check if we have Pinata credentials
    const hasJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    const hasAPIKey = process.env.NEXT_PUBLIC_PINATA_API;
    
    if (hasJWT || hasAPIKey) {
      // Store in Pinata IPFS using nullifier as the filename/path
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: getPinataAuthHeaders(),
        body: JSON.stringify({
          pinataContent: userData,
          pinataMetadata: {
            name: nullifier, // Use nullifier directly as the filename
            keyvalues: {
              nullifier: nullifier,
              userAddress: body.userAddress,
              type: 'user_verification',
              timestamp: userData.timestamp,
              route: `/${nullifier}` // Create a route-like reference
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ User data stored on IPFS: ${result.IpfsHash}`);
      
      return NextResponse.json({
        success: true,
        ipfsHash: result.IpfsHash,
        nullifier,
        message: "User verification data stored successfully"
      });
    } else {
      // Mock storage for development
      console.log("⚠️ Using mock storage - add Pinata credentials for real IPFS storage");
      return NextResponse.json({
        success: true,
        ipfsHash: `mock_${nullifier}`,
        nullifier,
        message: "User verification data stored in mock storage"
      });
    }
  } catch (error) {
    console.error("Error storing user verification data:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// Retrieve user verification data
export async function GET(
  request: Request,
  { params }: { params: { nullifier: string } }
) {
  try {
    const { nullifier } = params;
    console.log(`📥 Retrieving verification data for nullifier: ${nullifier}`);
    
    // Check if we have Pinata credentials
    const hasJWT = process.env.NEXT_PUBLIC_PINATA_JWT;
    const hasAPIKey = process.env.NEXT_PUBLIC_PINATA_API;
    
    if (hasJWT || hasAPIKey) {
      // Search for the user's data in Pinata
      const response = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&metadata[keyvalues][nullifier]=${nullifier}&metadata[keyvalues][type]=user_verification`, {
        headers: getPinataAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: "User verification data not found"
        }, { status: 404 });
      }

      // Get the latest entry (most recent)
      const latestPin = data.rows[0];
      
      // Fetch the actual data from IPFS
      const ipfsResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${latestPin.ipfs_pin_hash}`);
      
      if (!ipfsResponse.ok) {
        throw new Error(`IPFS fetch error: ${ipfsResponse.status}`);
      }
      
      const userData = await ipfsResponse.json();
      
      console.log(`✅ Retrieved user data for nullifier: ${nullifier}`);
      
      return NextResponse.json({
        success: true,
        userData,
        ipfsHash: latestPin.ipfs_pin_hash
      });
    } else {
      // Mock retrieval for development
      console.log("⚠️ Using mock retrieval - add Pinata credentials for real IPFS retrieval");
      return NextResponse.json({
        success: false,
        message: "Mock storage - user data not available"
      }, { status: 404 });
    }
  } catch (error) {
    console.error("Error retrieving user verification data:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
