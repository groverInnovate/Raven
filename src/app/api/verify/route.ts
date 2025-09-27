import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";

// Reuse a single verifier instance
const selfBackendVerifier = new SelfBackendVerifier(
  "aadhaar", // scope - matches frontend
  "https://af82165cc6e6.ngrok-free.app/api/verify", // endpoint - matches frontend
  false, // mockPassport: true for staging/testnet
  AllIds,
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [],
    ofac: false, // Allow all countries for now
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
      userContextData,
      userContextDataType: typeof userContextData
    });

    // Verify all required fields are present
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      console.error("Missing required fields");
      return NextResponse.json({
        status: "error",
        result: false,
        reason: "Proof, publicSignals, attestationId and userContextData are required"
      }, { status: 200 });
    }
    
    const result = await selfBackendVerifier.verify(
      attestationId, // Document type (3 = Aadhaar for Indian users)
      proof, // The zero-knowledge proof
      publicSignals, // Public signals array
      userContextData // User context data (properly formatted hex string)
    );

    console.log("Verification result:", JSON.stringify(result, null, 2));

    // Check if verification was successful according to Self SDK format
    const { isValid, isMinimumAgeValid, isOfacValid } = result.isValidDetails;
    
    if (isValid && isMinimumAgeValid && isOfacValid) {
      // Verification successful - extract identity commitment
      const identityCommitment = (result.discloseOutput as any)?.identityCommitment || 
                                 (result.discloseOutput as any)?.identity_commitment ||
                                 `identity_${Date.now()}`;
      
      console.log("Verification successful! Identity commitment:", identityCommitment);
      console.log("Full disclose output:", JSON.stringify(result.discloseOutput, null, 2));
      
      // Return in the exact format expected by Self SDK (status 200 always)
      return NextResponse.json({
        status: "success",
        result: true,
        // Additional data for your app
        identityCommitment,
        credentialSubject: result.discloseOutput,
        verificationData: {
          verified: true,
          timestamp: new Date().toISOString(),
          documentType: attestationId,
          userAddress: result.userData.userIdentifier,
        }
      }, { status: 200 });
    } else {
      // Verification failed - determine specific reason
      let reason = "Verification failed";
      if (!isMinimumAgeValid) reason = "Minimum age verification failed";
      if (!isOfacValid) reason = "OFAC verification failed";
      if (!isValid) reason = "Proof verification failed";
      
      console.error("Verification failed:", JSON.stringify(result.isValidDetails, null, 2));
      
      // Return error with status 200 as per Self SDK requirements
      return NextResponse.json({
        status: "error",
        result: false,
        reason: reason
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Verification error:", error);
    
    // Return error with status 200 as per Self SDK requirements
    return NextResponse.json({
      status: "error",
      result: false,
      reason: error instanceof Error ? error.message : "Unknown error"
    }, { status: 200 });
  }
}
