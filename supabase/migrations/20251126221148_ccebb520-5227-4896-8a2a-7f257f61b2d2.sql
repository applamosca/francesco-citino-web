-- Fix security issue: Block all direct updates from clients
-- Only allow updates through admin edge function

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can update content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can insert content" ON public.site_content;

-- Keep read-only access for everyone
-- Already exists: "Anyone can read site content"

-- Block all direct writes from clients
-- Updates will only be possible through the admin edge function
CREATE POLICY "Block direct updates from clients"
  ON public.site_content
  FOR UPDATE
  USING (false);

CREATE POLICY "Block direct inserts from clients"
  ON public.site_content
  FOR INSERT
  WITH CHECK (false);