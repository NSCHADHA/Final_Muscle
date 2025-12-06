-- Create RPC function to bypass schema cache issues
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_owner_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_gym_name TEXT,
  p_role TEXT DEFAULT 'owner'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, owner_name, email, phone, gym_name, role)
  VALUES (p_user_id, p_owner_name, p_email, p_phone, p_gym_name, p_role::user_role)
  ON CONFLICT (id) DO UPDATE
  SET 
    owner_name = EXCLUDED.owner_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    gym_name = EXCLUDED.gym_name,
    role = EXCLUDED.role;
END;
$$;
