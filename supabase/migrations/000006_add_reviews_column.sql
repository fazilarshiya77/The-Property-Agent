-- Add reviews column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
