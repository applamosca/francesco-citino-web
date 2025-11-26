-- Create enum for article status
CREATE TYPE public.article_status AS ENUM ('draft', 'published');

-- Create categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create blog articles table
CREATE TABLE public.blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  status article_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create article_tags junction table
CREATE TABLE public.blog_article_tags (
  article_id UUID REFERENCES public.blog_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Create contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
CREATE POLICY "Anyone can read categories"
  ON public.blog_categories FOR SELECT
  USING (true);

CREATE POLICY "Block direct modifications"
  ON public.blog_categories FOR ALL
  USING (false);

-- RLS Policies for blog_tags
CREATE POLICY "Anyone can read tags"
  ON public.blog_tags FOR SELECT
  USING (true);

CREATE POLICY "Block direct modifications"
  ON public.blog_tags FOR ALL
  USING (false);

-- RLS Policies for blog_articles
CREATE POLICY "Anyone can read published articles"
  ON public.blog_articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Block direct modifications"
  ON public.blog_articles FOR ALL
  USING (false);

-- RLS Policies for blog_article_tags
CREATE POLICY "Anyone can read article tags"
  ON public.blog_article_tags FOR SELECT
  USING (true);

CREATE POLICY "Block direct modifications"
  ON public.blog_article_tags FOR ALL
  USING (false);

-- RLS Policies for contact_messages
CREATE POLICY "Anyone can insert messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Block read/update/delete"
  ON public.contact_messages FOR ALL
  USING (false);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Block direct upload"
  ON storage.objects FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block direct update"
  ON storage.objects FOR UPDATE
  USING (false);

CREATE POLICY "Block direct delete"
  ON storage.objects FOR DELETE
  USING (false);

-- Triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();