-- Create table for storing map-related images (icons, legends, etc.)
CREATE TABLE public.map_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.map_assets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view map assets"
ON public.map_assets
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert map assets"
ON public.map_assets
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update map assets"
ON public.map_assets
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete map assets"
ON public.map_assets
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));