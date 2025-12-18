
-- Remove the overly permissive "Anyone can create appointments" policy
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;

-- Update the "Users can create own appointments" policy to allow authenticated users
-- They must provide their own user_id or create appointments without user_id (for guest bookings that will be reviewed)
DROP POLICY IF EXISTS "Users can create own appointments" ON public.appointments;

-- Create a secure policy that allows authenticated users to create their own appointments
CREATE POLICY "Authenticated users can create appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User must be authenticated and either:
  -- 1. The user_id matches their auth.uid()
  -- 2. OR user_id is null (for guest booking that admin will review)
  auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid())
);

-- Add a policy for admins to create appointments on behalf of users
CREATE POLICY "Admins can create appointments for anyone" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
);
