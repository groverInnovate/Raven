-- GhostPalace Database Schema for Supabase (Minimal Version)
-- Run this in your Supabase SQL Editor

-- Create verified_users table with essential columns
CREATE TABLE IF NOT EXISTS verified_users (
  nullifier TEXT PRIMARY KEY,
  nationality TEXT NOT NULL,
  minimum_age INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_verified_users_nationality ON verified_users(nationality);
CREATE INDEX IF NOT EXISTS idx_verified_users_minimum_age ON verified_users(minimum_age);
CREATE INDEX IF NOT EXISTS idx_verified_users_address ON verified_users(user_address);

-- Enable Row Level Security (RLS)
ALTER TABLE verified_users ENABLE ROW LEVEL SECURITY;

-- Simple policy - allow all operations for now
CREATE POLICY "Allow all operations on verified users" ON verified_users USING (true);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nullifier TEXT REFERENCES verified_users(nullifier) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  api_key TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_nullifier ON listings(nullifier);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);

-- Enable RLS for listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Simple policy for listings
CREATE POLICY "Allow all operations on listings" ON listings USING (true);

-- Insert some sample data for testing (optional)
-- INSERT INTO verified_users (nullifier, nationality, age_verified, user_address) 
-- VALUES ('sample_nullifier_123', 'IN', true, '0x1234567890123456789012345678901234567890')
-- ON CONFLICT (nullifier) DO NOTHING;
