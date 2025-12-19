-- Fix scheduled_facebook_posts: add explicit deny for non-admins
-- The existing "ALL" policy for admins is fine, but we need to ensure no default access

-- Drop and recreate with explicit SELECT policy
DROP POLICY IF EXISTS "Admins can manage scheduled posts" ON public.scheduled_facebook_posts;

-- Create separate policies for each operation (more secure than ALL)
CREATE POLICY "Only admins can select scheduled posts" 
ON public.scheduled_facebook_posts 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert scheduled posts" 
ON public.scheduled_facebook_posts 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update scheduled posts" 
ON public.scheduled_facebook_posts 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete scheduled posts" 
ON public.scheduled_facebook_posts 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix ai_post_logs: remove overly permissive INSERT policy
DROP POLICY IF EXISTS "Service role can insert ai_post_logs" ON public.ai_post_logs;

-- Service role bypasses RLS anyway, so no explicit policy needed for edge functions
-- Add explicit admin-only policies
CREATE POLICY "Only admins can insert ai_post_logs" 
ON public.ai_post_logs 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update ai_post_logs" 
ON public.ai_post_logs 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete ai_post_logs" 
ON public.ai_post_logs 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));