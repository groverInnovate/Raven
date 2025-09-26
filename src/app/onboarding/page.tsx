"use client";

import { useState } from "react";
import Link from "next/link";

export default function OnboardingPage() {
  const [userType, setUserType] = useState<'buyer' | 'seller' | null>(null);
  const [step, setStep] = useState(1);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);

  const handleAadharVerification = async () => {
    setIsGeneratingProof(true);
    // Simulate Aadhar verification process
    setTimeout(() => {
      setIsGeneratingProof(false);
      setAadharVerified(true);
      setStep(3);
    }, 3000);
  };

  const handleComplete = () => {
    alert('Onboarding completed! Welcome to GhostPalace!');
    // Redirect to dashboard or listings
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                👻 GhostPalace
              </Link>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/listings"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to GhostPalace! 🇮🇳
          </h1>
          <p className="text-xl text-gray-600">
            Let's get you set up for secure trading in India's trusted P2P marketplace
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
          </div>
          <div className="flex justify-center space-x-12 mt-2">
            <span className="text-sm text-gray-600">Choose Role</span>
            <span className="text-sm text-gray-600">Verify Identity</span>
            <span className="text-sm text-gray-600">Complete Setup</span>
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

                <button
                  onClick={() => {
                    setUserType('seller');
                    setStep(2);
                  }}
                  className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">I want to Sell</h3>
                  <p className="text-gray-600">
                    List your items and reach millions of verified buyers
                  </p>
                  <div className="mt-4 text-sm text-blue-600 font-medium">
                    ✓ Easy listing ✓ Secure transactions ✓ Fast withdrawals
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Aadhar Verification */}
          {step === 2 && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🇮🇳</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verify Your Identity with Aadhar
              </h2>
              <p className="text-gray-600 mb-8">
                To ensure safe transactions for all users, we require Aadhar verification. 
                Your data is encrypted and secure.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3">Why Aadhar Verification?</h3>
                <div className="text-left space-y-2 text-blue-800">
                  <div className="flex items-center space-x-2">
                    <span>🔒</span>
                    <span>Prevents fraud and fake accounts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Builds trust between buyers and sellers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🇮🇳</span>
                    <span>Complies with Indian regulations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>⚡</span>
                    <span>Enables faster dispute resolution</span>
                  </div>
                </div>
              </div>

              {!isGeneratingProof && !aadharVerified && (
                <div>
                  <button
                    onClick={handleAadharVerification}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors mb-4"
                  >
                    🔐 Generate Aadhar Proof
                  </button>
                  <p className="text-sm text-gray-500">
                    This will redirect you to the official Aadhar verification portal
                  </p>
                </div>
              )}

              {isGeneratingProof && (
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Generating Aadhar Proof...
                  </h3>
                  <p className="text-gray-600">
                    Please wait while we verify your identity securely
                  </p>
                </div>
              )}

              {aadharVerified && (
                <div className="text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    Aadhar Verification Successful!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your identity has been verified. You're ready to start trading!
                  </p>
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
                    onClick={() => setStep(3)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Complete Setup */}
          {step === 3 && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to GhostPalace!
              </h2>
              <p className="text-gray-600 mb-8">
                Your account is now set up and verified. You're ready to start {userType === 'buyer' ? 'shopping' : 'selling'} 
                on India's most trusted P2P marketplace.
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
                        <span>💰</span>
                        <span>Receive payments securely</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📊</span>
                        <span>Track your sales in the dashboard</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

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
      </div>
    </div>
  );
}
