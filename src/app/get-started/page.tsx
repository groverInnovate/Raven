"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageLayout, Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from "../../components";
import { useWallet } from "../../contexts/WalletContext";

export default function GetStartedPage() {
  const [step, setStep] = useState(1);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    location: '',
    interests: [] as string[]
  });
  const { wallet, connectWallet, isConnecting } = useWallet();
  const router = useRouter();

  // Auto-advance to step 2 when wallet is connected
  useEffect(() => {
    if (wallet && step === 1) {
      setStep(2);
    }
  }, [wallet, step]);

  const handleAadharVerification = async () => {
    setIsGeneratingProof(true);
    // Simulate Aadhar verification process
    setTimeout(() => {
      setIsGeneratingProof(false);
      setAadharVerified(true);
      setStep(3);
    }, 3000);
  };

  const handleProfileUpdate = (field: string, value: string | string[]) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleInterest = (interest: string) => {
    setUserProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = () => {
    // Save user profile and redirect to listings
    localStorage.setItem('ghostpalace_profile', JSON.stringify({
      ...userProfile,
      walletAddress: wallet?.address,
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    }));
    
    router.push('/listings');
  };

  const interests = [
    'Electronics', 'Fashion', 'Books', 'Home & Garden', 'Sports',
    'Art & Collectibles', 'Automotive', 'Music', 'Gaming', 'Jewelry'
  ];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started with GhostPalace
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join the decentralized marketplace where everyone can trade securely with blockchain technology.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= stepNum 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`w-16 h-1 mx-2 transition-colors ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
            {/* Step 1: Connect Wallet */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Connect Your Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <p className="text-gray-600">
                    Connect your crypto wallet to start trading on GhostPalace. Your wallet is your identity and enables secure, decentralized transactions.
                  </p>
                  
                  {!wallet ? (
                    <div className="space-y-4">
                      <Button
                        variant="primary"
                        size="lg"
                        loading={isConnecting}
                        onClick={connectWallet}
                        className="w-full"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
                      </Button>
                      
                      <div className="text-sm text-gray-500">
                        <p>Don't have MetaMask? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Install it here</a></p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-center space-x-2 text-green-800">
                          <span className="font-medium">Wallet Connected Successfully</span>
                        </div>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Address: {wallet.address}</p>
                          <p>Balance: {wallet.balance} ETH</p>
                          <p>Network: {wallet.network}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setStep(2)}
                        className="w-full"
                      >
                        Continue to Profile Setup →
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Your wallet information is never stored on our servers</p>
                    <p>• Works with Ethereum, Polygon, and other EVM networks</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Profile Setup */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Create Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-600 text-center">
                    Set up your profile to start trading. This information helps other users trust and connect with you.
                  </p>
                  
                  <div className="space-y-4">
                    <Input
                      label="Display Name"
                      placeholder="Enter your display name"
                      value={userProfile.name}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      required
                    />
                    
                    <Input
                      label="Email (Optional)"
                      type="email"
                      placeholder="your.email@example.com"
                      value={userProfile.email}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      helperText="Used for important notifications only"
                    />
                    
                    <Input
                      label="Location"
                      placeholder="City, State/Country"
                      value={userProfile.location}
                      onChange={(e) => handleProfileUpdate('location', e.target.value)}
                      helperText="Helps with local transactions and shipping"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep(3)}
                      disabled={!userProfile.name.trim()}
                      className="flex-1"
                    >
                      Continue →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Interests & Verification */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Interests & Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-gray-600 text-center mb-4">
                      Select categories you're interested in to personalize your experience.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {interests.map((interest) => (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            userProfile.interests.includes(interest)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Identity Verification */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                      Identity Verification (Optional)
                    </h3>
                    
                    {!aadharVerified ? (
                      <div className="text-center space-y-4">
                        <p className="text-gray-600">
                          Verify your identity to build trust and access premium features. This increases your credibility in the marketplace.
                        </p>
                        
                        <Button
                          variant="outline"
                          loading={isGeneratingProof}
                          onClick={handleAadharVerification}
                          className="w-full"
                        >
                          {isGeneratingProof ? 'Generating Proof...' : 'Verify with Aadhar (India)'}
                        </Button>
                        
                        <p className="text-xs text-gray-500">
                          Uses zero-knowledge proofs to verify without exposing personal data
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-2 text-green-800 mb-2">
                          <span className="font-medium">Identity Verified Successfully</span>
                        </div>
                        <p className="text-sm text-green-700">
                          Your identity has been verified using zero-knowledge proofs
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setStep(4)}
                      className="flex-1"
                    >
                      Continue →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Welcome & Complete */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">
                    Welcome to GhostPalace
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <div className="space-y-4">
                    <p className="text-xl text-gray-700">
                      You're all set to start trading!
                    </p>
                    <p className="text-gray-600">
                      Your decentralized marketplace journey begins now. Buy, sell, and trade with confidence using blockchain technology.
                    </p>
                  </div>

                  {/* Profile Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Your Profile:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {userProfile.name}</p>
                      <p><strong>Wallet:</strong> {wallet?.address}</p>
                      <p><strong>Location:</strong> {userProfile.location || 'Not specified'}</p>
                      <p><strong>Interests:</strong> {userProfile.interests.length > 0 ? userProfile.interests.join(', ') : 'None selected'}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant={aadharVerified ? 'success' : 'secondary'}>
                          {aadharVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleComplete}
                      className="w-full"
                    >
                      Start Trading Now
                    </Button>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• Browse thousands of listings</p>
                      <p>• Create your own listings</p>
                      <p>• Trade with escrow protection</p>
                      <p>• Connect with traders worldwide</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Skip Option */}
          {step < 4 && (
            <div className="text-center mt-8">
              <Link
                href="/listings"
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Skip setup and browse listings →
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
