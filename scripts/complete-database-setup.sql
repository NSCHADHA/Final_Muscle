-- MuscleDesk Complete Database Setup
-- Run this in your NEW Supabase SQL Editor
-- This will create all tables, RLS policies, triggers, and indexes

-- ============================================
-- STEP 1: Create Custom Types
-- ============================================

CREATE TYPE user_role AS ENUM ('owner', 'manager', 'trainer', 'receptionist');
CREATE TYPE staff_role AS ENUM ('manager', 'trainer', 'receptionist');

-- ============================================
-- STEP 2: Create Profiles Table
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  owner_name TEXT,
  gym_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- STEP 3: Create Branches Table
-- ============================================

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for branches
CREATE POLICY branches_select_owner ON branches
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY branches_insert_owner ON branches
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY branches_update_owner ON branches
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY branches_delete_owner ON branches
  FOR DELETE USING (auth.uid() = owner_id);

-- ============================================
-- STEP 4: Create Members Table
-- ============================================

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  plan_duration INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for members
CREATE POLICY members_select_own ON members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY members_insert_own ON members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY members_update_own ON members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY members_delete_own ON members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 5: Create Plans Table
-- ============================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans
CREATE POLICY plans_select_own ON plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY plans_insert_own ON plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY plans_update_own ON plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY plans_delete_own ON plans
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: Create Payments Table
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  member_name TEXT,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY payments_select_own ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payments_insert_own ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY payments_update_own ON payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY payments_delete_own ON payments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- STEP 7: Create Staff Members Table
-- ============================================

CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role staff_role NOT NULL DEFAULT 'receptionist',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 8: Create Activity Log Table
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_log
CREATE POLICY activity_log_select_own ON activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY activity_log_insert_own ON activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- STEP 9: Create Indexes for Performance
-- ============================================

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_branch_id ON members(branch_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_expiry_date ON members(expiry_date);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_branch_id ON plans(branch_id);

CREATE INDEX idx_branches_owner_id ON branches(owner_id);

-- ============================================
-- STEP 10: Create Trigger Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 11: Create Profile Trigger (Auto-create profile and branch on signup)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_branch_id UUID;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, owner_name, gym_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'Gym Owner'),
    COALESCE(NEW.raw_user_meta_data->>'gym_name', 'My Gym'),
    'owner'
  );

  -- Create main branch for new gym owner
  INSERT INTO public.branches (owner_id, name, is_main)
  VALUES (NEW.id, 'Main Branch', true)
  RETURNING id INTO new_branch_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DATABASE SETUP COMPLETE
-- ============================================

-- Verify tables were created
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
