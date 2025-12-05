-- Create services table for therapy types
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create availability_settings table for doctor's schedule
CREATE TABLE public.availability_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

-- Create profiles table for patient data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add service_id and user_id to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- Enable RLS on new tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Services policies (public read, admin write)
CREATE POLICY "Anyone can read active services" ON public.services
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON public.services
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Availability policies (public read, admin write)
CREATE POLICY "Anyone can read availability" ON public.availability_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage availability" ON public.availability_settings
FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- Update appointments policies for user access
CREATE POLICY "Users can read own appointments" ON public.appointments
FOR SELECT USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own appointments" ON public.appointments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments" ON public.appointments
FOR UPDATE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_availability_updated_at
BEFORE UPDATE ON public.availability_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default availability (Mon-Fri 9:00-18:00)
INSERT INTO public.availability_settings (day_of_week, start_time, end_time, is_available)
VALUES 
  (1, '09:00', '18:00', true),
  (2, '09:00', '18:00', true),
  (3, '09:00', '18:00', true),
  (4, '09:00', '18:00', true),
  (5, '09:00', '18:00', true),
  (0, '09:00', '18:00', false),
  (6, '09:00', '18:00', false);

-- Insert sample services (can be modified by admin later)
INSERT INTO public.services (name, description, duration_minutes, price, is_active)
VALUES 
  ('Terapia Individuale', 'Percorso di supporto psicologico personalizzato', 60, 70.00, true),
  ('Ipnosi Clinica', 'Sessione di ipnosi terapeutica', 60, 80.00, true),
  ('Consulenza Online', 'Consulenza psicologica in videochiamata', 45, 60.00, true);