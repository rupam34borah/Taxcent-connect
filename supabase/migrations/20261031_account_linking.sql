-- Auto-link verified authentication user to pre-enrolled staff roster or student profile
CREATE OR REPLACE FUNCTION public.claim_roster_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
  v_staff public.institute_staff%ROWTYPE;
  v_student public.student_profiles%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'not_authenticated');
  END IF;

  SELECT email INTO v_email FROM auth.users WHERE id = v_uid;
  IF v_email IS NULL OR BTRIM(v_email) = '' THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_email');
  END IF;

  -- 1. Try linking staff roster
  SELECT * INTO v_staff FROM public.institute_staff
  WHERE LOWER(BTRIM(email)) = LOWER(BTRIM(v_email))
    AND (user_id IS NULL OR user_id = v_uid)
    AND is_active = TRUE
  LIMIT 1;

  IF FOUND THEN
    IF v_staff.user_id IS NULL THEN
      UPDATE public.institute_staff
      SET user_id = v_uid, updated_at = NOW()
      WHERE id = v_staff.id;
    END IF;
    RETURN jsonb_build_object('success', true, 'type', 'staff', 'role', v_staff.role);
  END IF;

  -- 2. Try linking student profile
  SELECT * INTO v_student FROM public.student_profiles
  WHERE LOWER(BTRIM(email)) = LOWER(BTRIM(v_email))
    AND (user_id IS NULL OR user_id = v_uid)
    AND is_portal_active = TRUE
  LIMIT 1;

  IF FOUND THEN
    IF v_student.user_id IS NULL THEN
      UPDATE public.student_profiles
      SET user_id = v_uid, updated_at = NOW()
      WHERE id = v_student.id;
    END IF;
    RETURN jsonb_build_object('success', true, 'type', 'student');
  END IF;

  RETURN jsonb_build_object('success', false, 'reason', 'no_match');
END;
$$;

REVOKE ALL ON FUNCTION public.claim_roster_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_roster_profile() TO authenticated;
