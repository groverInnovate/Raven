"use client"

import React, { useState, useEffect, useMemo } from "react";
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers, getAddress } from "ethers";
  

export default function Home() {

  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // Self app instance and universal link are memoized below
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletError, setWalletError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(ethers.ZeroAddress);
  // No status data on this page; it's handled on /status
  const [isMobile, setIsMobile] = useState(true);
   
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

  // Wallet accounts detection
  useEffect(() => {
    const eth = (typeof window !== "undefined" && (window as any).ethereum) || null;
    if (!eth) return;
    const onAccounts = (accounts: string[]) => {
      try {
        if (accounts && accounts[0]) {
          const a = getAddress(accounts[0]);
          setWalletAddress(a);
          setUserId(a);
          setWalletError(null);
        }
      } catch {
        setWalletError("Invalid wallet address");
      }
    };
    eth.request?.({ method: "eth_accounts" }).then(onAccounts).catch(() => {});
    eth.on?.("accountsChanged", onAccounts);
    return () => { try { eth.removeListener?.("accountsChanged", onAccounts); } catch {} };
  }, []);

  async function connectWallet() {
    try {
      const eth = (window as any).ethereum;
      if (!eth) { setWalletError("No wallet found in this browser"); return; }
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        const a = getAddress(accounts[0]);
        setWalletAddress(a);
        setUserId(a);
        setWalletError(null);
      }
    } catch (e: any) {
      setWalletError(e?.message || "Failed to connect wallet");
    }
  }

  const endpointAddr = ("0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74").toString();
  const selfApp: SelfApp | null = useMemo(() => {
    try {
      if (!endpointAddr) {
        console.warn("Missing endpoint address: set NEXT_PUBLIC_SOURCE_CONTRACT in app/.env");
        return null;
      }
      return new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Adhaar Shield",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "self",
        endpoint: endpointAddr,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "celo",
        userIdType: "hex",
        userDefinedData: "Self verification result bridging to Base Mainnet",
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
        }
      }).build();
    } catch (e) {
      console.error("Failed to initialize Self app:", e);
      return null;
    }
  }, [endpointAddr, userId]);

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

  

  const handleSuccessfulVerification = (result: any) => {
  try {
    if (!result) throw new Error("Result is undefined");
      displayToast("Verification successful!");

  } catch (err: any) {
    console.error("Failed to extract zkID or verification:", err);
    displayToast(err.message || "Verification failed!");
  }
};

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="flex gap-4 items-center flex-col sm:flex-row">

      {/* Main content */}
      <div className="h-px bg-gray-200 w-full max-w-xl mx-auto mb-4" />
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl mx-auto mt-2 text-center">
        {/* Connect wallet */}
        <div className="mb-4">
          <div className="mt-1 text-xs font-mono text-gray-700 break-all">{walletAddress?"Connected":"Not connected"}</div>
          <div className="mt-3 flex gap-2 justify-center">
            <button type="button" onClick={connectWallet} className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm">Connect Wallet</button>
            {walletError && <span className="text-xs text-amber-600 self-center">{walletError}</span>}
          </div>
        </div>

        <div className="flex justify-center mb-4 sm:mb-6">
          {selfApp ? (
            <SelfQRcodeWrapper
  selfApp={selfApp}
  onSuccess={() => handleSuccessfulVerification(selfApp)}
  onError={() => {
    displayToast("Error: Failed to verify identity");
  }}
/>
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading QR Code...</p>
            </div>
          )}
        </div>
        {/* Status moved to /status */}

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
