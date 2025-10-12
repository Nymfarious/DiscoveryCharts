-- Create base_maps table for uploaded map images
CREATE TABLE public.base_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  region TEXT NOT NULL,
  source_url TEXT,
  license TEXT,
  attribution TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create overlays table for AI-generated transparent overlays
CREATE TABLE public.overlays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_map_id UUID REFERENCES public.base_maps(id) ON DELETE CASCADE NOT NULL,
  theme TEXT NOT NULL,
  year INT NOT NULL,
  file_path TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trusted_sources table to limit Q&A agent to vetted sources
CREATE TABLE public.trusted_sources (
  id SERIAL PRIMARY KEY,
  domain TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.base_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for base_maps
CREATE POLICY "Authenticated users can view base maps"
  ON public.base_maps FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert base maps"
  ON public.base_maps FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update base maps"
  ON public.base_maps FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete base maps"
  ON public.base_maps FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for overlays
CREATE POLICY "Authenticated users can view overlays"
  ON public.overlays FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert overlays"
  ON public.overlays FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update overlays"
  ON public.overlays FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete overlays"
  ON public.overlays FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for trusted_sources
CREATE POLICY "Everyone can view trusted sources"
  ON public.trusted_sources FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage trusted sources"
  ON public.trusted_sources FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create storage buckets for base maps and overlays
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('base_maps', 'base_maps', true),
  ('overlays', 'overlays', true);

-- Storage policies for base_maps bucket
CREATE POLICY "Anyone can view base maps"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'base_maps');

CREATE POLICY "Admins can upload base maps"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'base_maps' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update base maps"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'base_maps' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete base maps"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'base_maps' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for overlays bucket
CREATE POLICY "Anyone can view overlays"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'overlays');

CREATE POLICY "Admins can upload overlays"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'overlays' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update overlays"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'overlays' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete overlays"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'overlays' AND has_role(auth.uid(), 'admin'::app_role));

-- Seed some default trusted sources
INSERT INTO public.trusted_sources (domain, label) VALUES
  ('britannica.com', 'Encyclopædia Britannica'),
  ('wikipedia.org', 'Wikipedia'),
  ('loc.gov', 'Library of Congress'),
  ('archive.org', 'Internet Archive'),
  ('davidrumsey.com', 'David Rumsey Map Collection');
