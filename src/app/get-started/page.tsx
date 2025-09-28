"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { ethers, getAddress } from "ethers";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries,
} from "@selfxyz/qrcode";
import { getUniversalLink } from "@selfxyz/core";

export default function Home() {
  const { wallet, connectWallet, isConnecting } = useWallet();

  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [userId, setUserId] = useState<string>(ethers.ZeroAddress);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
  const [isMobile, setIsMobile] = useState(true);
  const [stealthKeysGenerated, setStealthKeysGenerated] = useState(false);
   
  // Mobile / in-app detection and stable setu
  useEffect(() => {
    try {
      // Detect mobile / in-app webview to decide whether to show copy/open tools
      const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
      const mobile = /(Android|iPhone|iPad|iPod|Mobile|Windows Phone)/i.test(ua) ||
        // @ts-ignore
       (typeof window !== "undefined" && !!(window as any).ReactNativeWebView);
      setIsMobile(!!mobile);
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, []);

  // Update userId when wallet connects
  useEffect(() => {
    if (wallet?.address) {
      try {
        const a = getAddress(wallet.address);
        console.log("Setting userId from wallet address:", {
          originalAddress: wallet.address,
          checksummedAddress: a,
          userId: a
        });
        setUserId(a);
      } catch (error) {
        console.error("Failed to get address:", error);
        setUserId(ethers.ZeroAddress);
      }
    } else {
      console.log("No wallet address, setting userId to ZeroAddress");
      setUserId(ethers.ZeroAddress);
    }
  }, [wallet]);

  // Use a publicly accessible endpoint (Self SDK doesn't allow localhost)
  const endpointAddr = 'https://f4991ac4a421.ngrok-free.app/api/verify';
  const selfApp: SelfApp | null = useMemo(() => {
    try {
      if (!endpointAddr) {
        console.warn("Missing endpoint address");
        return null;
      }
      
      // Don't create QR code if wallet not connected
      if (!wallet?.address || userId === ethers.ZeroAddress) {
        console.log("Waiting for wallet connection...", {
          walletAddress: wallet?.address,
          userId,
          isZeroAddress: userId === ethers.ZeroAddress
        });
        return null;
      }
      
      console.log("Creating Self app with:", {
        endpoint: endpointAddr,
        userId: userId,
        userIdLength: userId.length,
        userIdType: typeof userId,
        walletAddress: wallet.address,
        isValidAddress: userId !== ethers.ZeroAddress
      });
      
      const app = new SelfAppBuilder({
        version: 2,
        appName: "Aadhaar Shield",
        scope: "aadhaar",
        endpoint: endpointAddr,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "https",
        userIdType: "hex",
        userDefinedData: "Aadhaar",
        disclosures: {
          minimumAge: 18,
          excludedCountries: [],
          ofac: false,
        }
      }).build();
      
      console.log("Self app created successfully:", app);
      return app;
    } catch (e) {
      console.error("Failed to initialize Self app:", e);
      return null;
    }
  }, [endpointAddr, userId, wallet?.address]);

  const universalLink = useMemo(() => (selfApp ? getUniversalLink(selfApp) : ""), [selfApp]);

  // No status polling on QR page; polling happens on /status

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  

  const handleSuccessfulVerification = async (result: any) => {
    try {
      console.log("Verification result received:", result);
      
      if (!result) {
        throw new Error("Verification result is undefined");
      }
      
      // Extract the verification data
      const { identityCommitment, zkProof, verificationData } = result;
      
      if (!identityCommitment) {
        throw new Error("No identityCommitment found in verification result");
      }
      
      console.log("Identity Commitment:", identityCommitment);
      console.log("ZK Proof:", zkProof);
      
      // Store the verification data
      localStorage.setItem('aadhaar_identity_commitment', identityCommitment);
      // Store the verification data (you can save this to state or localStorage)
      localStorage.setItem('result', result);
      localStorage.setItem('aadhaar_verification_data', JSON.stringify(verificationData));
      localStorage.setItem('aadhaar_verified', 'true');
      localStorage.setItem('verification_timestamp', new Date().toISOString());
      
      displayToast("✅ Aadhaar verification successful!");
      
      // Auto-generate stealth keys after successful verification
      if (wallet?.address) {
        await generateStealthKeysAutomatically();
      }
      
    } catch (err: any) {
      console.error("Failed to process verification result:", err);
      displayToast(`❌ Verification failed: ${err.message}`);
    }
  };

  const generateStealthKeysAutomatically = async () => {
    try {
      if (!wallet?.address) return;
      
      displayToast("🔐 Setting up your private payment system...");
      
      // Import stealth functions and user profile
      const { generateStealthKeysFromWallet, saveStealthKeysToStorage, formatStealthMetaAddress } = await import('../../lib/stealth');
      const { updateVerificationStatus, updateStealthMetaAddress } = await import('../../lib/userProfile');
      
      // Get signer
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Generate stealth keys
        const stealthKeys = await generateStealthKeysFromWallet(wallet.address, signer);
        
        // Save to storage
        saveStealthKeysToStorage(stealthKeys);
        
        // Update user profile
        updateVerificationStatus(wallet.address, true);
        updateStealthMetaAddress(wallet.address, stealthKeys.stealthMetaAddress);
        
        setStealthKeysGenerated(true);
        displayToast("✅ Setup complete! You can now buy and sell with complete privacy.");
        
        // Navigate to dashboard after a delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      }
    } catch (error) {
      console.error('Error generating stealth keys:', error);
      displayToast("⚠️ Verification complete, but private payments need manual setup.");
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">

      {/* Main content */}
      <div className="h-px bg-gray-200 w-full max-w-xl mx-auto mb-4" />
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto mt-2 text-center">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h1>
          <p className="text-gray-600 text-sm">
            Scan your Aadhaar card to create your secure, anonymous identity for Aadhaar Shield marketplace
          </p>
        </div>
        {/* Connect wallet */}
        <div className="mb-4">
          <div className="mt-1 text-xs font-mono text-gray-700 break-all">{wallet?.address ? "Connected" : "Not connected"}</div>
          <div className="mt-3 flex gap-2 justify-center">
            <button 
              type="button" 
              onClick={connectWallet} 
              disabled={isConnecting || !!wallet?.address}
              className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isConnecting ? "Connecting..." : wallet?.address ? "Wallet Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How to verify:</h3>
          <ol className="text-xs text-blue-800 space-y-1 text-left">
            <li>1. Download the Self app on your mobile device</li>
            <li>2. Scan the QR code below with the Self app</li>
            <li>3. Follow the prompts to scan your Aadhaar card</li>
            <li>4. Complete the verification process</li>
          </ol>
        </div>

        <div className="flex justify-center mb-4 sm:mb-6">
          {!wallet?.address ? (
            <div className="w-[256px] h-[256px] bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center rounded-lg">
              <div className="text-center p-4">
                <p className="text-yellow-700 text-sm font-medium mb-2">Wallet Required</p>
                <p className="text-yellow-600 text-xs">Please connect your wallet first to generate QR code</p>
              </div>
            </div>
          ) : selfApp ? (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={() => {
                console.log("QR Code scanned successfully! User completed verification on mobile.");
                setVerificationStatus('processing');
                displayToast("✅ QR Code scanned! Processing verification...");
                
                // The Self SDK handles the backend verification automatically
                // The verification result should be available through the backend
                setTimeout(async () => {
                  setVerificationStatus('success');
                // After verification, get the latest nullifier from Supabase
                  console.log("🔍 Starting nullifier retrieval process...");
                  
                  try {
                    // Get latest nullifier from Supabase (most recent verification)
                    console.log("🔍 Fetching latest nullifier from database...");
                    
                    const response = await fetch(`/api/users/latest-nullifier`);
                    console.log("📡 API response status:", response.status);
                    
                    const result = await response.json();
                    console.log("📊 API response data:", result);
                    
                    if (result.success && result.nullifier) {
                      // Store nullifier in localStorage with simple key
                      localStorage.setItem('nullifier', result.nullifier);
                      console.log("💾 ✅ Nullifier stored in localStorage with key 'nullifier':", result.nullifier);
                      console.log("🔍 Verification details:", {
                        nullifier: result.nullifier,
                        nationality: result.nationality,
                        minimum_age: result.minimum_age,
                        user_address: result.user_address,
                        created_at: result.created_at
                      });
                      
                      setVerificationStatus('success');
                      displayToast("✅ Aadhaar verification successful! You can now create listings.");
                    } else {
                      console.warn("⚠️ Could not retrieve nullifier from Supabase:", result);
                      setVerificationStatus('success');
                      displayToast("✅ Aadhaar verification successful! (Note: Please refresh if you have issues creating listings)");
                    }
                  } catch (error) {
                    console.error("❌ Error retrieving nullifier:", error);
                    setVerificationStatus('success');
                    displayToast("✅ Aadhaar verification successful! (Note: Please refresh if you have issues creating listings)");
                  }
                  
                  // Store verification status
                  localStorage.setItem('aadhaar_verified', 'true');
                  localStorage.setItem('verification_timestamp', new Date().toISOString());
                  
                  displayToast("✅ Aadhaar verification successful!");
                  
                  // Auto-generate stealth keys
                  if (wallet?.address) {
                    await generateStealthKeysAutomatically();
                  } else {
                    displayToast("✅ Verification complete! Connect wallet to enable private payments.");
                  }
                }, 4000);
              }}
              onError={() => {
                console.error("Self SDK Error occurred");
                setVerificationStatus('error');
                displayToast("❌ Verification error occurred. Please try again.");
              }}
            />
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading QR Code...</p>
            </div>
          )}
        </div>
        
        {/* Verification Status Indicator */}
        <div className="mb-4 text-center">
          {verificationStatus === 'idle' && (
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm">Ready to scan QR code</span>
            </div>
          )}
          {verificationStatus === 'processing' && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Processing Aadhaar verification...</span>
            </div>
          )}
          {verificationStatus === 'success' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">✅ Verification successful!</span>
              </div>
              {stealthKeysGenerated && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">🔐 Private payments enabled!</span>
                </div>
              )}
            </div>
          )}
          {verificationStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">❌ Verification failed</span>
            </div>
          )}
        </div>

        {isMobile && (
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6 justify-center items-center">
            <button
              type="button"
              onClick={copyToClipboard}
              disabled={!universalLink}
              className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {linkCopied ? "Copied!" : "Copy Universal Link"}
            </button>

            <button
              type="button"
              onClick={openSelfApp}
              disabled={!universalLink}
              className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Open Self App
            </button>
          </div>
        )}
        
        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
            {toastMessage}
          </div>
        )}
      </div>
        </div>
      </main>
    </div>
  );
}
