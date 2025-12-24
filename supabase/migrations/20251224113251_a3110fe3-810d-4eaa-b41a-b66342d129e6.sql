-- Drop existing policies for appointments that we'll recreate
DROP POLICY IF EXISTS "Users can read own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;

-- Recreate policies with explicit authentication check
-- Users can only read their own appointments AND must be authenticated
CREATE POLICY "Users can read own appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can only create appointments for themselves AND must be authenticated
CREATE POLICY "Users can create own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Users can only update their own appointments AND must be authenticated
CREATE POLICY "Users can update own appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);