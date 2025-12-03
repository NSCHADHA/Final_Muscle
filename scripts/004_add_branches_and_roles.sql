-- Add support for multiple gym branches and role-based access

-- User roles enum
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'trainer', 'front_desk');

-- Branches table (for multi-gym management)
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Owner can see all their branches
CREATE POLICY "branches_select_owner"
  ON public.branches FOR SELECT
  USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM public.staff_members sm
    WHERE sm.user_id = auth.uid() AND sm.branch_id = branches.id
  ));

-- Only owner can insert branches
CREATE POLICY "branches_insert_owner"
  ON public.branches FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owner can update their branches
CREATE POLICY "branches_update_owner"
  ON public.branches FOR UPDATE
  USING (auth.uid() = owner_id);

-- Owner can delete their branches
CREATE POLICY "branches_delete_owner"
  ON public.branches FOR DELETE
  USING (auth.uid() = owner_id);

-- Staff members table (for role-based access)
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'front_desk',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, branch_id)
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Staff can see their own record
CREATE POLICY "staff_select_own"
  ON public.staff_members FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = staff_members.branch_id AND b.owner_id = auth.uid()
  ));

-- Only owner can insert staff
CREATE POLICY "staff_insert_owner"
  ON public.staff_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = branch_id AND b.owner_id = auth.uid()
  ));

-- Owner and managers can update staff
CREATE POLICY "staff_update_authorized"
  ON public.staff_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = staff_members.branch_id AND b.owner_id = auth.uid()
    ) OR (
      auth.uid() = user_id AND role IN ('manager', 'trainer', 'front_desk')
    )
  );

-- Only owner can delete staff
CREATE POLICY "staff_delete_owner"
  ON public.staff_members FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.branches b
    WHERE b.id = staff_members.branch_id AND b.owner_id = auth.uid()
  ));

-- Add branch_id to existing tables
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE;
ALTER TABLE public.activity_log ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE;

-- Update profiles table to track user role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'owner';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_branches_owner_id ON public.branches(owner_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON public.staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_branch_id ON public.staff_members(branch_id);
CREATE INDEX IF NOT EXISTS idx_members_branch_id ON public.members(branch_id);
CREATE INDEX IF NOT EXISTS idx_payments_branch_id ON public.payments(branch_id);
CREATE INDEX IF NOT EXISTS idx_plans_branch_id ON public.plans(branch_id);

-- Update RLS policies for members to include branch access
DROP POLICY IF EXISTS "members_select_own" ON public.members;
CREATE POLICY "members_select_authorized"
  ON public.members FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = members.branch_id AND b.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.branch_id = members.branch_id AND sm.is_active = true
    )
  );

DROP POLICY IF EXISTS "members_insert_own" ON public.members;
CREATE POLICY "members_insert_authorized"
  ON public.members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_id AND b.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.branch_id = members.branch_id 
      AND sm.role IN ('manager', 'front_desk') AND sm.is_active = true
    )
  );

DROP POLICY IF EXISTS "members_update_own" ON public.members;
CREATE POLICY "members_update_authorized"
  ON public.members FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = members.branch_id AND b.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.branch_id = members.branch_id 
      AND sm.role IN ('manager', 'front_desk') AND sm.is_active = true
    )
  );

DROP POLICY IF EXISTS "members_delete_own" ON public.members;
CREATE POLICY "members_delete_authorized"
  ON public.members FOR DELETE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = members.branch_id AND b.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.branch_id = members.branch_id 
      AND sm.role = 'manager' AND sm.is_active = true
    )
  );

-- Similar updates for payments (only owner and managers can manage)
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_authorized"
  ON public.payments FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = payments.branch_id AND b.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.branch_id = payments.branch_id 
      AND sm.role IN ('manager', 'front_desk') AND sm.is_active = true
    )
  );

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_authorized"
  ON public.payments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.branches b
      WHERE b.id = branch_id AND b.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.staff_members sm
      WHERE sm.user_id = auth.uid() AND sm.branch_id = payments.branch_id 
      AND sm.role IN ('manager', 'front_desk') AND sm.is_active = true
    )
  );

-- Function to auto-create main branch for new users
CREATE OR REPLACE FUNCTION public.create_main_branch_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create a main branch for the new user
  INSERT INTO public.branches (owner_id, name, is_main)
  VALUES (NEW.id, NEW.gym_name || ' - Main Branch', true);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_create_branch ON public.profiles;

CREATE TRIGGER on_profile_created_create_branch
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_main_branch_for_user();

-- Triggers for updated_at
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON public.staff_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
