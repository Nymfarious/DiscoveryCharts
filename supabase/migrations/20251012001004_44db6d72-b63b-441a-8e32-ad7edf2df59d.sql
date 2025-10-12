-- Add secondary_email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS secondary_email text;