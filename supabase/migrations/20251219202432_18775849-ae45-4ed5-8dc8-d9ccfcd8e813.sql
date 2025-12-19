-- Tabella per codici OTP admin
CREATE TABLE public.admin_otp_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.admin_otp_codes ENABLE ROW LEVEL SECURITY;

-- Solo il service role può gestire OTP
CREATE POLICY "No direct access to OTP codes"
ON public.admin_otp_codes
FOR ALL
USING (false)
WITH CHECK (false);

-- Indice per pulizia codici scaduti
CREATE INDEX idx_admin_otp_expires ON public.admin_otp_codes(expires_at);
CREATE INDEX idx_admin_otp_user ON public.admin_otp_codes(user_id);

-- Tabella per rate limiting
CREATE TABLE public.login_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(identifier)
);

-- Enable RLS
ALTER TABLE public.login_rate_limits ENABLE ROW LEVEL SECURITY;

-- Solo service role può gestire rate limits
CREATE POLICY "No direct access to rate limits"
ON public.login_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);

-- Indice per ricerca veloce
CREATE INDEX idx_rate_limits_identifier ON public.login_rate_limits(identifier);
CREATE INDEX idx_rate_limits_blocked ON public.login_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Abilita realtime per blocked_ips
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_ips;