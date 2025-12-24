-- Drop the existing view
DROP VIEW IF EXISTS public.security_stats;

-- Create a security definer function that only admins can call
CREATE OR REPLACE FUNCTION public.get_security_stats()
RETURNS TABLE (
  attempts_24h bigint,
  successful_24h bigint,
  failed_24h bigint,
  suspicious_24h bigint,
  unique_ips_24h bigint,
  attempts_7d bigint,
  failed_7d bigint,
  suspicious_7d bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    count(*) FILTER (WHERE created_at > (now() - '24:00:00'::interval)) AS attempts_24h,
    count(*) FILTER (WHERE created_at > (now() - '24:00:00'::interval) AND success = true) AS successful_24h,
    count(*) FILTER (WHERE created_at > (now() - '24:00:00'::interval) AND success = false) AS failed_24h,
    count(*) FILTER (WHERE created_at > (now() - '24:00:00'::interval) AND is_suspicious = true) AS suspicious_24h,
    count(DISTINCT ip_address) FILTER (WHERE created_at > (now() - '24:00:00'::interval)) AS unique_ips_24h,
    count(*) FILTER (WHERE created_at > (now() - '7 days'::interval)) AS attempts_7d,
    count(*) FILTER (WHERE created_at > (now() - '7 days'::interval) AND success = false) AS failed_7d,
    count(*) FILTER (WHERE created_at > (now() - '7 days'::interval) AND is_suspicious = true) AS suspicious_7d
  FROM access_logs
  WHERE public.has_role(auth.uid(), 'admin');
$$;