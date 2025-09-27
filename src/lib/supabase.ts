import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pdjuqjrxwozjjwfovlcu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkanVxanJ4d296amp3Zm92bGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTI3NjIsImV4cCI6MjA3NDU2ODc2Mn0.gG-halGz5Uvsqq-iDiPzyNxD93tgC-XOvFZVTcl58IM';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TypeScript interfaces
export interface VerifiedUser {
  nullifier: string;
  nationality: string;
  minimum_age: number;
  user_address: string;
  created_at?: string;
}

export interface Listing {
  id?: string;
  nullifier: string;
  title: string;
  description?: string;
  api_key: string;
  price: number;
  created_at?: string;
}

// Database service functions
export class SupabaseService {
  
  /**
   * Store or update verified user data
   */
  static async storeVerifiedUser(userData: VerifiedUser): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📊 Storing user data in Supabase:', userData.nullifier);
      
      const { data, error } = await supabase
        .from('verified_users')
        .upsert({
          nullifier: userData.nullifier,
          nationality: userData.nationality,
          minimum_age: userData.minimum_age,
          user_address: userData.user_address
        }, {
          onConflict: 'nullifier'
        });

      if (error) {
        console.error('❌ Supabase storage error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ User data stored successfully in Supabase');
      return { success: true };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get verified user by nullifier
   */
  static async getVerifiedUser(nullifier: string): Promise<{ user?: VerifiedUser; error?: string }> {
    try {
      console.log('🔍 Fetching user from Supabase:', nullifier);
      
      const { data, error } = await supabase
        .from('verified_users')
        .select('*')
        .eq('nullifier', nullifier)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return { error: 'User not found' };
        }
        console.error('❌ Supabase fetch error:', error);
        return { error: error.message };
      }

      console.log('✅ User fetched successfully from Supabase');
      return { user: data };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { error: err.message };
    }
  }

  /**
   * Get all verified users (for analytics)
   */
  static async getAllVerifiedUsers(): Promise<{ users?: VerifiedUser[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('verified_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch all error:', error);
        return { error: error.message };
      }

      return { users: data };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { error: err.message };
    }
  }

  /**
   * Get verification statistics
   */
  static async getVerificationStats(): Promise<{ stats?: any; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('verified_users')
        .select('nationality, age_verified, created_at');

      if (error) {
        console.error('❌ Supabase stats error:', error);
        return { error: error.message };
      }

      // Process stats
      const stats = {
        totalUsers: data.length,
        byNationality: data.reduce((acc: any, user) => {
          acc[user.nationality] = (acc[user.nationality] || 0) + 1;
          return acc;
        }, {}),
        ageVerified: data.filter(user => user.age_verified).length,
        recentUsers: data.filter(user => {
          const createdAt = new Date(user.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        }).length
      };

      return { stats };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { error: err.message };
    }
  }

  /**
   * Create a new listing
   */
  static async createListing(listingData: Listing): Promise<{ success: boolean; error?: string; data?: Listing }> {
    try {
      console.log('📝 Creating listing in Supabase:', listingData.title);
      
      const { data, error } = await supabase
        .from('listings')
        .insert({
          nullifier: listingData.nullifier,
          title: listingData.title,
          description: listingData.description,
          api_key: listingData.api_key,
          price: listingData.price
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase listing creation error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Listing created successfully in Supabase');
      return { success: true, data };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Get listings by nullifier
   */
  static async getListingsByNullifier(nullifier: string): Promise<{ listings?: Listing[]; error?: string }> {
    try {
      console.log('🔍 Fetching listings from Supabase for nullifier:', nullifier);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('nullifier', nullifier)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch listings error:', error);
        return { error: error.message };
      }

      console.log('✅ Listings fetched successfully from Supabase');
      return { listings: data };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { error: err.message };
    }
  }

  /**
   * Get all listings
   */
  static async getAllListings(): Promise<{ listings?: Listing[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase fetch all listings error:', error);
        return { error: error.message };
      }

      return { listings: data };
      
    } catch (err: any) {
      console.error('❌ Supabase service error:', err);
      return { error: err.message };
    }
  }

  /**
   * Get latest nullifier by creation date (most recent verification)
   */
  static async getLatestNullifier(): Promise<{ success: boolean; data?: VerifiedUser; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('verified_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return { success: false, error: 'No verification found in database' };
        }
        console.error('Error getting latest nullifier:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting latest nullifier:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get latest nullifier by user address
   */
  static async getLatestNullifierByAddress(userAddress: string): Promise<{ success: boolean; data?: VerifiedUser; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('verified_users')
        .select('*')
        .eq('user_address', userAddress)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return { success: false, error: 'No verification found for this user address' };
        }
        console.error('Error getting latest nullifier by address:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting latest nullifier by address:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if Supabase is properly configured
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase
        .from('verified_users')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Supabase connection test failed:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Connection successful' };
    } catch (error: any) {
      console.error('Supabase connection test error:', error);
      return { success: false, message: error.message };
    }
  }
}

export default SupabaseService;
