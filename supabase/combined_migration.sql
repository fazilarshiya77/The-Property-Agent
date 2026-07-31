-- =========================================================
-- TRISHNA PROPERTY MANAGEMENT - COMBINED CLIENT SUPABASE MIGRATION SCRIPT
-- Run this entire script in your client's Supabase SQL Editor
-- =========================================================

-- 1. CREATE PROPERTIES TABLE & TRIGGERS
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  area_name TEXT,
  price NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rent', 'sale')),
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  area NUMERIC,
  furnished TEXT CHECK (furnished IN ('fully', 'semi', 'unfurnished')),
  deposit TEXT,
  availability TEXT,
  floor TEXT,
  facing TEXT,
  amenities TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  description TEXT,
  contact_email TEXT,
  map_query TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
DROP POLICY IF EXISTS "Allow public full access" ON public.properties;

CREATE POLICY "Allow public read access" ON public.properties FOR SELECT TO public USING (true);
CREATE POLICY "Allow public full access" ON public.properties USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. CREATE ADMIN CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS public.admin_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to admin credentials" ON public.admin_credentials;
DROP POLICY IF EXISTS "Allow public insert/update to admin credentials" ON public.admin_credentials;

CREATE POLICY "Allow public read access to admin credentials" ON public.admin_credentials FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert/update to admin credentials" ON public.admin_credentials USING (true) WITH CHECK (true);

INSERT INTO public.admin_credentials (username, password_hash)
VALUES ('admin', '$2b$12$NvUfHTFIfa4yQOeaxbwAZOCL4CjcW2obdi2H2uyFiSa0zReETVvku')
ON CONFLICT (username) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, updated_at = NOW();

-- 3. CREATE STORAGE BUCKET FOR PROPERTY IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload" ON storage.objects;
DROP POLICY IF EXISTS "Public can update" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'properties');
CREATE POLICY "Public can upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'properties');
CREATE POLICY "Public can update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'properties');
CREATE POLICY "Public can delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'properties');

-- 4. CREATE KEEP-ALIVE TABLE
CREATE TABLE IF NOT EXISTS public.supabase_keep_alive (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pinged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.supabase_keep_alive ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert/read for keep alive" ON public.supabase_keep_alive;
CREATE POLICY "Allow public insert/read for keep alive" ON public.supabase_keep_alive FOR ALL TO public USING (true) WITH CHECK (true);
