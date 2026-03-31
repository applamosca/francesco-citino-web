
-- Function to store a hashed OTP
CREATE OR REPLACE FUNCTION public.store_hashed_otp(
  _user_id uuid,
  _code text,
  _expires_at timestamptz
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_otp_codes (user_id, code, expires_at)
  VALUES (_user_id, crypt(_code, gen_salt('bf')), _expires_at);
END;
$$;

-- Function to verify a hashed OTP
CREATE OR REPLACE FUNCTION public.verify_hashed_otp(
  _user_id uuid,
  _code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  otp_id uuid;
BEGIN
  SELECT id INTO otp_id
  FROM public.admin_otp_codes
  WHERE user_id = _user_id
    AND used = false
    AND expires_at > now()
    AND code = crypt(_code, code)
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF otp_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.admin_otp_codes SET used = true WHERE id = otp_id;
  RETURN true;
END;
$$;
