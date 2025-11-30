-- Tabella per prenotazioni appuntamenti
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  preferred_date timestamp with time zone NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  google_calendar_event_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabella per ordini libro
CREATE TABLE IF NOT EXISTS public.book_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  shipping_address text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending', -- pending, paid, shipped, completed
  paypal_transaction_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;

-- Policies per appointments (admin può vedere tutto, utenti possono creare)
CREATE POLICY "Anyone can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all appointments"
  ON public.appointments
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update appointments"
  ON public.appointments
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies per book_orders (stessa logica)
CREATE POLICY "Anyone can create book orders"
  ON public.book_orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON public.book_orders
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update orders"
  ON public.book_orders
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger per updated_at
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_book_orders_updated_at
  BEFORE UPDATE ON public.book_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();