/**
 * User Profile Management
 * Handles user data including stealth payment information
 */

export interface UserProfile {
  walletAddress: string;
  isAadhaarVerified: boolean;
  verificationTimestamp?: string;
  stealthMetaAddress?: string;
  hasStealthKeys: boolean;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'ghost_palace_user_profile';

/**
 * Get user profile from storage
 */
export function getUserProfile(walletAddress: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const profiles = JSON.parse(stored);
    return profiles[walletAddress.toLowerCase()] || null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Save user profile to storage
 */
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const profiles = stored ? JSON.parse(stored) : {};
    
    profiles[profile.walletAddress.toLowerCase()] = {
      ...profile,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    console.log('User profile saved:', profile.walletAddress);
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * Update user profile with verification status
 */
export function updateVerificationStatus(walletAddress: string, verified: boolean): void {
  const profile = getUserProfile(walletAddress) || createDefaultProfile(walletAddress);
  
  profile.isAadhaarVerified = verified;
  if (verified) {
    profile.verificationTimestamp = new Date().toISOString();
  }
  
  saveUserProfile(profile);
}

/**
 * Update user profile with stealth meta-address
 */
export function updateStealthMetaAddress(walletAddress: string, metaAddress: string): void {
  const profile = getUserProfile(walletAddress) || createDefaultProfile(walletAddress);
  
  profile.stealthMetaAddress = metaAddress;
  profile.hasStealthKeys = true;
  
  saveUserProfile(profile);
}

/**
 * Create default user profile
 */
function createDefaultProfile(walletAddress: string): UserProfile {
  return {
    walletAddress: walletAddress.toLowerCase(),
    isAadhaarVerified: false,
    hasStealthKeys: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Check if user is fully onboarded (verified + stealth keys)
 */
export function isUserFullyOnboarded(walletAddress: string): boolean {
  const profile = getUserProfile(walletAddress);
  return profile?.isAadhaarVerified && profile?.hasStealthKeys || false;
}

/**
 * Get user's stealth meta-address for payments
 */
export function getUserStealthMetaAddress(walletAddress: string): string | null {
  const profile = getUserProfile(walletAddress);
  return profile?.stealthMetaAddress || null;
}

/**
 * Check if user needs onboarding
 */
export function needsOnboarding(walletAddress: string): {
  needsVerification: boolean;
  needsStealthKeys: boolean;
  isComplete: boolean;
} {
  const profile = getUserProfile(walletAddress);
  
  const needsVerification = !profile?.isAadhaarVerified;
  const needsStealthKeys = !profile?.hasStealthKeys;
  const isComplete = !needsVerification && !needsStealthKeys;
  
  return {
    needsVerification,
    needsStealthKeys,
    isComplete
  };
}