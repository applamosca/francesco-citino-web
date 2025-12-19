-- Create content_topics table for AI post generation themes
CREATE TABLE public.content_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage topics"
ON public.content_topics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read active topics"
ON public.content_topics
FOR SELECT
USING (is_active = true);

-- Insert default topics
INSERT INTO public.content_topics (name, description) VALUES
  ('Benefici dell''ipnosi', 'Esplora i benefici terapeutici dell''ipnosi clinica per il benessere mentale e fisico'),
  ('Gestione dell''ansia', 'Tecniche e strategie per gestire l''ansia attraverso l''ipnosi e approcci integrati'),
  ('Neuroscienze e ipnosi', 'Il legame tra neuroscienze moderne e pratiche ipnotiche'),
  ('Miti sull''ipnosi', 'Sfatare i miti comuni sull''ipnosi con informazioni scientifiche'),
  ('Miglioramento personale', 'Come l''ipnosi può aiutare nella crescita personale e nel raggiungimento degli obiettivi'),
  ('Gestione del dolore', 'L''uso dell''ipnosi nella gestione del dolore cronico e acuto'),
  ('Sonno e rilassamento', 'Tecniche di ipnosi per migliorare la qualità del sonno'),
  ('Abitudini e comportamenti', 'Trasformare abitudini negative attraverso l''ipnosi');

-- Add trigger for updated_at
CREATE TRIGGER update_content_topics_updated_at
BEFORE UPDATE ON public.content_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();