-- Add QR Check-in Function for Attendance
-- This function validates the QR token and records attendance

CREATE OR REPLACE FUNCTION public.check_in_by_qr(
  p_user_id UUID,
  p_qr_token TEXT,
  p_branch_id UUID DEFAULT NULL,
  p_device_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member RECORD;
  v_attendance_id UUID;
  v_today_date DATE;
  v_existing_checkin RECORD;
BEGIN
  -- Get today's date
  v_today_date := CURRENT_DATE;
  
  -- Find the member with this QR token
  SELECT id, name, status, expiry_date
  INTO v_member
  FROM public.members
  WHERE qr_token = p_qr_token
    AND user_id = p_user_id
    AND deleted_at IS NULL;
  
  -- Check if member exists
  IF v_member IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid QR code or member not found'
    );
  END IF;
  
  -- Check if membership is expired
  IF v_member.status = 'expired' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Membership expired. Please renew to check in.',
      'member', jsonb_build_object(
        'id', v_member.id,
        'name', v_member.name,
        'status', v_member.status
      )
    );
  END IF;
  
  -- Check if already checked in today
  SELECT id, check_in
  INTO v_existing_checkin
  FROM public.attendance
  WHERE member_id = v_member.id
    AND user_id = p_user_id
    AND DATE(check_in) = v_today_date;
  
  IF v_existing_checkin IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Already checked in today at ' || TO_CHAR(v_existing_checkin.check_in, 'HH12:MI AM'),
      'member', jsonb_build_object(
        'id', v_member.id,
        'name', v_member.name,
        'status', v_member.status
      )
    );
  END IF;
  
  -- Record attendance
  INSERT INTO public.attendance (
    user_id,
    member_id,
    member_name,
    branch_id,
    check_in,
    device_id
  )
  VALUES (
    p_user_id,
    v_member.id,
    v_member.name,
    p_branch_id,
    NOW(),
    p_device_id
  )
  RETURNING id INTO v_attendance_id;
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'attendance_id', v_attendance_id,
    'member', jsonb_build_object(
      'id', v_member.id,
      'name', v_member.name,
      'status', v_member.status
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Database error: ' || SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_in_by_qr TO authenticated;

COMMENT ON FUNCTION public.check_in_by_qr IS 'Records attendance by scanning member QR code. Validates membership status and prevents duplicate check-ins.';
