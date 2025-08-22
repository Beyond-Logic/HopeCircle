-- Create users table for profile information
-- Note: Authentication is handled by Supabase Auth. 
-- This table extends the auth.users table.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  genotype VARCHAR(20) NOT NULL CHECK (genotype IN ('SS', 'SC', 'AS', 'AA', 'other')),
  country VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'banned', 'suspended')),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'moderator', 'user')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_genotype ON public.users(genotype);
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users(country);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Anyone logged in can view all profiles
CREATE POLICY "Users can view all profiles"
  ON public.users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (id must match auth.uid)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
