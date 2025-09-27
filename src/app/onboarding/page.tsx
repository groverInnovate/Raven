"use client";

import { useState } from "react";
import Link from "next/link";
import { StealthKeyManager } from "../../components/stealth/StealthKeyManager";

export default function OnboardingPage() {
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [step, setStep] = useState(1);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);
  const [stealthKeysGenerated, setStealthKeysGenerated] = useState(false);
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string | null>(null);

  const handleAadharVerification = async () => {
    setIsGeneratingProof(true);
    // Simulate Aadhar verification process
    setTimeout(() => {
      setIsGeneratingProof(false);
      setAadharVerified(true);
      // For sellers, go to stealth key setup; for buyers, go to completion
      setStep(userType === 'seller' ? 3 : 4);
    }, 3000);
  };

  const handleStealthKeysGenerated = (metaAddress: string) => {
    setStealthKeysGenerated(true);
    setStealthMetaAddress(metaAddress);
    console.log('Stealth keys generated:', metaAddress);
  };

  const handleComplete = () => {
    alert('Onboarding completed! Welcome to GhostPalace!');
    // Redirect to dashboard or listings
  };

  // Calculate total steps based on user type
  const totalSteps = userType === 'seller' ? 4 : 3;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-r from-black/70 via-black/50 to-black/30 absolute z-10"></div>
        <div className="w-full h-full bg-black relative">
          {/* Simulated video background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-teal-800/80 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-800/60 via-red-900/60 to-pink-800/60 animate-pulse delay-1000"></div>
          
          {/* Video overlay pattern to simulate real video */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-repeat" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px),
                                   radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                   backgroundSize: '50px 50px'
                 }}>
            </div>
          </div>
        </div>
      </div>

      {/* Video Control Button */}
      <button
        onClick={toggleVideo}
        className="absolute bottom-8 right-8 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
      >
        {isVideoPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Header */}
      <header className="relative z-20 bg-transparent">
        <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <div className="text-white text-2xl font-bold flex items-center gap-2">
              <span></span>
              Hyena
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button className="text-white hover:text-blue-400 transition-colors">
              Browse Listings
            </button>
            <button className="text-white hover:text-blue-400 transition-colors">
              Dashboard
            </button>
            <div className="flex items-center space-x-1 text-white cursor-pointer">
              <span className="text-sm">🇮🇳</span>
            </div>
            {userType === 'seller' && (
              <>
                <div className={`h-1 w-16 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  4
                </div>
              </>
            )}
          </div>
          <div className={`flex justify-center mt-2 ${userType === 'seller' ? 'space-x-8' : 'space-x-12'}`}>
            <span className="text-sm text-gray-600">Choose Role</span>
            <span className="text-sm text-gray-600">Verify Identity</span>
            {userType === 'seller' ? (
              <>
                <span className="text-sm text-gray-600">Privacy Setup</span>
                <span className="text-sm text-gray-600">Complete</span>
              </>
            ) : (
              <span className="text-sm text-gray-600">Complete Setup</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8">
          {/* Step 1: Choose User Type */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                How do you plan to use GhostPalace?
              </h2>
              <p className="text-gray-600 mb-8">
                Choose your primary role. You can always switch between buying and selling later.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <button
                  onClick={() => {
                    setUserType('buyer');
                    setStep(2);
                  }}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🛍️</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">I want to Buy</h3>
                  <p className="text-gray-600">
                    Browse and purchase items from verified sellers across India
                  </p>
                  <div className="mt-4 text-sm text-blue-600 font-medium">
                    ✓ Escrow protection ✓ Secure payments ✓ Dispute resolution
                  </div>
                </button>
              </div>
            </div>

            {/* Service Tags */}
            <div className="flex flex-wrap gap-3 mb-16">
              {services.map((service, index) => (
                <button
                  key={index}
                  className="bg-transparent border border-white/30 text-white px-4 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-200 backdrop-blur-sm"
                >
                  {service}
                </button>
              ))}
            </div>

            {/* Role Selection Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white p-6 rounded-xl transition-all duration-200 group text-left">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl group-hover:scale-110 transition-transform"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">I want to Buy</h3>
                    <p className="text-white/80 text-sm">Browse and purchase items from verified sellers across India</p>
                  </div>
                </div>
                <div className="text-sm text-blue-300">
                  ✓ Escrow protection ✓ Secure payments ✓ Dispute resolution
                </div>
              </button>

              <button className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white p-6 rounded-xl transition-all duration-200 group text-left">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl group-hover:scale-110 transition-transform"></div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">I want to Sell</h3>
                    <p className="text-white/80 text-sm">List your items and reach millions of verified buyers</p>
                  </div>
                </div>
                <div className="text-sm text-blue-300">
                  ✓ Easy listing ✓ Secure transactions ✓ Fast withdrawals
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                {aadharVerified && (
                  <button
                    onClick={() => setStep(userType === 'seller' ? 3 : 4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Stealth Key Setup (Sellers Only) */}
          {step === 3 && userType === 'seller' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-6">🔐</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Setup Financial Privacy
                </h2>
                <p className="text-gray-600">
                  Generate your stealth keys to enable private payments. This ensures your 
                  financial transactions remain confidential while maintaining your verified reputation.
                </p>
              </div>

              <StealthKeyManager 
                onKeysGenerated={handleStealthKeysGenerated}
                className="mb-8"
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                {stealthKeysGenerated && (
                  <button
                    onClick={() => setStep(4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Complete Setup
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Complete Setup (or Step 3 for Buyers) */}
          {((step === 4 && userType === 'seller') || (step === 3 && userType === 'buyer')) && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to GhostPalace!
              </h2>
              <p className="text-gray-600 mb-8">
                Your account is now set up and verified. You're ready to start {userType === 'buyer' ? 'shopping' : 'selling'} 
                on India's most trusted P2P marketplace.
                {userType === 'seller' && stealthKeysGenerated && (
                  <span className="block mt-2 text-blue-600 font-medium">
                    ✨ Plus, you now have financial privacy protection enabled!
                  </span>
                )}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-green-900 mb-3">What's Next?</h3>
                <div className="text-left space-y-3 text-green-800">
                  {userType === 'buyer' ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <span>🛍️</span>
                        <span>Browse thousands of verified listings</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>💬</span>
                        <span>Chat with sellers directly</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🔒</span>
                        <span>Make secure payments with escrow protection</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2">
                        <span>📦</span>
                        <span>Create your first listing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🔐</span>
                        <span>Receive private payments via stealth addresses</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>💰</span>
                        <span>Maintain financial privacy while building reputation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📊</span>
                        <span>Track your sales in the dashboard</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Show stealth meta-address for sellers */}
              {userType === 'seller' && stealthMetaAddress && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-blue-900 mb-3">🔐 Your Stealth Meta-Address</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Share this address with buyers for private payments:
                  </p>
                  <div className="bg-white p-3 rounded border font-mono text-xs break-all text-gray-700">
                    {stealthMetaAddress}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    💡 This address is safely stored in your browser and tied to your wallet
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {userType === 'buyer' ? (
                  <Link
                    href="/listings"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    🛍️ Start Shopping
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    📦 Create First Listing
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GhostPalaceInterface;
