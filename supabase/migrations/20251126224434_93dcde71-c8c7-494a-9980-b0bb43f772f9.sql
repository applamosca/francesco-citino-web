-- Create table for tracking site visits
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(visit_date)
);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read visit counts
CREATE POLICY "Anyone can read visit counts"
ON public.site_visits
FOR SELECT
USING (true);

-- Block direct inserts/updates from clients
CREATE POLICY "Block direct modifications"
ON public.site_visits
FOR ALL
USING (false);

-- Create function to increment visit count
CREATE OR REPLACE FUNCTION public.increment_visit_count()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.site_visits (visit_date, visit_count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET visit_count = site_visits.visit_count + 1;
END;
$$;

-- Grant execute permission to anon users
GRANT EXECUTE ON FUNCTION public.increment_visit_count() TO anon;