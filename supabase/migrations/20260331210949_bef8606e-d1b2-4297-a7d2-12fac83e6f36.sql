
CREATE TABLE public.books (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  stock_physic integer NOT NULL DEFAULT 50,
  amazon_ebook_url text NOT NULL DEFAULT 'https://www.amazon.it/dp/B0XXXXXXXX',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Anyone can read books
CREATE POLICY "Anyone can read books" ON public.books
  FOR SELECT TO public USING (true);

-- Only admins can manage books
CREATE POLICY "Admins can manage books" ON public.books
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert the initial book record
INSERT INTO public.books (title, stock_physic, amazon_ebook_url)
VALUES ('La geometria segreta della mente', 50, 'https://www.amazon.it/dp/B0XXXXXXXX');
