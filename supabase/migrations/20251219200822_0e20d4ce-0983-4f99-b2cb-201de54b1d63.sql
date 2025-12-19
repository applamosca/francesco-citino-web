-- Fix security definer view by dropping and recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.security_stats;

CREATE OR REPLACE VIEW public.security_stats
WITH (security_invoker = true)
AS
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