-- Eudaemonia Database Schema for Supabase
-- This migration creates all tables needed for the application
-- No RLS (Row Level Security) is enabled as per requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
-- We'll use Supabase's built-in auth.users, but create a profiles table for additional data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Categories table
CREATE TABLE IF NOT EXISTS custom_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('numeric', 'scale', 'boolean')),
  min DOUBLE PRECISION,
  max DOUBLE PRECISION,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Daily Entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sleep_hours DOUBLE PRECISION NOT NULL,
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  exercise BOOLEAN NOT NULL DEFAULT false,
  exercise_time INTEGER,
  alcohol BOOLEAN NOT NULL DEFAULT false,
  alcohol_units DOUBLE PRECISION,
  cannabis BOOLEAN NOT NULL DEFAULT false,
  cannabis_amount INTEGER,
  meditation BOOLEAN NOT NULL DEFAULT false,
  meditation_time INTEGER,
  social_time DOUBLE PRECISION,
  work_hours DOUBLE PRECISION,
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  happiness_rating INTEGER NOT NULL CHECK (happiness_rating >= 1 AND happiness_rating <= 10),
  meals INTEGER,
  food_quality INTEGER CHECK (food_quality IS NULL OR (food_quality >= 1 AND food_quality <= 10)),
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Category Entries table
CREATE TABLE IF NOT EXISTS custom_category_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value DOUBLE PRECISION NOT NULL,
  daily_entry_id UUID NOT NULL REFERENCES daily_entries(id) ON DELETE CASCADE,
  custom_category_id UUID NOT NULL REFERENCES custom_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(daily_entry_id, custom_category_id)
);

-- Gratitudes table
CREATE TABLE IF NOT EXISTS gratitudes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date ON daily_entries(date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_custom_categories_user_id ON custom_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_category_entries_daily_entry_id ON custom_category_entries(daily_entry_id);
CREATE INDEX IF NOT EXISTS idx_custom_category_entries_category_id ON custom_category_entries(custom_category_id);
CREATE INDEX IF NOT EXISTS idx_gratitudes_user_id ON gratitudes(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitudes_created_at ON gratitudes(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_categories_updated_at BEFORE UPDATE ON custom_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_category_entries_updated_at BEFORE UPDATE ON custom_category_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gratitudes_updated_at BEFORE UPDATE ON gratitudes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

