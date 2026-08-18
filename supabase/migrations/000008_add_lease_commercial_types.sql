-- Migration: Update types, columns, and Storage bucket for video uploads
-- Run this in your Supabase SQL Editor

-- 1. Drop existing type constraint if present
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_type_check;

-- 2. Add updated type constraint allowing rent, sale, lease, and commercial
ALTER TABLE public.properties ADD CONSTRAINT properties_type_check 
  CHECK (type IN ('rent', 'sale', 'lease', 'commercial'));

-- 3. Ensure reviews and videos columns are present
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}';

-- 4. Create or update 'properties' storage bucket with video upload support (100MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'properties',
  'properties',
  true,
  104857600, -- 100MB limit for high-res images and video walkthroughs
  ARRAY['image/*', 'video/*']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600;

-- 5. Storage RLS Policies for properties bucket (Read, Upload, Update, Delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'properties');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can upload' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public can upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'properties');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can update' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public can update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'properties');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can delete' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public can delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'properties');
  END IF;
END $$;

