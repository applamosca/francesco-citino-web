-- Crea tabella per lo storico dei post AI generati
CREATE TABLE public.ai_post_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID REFERENCES public.content_topics(id) ON DELETE SET NULL,
  topic_name TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'professionale',
  published BOOLEAN NOT NULL DEFAULT false,
  facebook_post_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_post_logs ENABLE ROW LEVEL SECURITY;

-- Policy: solo admin possono leggere
CREATE POLICY "Admins can read ai_post_logs" 
ON public.ai_post_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Policy: inserimento via service role (edge function)
CREATE POLICY "Service role can insert ai_post_logs" 
ON public.ai_post_logs 
FOR INSERT 
WITH CHECK (true);

-- Aggiungi colonna tone alla tabella content_topics per stile predefinito
ALTER TABLE public.content_topics 
ADD COLUMN IF NOT EXISTS default_tone TEXT DEFAULT 'professionale';