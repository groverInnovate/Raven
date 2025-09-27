import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";

// Reuse a single verifier instance
const selfBackendVerifier = new SelfBackendVerifier(
  "aadhaar-shield-marketplace", // scope - matches frontend
  "http://localhost:3000/api/verify", // endpoint - matches frontend
  true, // mockPassport: true for staging/testnet
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [], // Allow all countries for now
  }),
  "hex" // userIdentifierType - matches frontend userId type
);

export async function POST(req: Request) {
  try {
    console.log("Verification request received");
    
    // Extract data from the request
    const { attestationId, proof, publicSignals, userContextData } = await req.json();
    
    console.log("Verification data:", {
      attestationId,
      hasProof: !!proof,
      hasPublicSignals: !!publicSignals,
      userContextData
    });

    // Verify all required fields are present
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          message: "Proof, publicSignals, attestationId and userContextData are required",
          status: "error",
          result: false,
          error_code: "MISSING_FIELDS"
        },
        { status: 400 }
      );
    }

    // Verify the proof
    console.log("Starting verification...");
    const result = await selfBackendVerifier.verify(
      attestationId, // Document type (3 = Aadhaar for Indian users)
      proof, // The zero-knowledge proof
      publicSignals, // Public signals array
      userContextData // User context data (hex string)
    );

    console.log("Verification result:", result);

    // Check if verification was successful
    if (result.isValidDetails.isValid) {
      // Verification successful - extract identity commitment
      const identityCommitment = (result.discloseOutput as any)?.identityCommitment || 
                                 (result.discloseOutput as any)?.identity_commitment ||
                                 `identity_${Date.now()}`;
      
      console.log("Verification successful! Identity commitment:", identityCommitment);
      console.log("Full disclose output:", result.discloseOutput);
      
      return NextResponse.json({
        status: "success",
        result: true,
        identityCommitment,
        credentialSubject: result.discloseOutput,
        verificationData: {
          verified: true,
          timestamp: new Date().toISOString(),
          documentType: attestationId,
        }
      });
    } else {
      // Verification failed
      console.error("Verification failed:", result.isValidDetails);
      
      return NextResponse.json(
        {
          status: "error",
          result: false,
          reason: "Verification failed",
          error_code: "VERIFICATION_FAILED",
          details: result.isValidDetails,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verification error:", error);
    
    return NextResponse.json(
      {
        status: "error",
        result: false,
        reason: error instanceof Error ? error.message : "Unknown error",
        error_code: "UNKNOWN_ERROR"
      },
      { status: 500 }
    );
  }
}
