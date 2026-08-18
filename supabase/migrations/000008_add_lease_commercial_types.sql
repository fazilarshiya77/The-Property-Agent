-- Migration: Update type constraint to support 'lease' and 'commercial'
-- Run this in your Supabase SQL Editor

-- 1. Drop existing type constraint if present
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;

-- 2. Add updated type constraint allowing rent, sale, lease, and commercial
ALTER TABLE public.properties ADD CONSTRAINT properties_type_check 
  CHECK (type IN ('rent', 'sale', 'lease', 'commercial'));

-- 3. Ensure reviews and videos columns are present
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';
