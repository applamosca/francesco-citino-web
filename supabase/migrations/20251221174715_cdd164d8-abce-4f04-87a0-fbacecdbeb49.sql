-- Fix contact_messages RLS policies - ensure only admins can read
-- Drop existing restrictive policies and recreate as permissive

DROP POLICY IF EXISTS "Admins can read all messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;

-- Recreate as permissive policies for proper access control
CREATE POLICY "Admins can read all messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Fix appointments RLS policies - ensure NULL user_id appointments are only visible to admins
DROP POLICY IF EXISTS "Users can read own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can create appointments for anyone" ON public.appointments;

-- Admins can do everything
CREATE POLICY "Admins can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Users can only see their own appointments (user_id must match, not NULL)
CREATE POLICY "Users can read own appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only update their own appointments
CREATE POLICY "Users can update own appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can only create appointments for themselves (user_id required, must match auth.uid())
CREATE POLICY "Users can create own appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());