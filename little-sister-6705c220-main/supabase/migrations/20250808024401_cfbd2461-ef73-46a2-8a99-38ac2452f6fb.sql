-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-images', 'recipe-images', true);

-- Create RLS policies for recipe images
CREATE POLICY "Recipe images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can upload recipe images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Users can update recipe images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can delete recipe images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'recipe-images');