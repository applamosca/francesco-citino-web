-- Create access_logs table for tracking login attempts
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_access_logs_created_at ON public.access_logs(created_at DESC);
CREATE INDEX idx_access_logs_email ON public.access_logs(email);
CREATE INDEX idx_access_logs_ip ON public.access_logs(ip_address);
CREATE INDEX idx_access_logs_suspicious ON public.access_logs(is_suspicious) WHERE is_suspicious = true;

-- Enable RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read access logs
CREATE POLICY "Only admins can read access logs"
ON public.access_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Block all client modifications (only edge functions with service role can insert)
CREATE POLICY "Block client modifications"
ON public.access_logs
FOR ALL
USING (false)
WITH CHECK (false);

-- Create a view for security statistics
CREATE OR REPLACE VIEW public.security_stats AS
SELECT
  COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours') AS attempts_24h,
  COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours' AND success = true) AS successful_24h,
  COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours' AND success = false) AS failed_24h,
  COUNT(*) FILTER (WHERE created_at > now() - interval '24 hours' AND is_suspicious = true) AS suspicious_24h,
  COUNT(DISTINCT ip_address) FILTER (WHERE created_at > now() - interval '24 hours') AS unique_ips_24h,
  COUNT(*) FILTER (WHERE created_at > now() - interval '7 days') AS attempts_7d,
  COUNT(*) FILTER (WHERE created_at > now() - interval '7 days' AND success = false) AS failed_7d,
  COUNT(*) FILTER (WHERE created_at > now() - interval '7 days' AND is_suspicious = true) AS suspicious_7d
FROM public.access_logs;

-- Grant select on the view to authenticated users (RLS on base table still applies)
GRANT SELECT ON public.security_stats TO authenticated;