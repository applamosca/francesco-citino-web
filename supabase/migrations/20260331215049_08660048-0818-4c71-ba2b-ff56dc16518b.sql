
-- 1. Add explicit deny policies on user_roles for INSERT/UPDATE/DELETE
CREATE POLICY "Block user role self-assignment"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block role updates"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Block role deletion"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (false);

-- 2. Replace permissive contact_messages INSERT policy with a blocking one
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.contact_messages;

CREATE POLICY "Block direct client inserts on contact_messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

-- 3. Enable pgcrypto extension for OTP hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;
