-- Add DELETE policy for admins on appointments table
CREATE POLICY "Admins can delete appointments" 
ON public.appointments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'));