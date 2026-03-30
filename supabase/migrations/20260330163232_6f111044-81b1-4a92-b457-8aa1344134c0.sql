-- Remove blocked_ips from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.blocked_ips;