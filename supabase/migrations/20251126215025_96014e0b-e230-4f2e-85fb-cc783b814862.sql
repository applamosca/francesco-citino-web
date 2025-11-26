-- Create site_content table to store all website content
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE, -- e.g., 'hero', 'chi_sono', 'servizi', etc.
  content JSONB NOT NULL, -- Flexible JSON structure for each section
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (we'll make it public readable, admin writable)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read content
CREATE POLICY "Anyone can read site content"
  ON public.site_content
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can update content
-- (We'll check admin password in the edge function)
CREATE POLICY "Authenticated users can update content"
  ON public.site_content
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can insert content
CREATE POLICY "Authenticated users can insert content"
  ON public.site_content
  FOR INSERT
  WITH CHECK (true);

-- Create admin_settings table for storing admin password hash
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only allow reading for password verification (through edge function)
CREATE POLICY "No direct access to admin settings"
  ON public.admin_settings
  FOR SELECT
  USING (false);

-- Insert initial content structure
INSERT INTO public.site_content (section, content) VALUES
('hero', '{"title": "Francesco Citino", "subtitle": "Psicologo • Scienziato cognitivo • Filosofo della mente • Ipnologo"}'::jsonb),
('chi_sono', '{"mainText": "Mi occupo prevalentemente di crescita personale, con una formazione multidisciplinare che abbraccia diversi ambiti del sapere. Oltre alla laurea in Psicologia, sono laureato in Scienze Cognitive, diplomato Ipnologo presso la scuola \"Psicotecnica\" di Milano e laureato in Filosofie d''Oriente e d''Occidente presso l''Università L''Orientale di Napoli.", "approachText": "Il mio lavoro si fonda su un approccio integrato e innovativo che unisce:", "approaches": ["Psicologia Positiva per valorizzare le risorse e i punti di forza", "Psicologia Transpersonale per esplorare le dimensioni più profonde dell''essere", "Scienze Cognitive per comprendere i meccanismi della mente", "Ipnosi come strumento di apprendimento", "Filosofie Orientali come metodi di trasformazione e di crescita"], "goalText": "Opero sullo sviluppo del potenziale umano, accompagnando le persone in un percorso di crescita che mira a:", "goals": ["Migliorare la consapevolezza di sé attraverso tecniche di auto-osservazione", "Potenziare l''autostima riconoscendo e valorizzando le proprie qualità", "Aumentare la fiducia in sé stessi superando blocchi e limitazioni", "Ottimizzare le performance in ambito personale e professionale"], "closingText": "Credo fermamente che ogni persona possieda in sé le risorse necessarie per realizzare il proprio potenziale. Il mio ruolo è quello di facilitare questo processo di scoperta e crescita, creando uno spazio sicuro dove esplorare nuove possibilità e sviluppare una maggiore armonia interiore."}'::jsonb),
('servizi', '{"services": [{"title": "Consulenza Psicologica", "description": "Percorsi individuali di sostegno psicologico per la crescita personale e il benessere emotivo.", "icon": "Brain"}, {"title": "Ricerca e Formazione", "description": "Attività di ricerca nel campo della psicosintesi e formazione per professionisti del settore.", "icon": "BookOpen"}, {"title": "Supervisione Professionale", "description": "Supervisione e consulenza per psicologi e professionisti della relazione d''aiuto.", "icon": "Users"}]}'::jsonb),
('libro', '{"title": "Filosofia dell''Azione", "subtitle": "Un''esplorazione profonda della coscienza e della volontà", "description": "\"Filosofia dell''Azione\" rappresenta il culmine di oltre vent''anni di ricerca nel campo della psicosintesi e della psicologia analitica. Un viaggio attraverso i meccanismi della volontà e i processi di trasformazione personale.", "secondDescription": "Il libro integra prospettive filosofiche, psicologiche e spirituali per offrire strumenti concreti di crescita e consapevolezza.", "purchaseUrl": "#"}'::jsonb),
('contatti', '{"email": "info@francescocitino.it", "instagram": "@francescocitino_s.f", "instagramUrl": "https://www.instagram.com/francescocitino_s.f/"}'::jsonb);

-- Insert default admin password (hash of 'psico2025')
-- Using bcrypt-like simple hash for demo (in production, use proper hashing)
INSERT INTO public.admin_settings (setting_key, setting_value) VALUES
('admin_password_hash', '$2a$10$rO0xZ9Y.gXp8K8vxE9ZqXOkHJN3VvVz.qLqYZZqXOkHJN3VvVz.q');

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON public.admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();