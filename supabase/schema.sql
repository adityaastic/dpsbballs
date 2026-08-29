-- ===================================================================
-- Supabase Schema for DSP Precision Products
-- Project: https://yvhikjqcvowhpxqvkbfx.supabase.co
-- ===================================================================

-- 1. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short TEXT,
  description TEXT,
  image_url TEXT,
  highlights JSONB DEFAULT '[]'::jsonb,
  grades JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '[]'::jsonb,
  tables JSONB DEFAULT '[]'::jsonb,
  "order" INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL DEFAULT 'main',
  name TEXT NOT NULL,
  short_name TEXT,
  tagline TEXT,
  logo_url TEXT DEFAULT '',
  logo_dark_url TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  email TEXT,
  phone_work TEXT,
  phone_regd TEXT,
  phone_fax TEXT,
  mobile TEXT,
  whatsapp TEXT DEFAULT '',
  work_office JSONB,
  regd_office JSONB,
  highlights JSONB DEFAULT '[]'::jsonb,
  nav_links JSONB DEFAULT '[]'::jsonb,
  hero_slides JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Technical Content Table
CREATE TABLE IF NOT EXISTS public.technical_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL DEFAULT 'main',
  manufacturing_process JSONB DEFAULT '[]'::jsonb,
  material_comparison JSONB,
  client_testimonials JSONB DEFAULT '[]'::jsonb,
  ceramic_compare JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Page Contents Table
CREATE TABLE IF NOT EXISTS public.page_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  hero_eyebrow TEXT,
  hero_title TEXT,
  hero_description TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  body_html TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'contact',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  country TEXT,
  subject TEXT,
  message TEXT,
  product_interest TEXT,
  quantity TEXT,
  size TEXT,
  grade TEXT,
  application TEXT,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Media Table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT,
  url TEXT NOT NULL,
  path TEXT,
  mime_type TEXT,
  size BIGINT,
  folder TEXT DEFAULT 'general',
  alt TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Row Level Security (RLS) policies
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Allow public read access to content tables
CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to technical_content" ON public.technical_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access to page_contents" ON public.page_contents FOR SELECT USING (true);
CREATE POLICY "Allow public read access to media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow public insert to enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Allow service role / admin all access
CREATE POLICY "Allow all access to service_role on admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on technical_content" ON public.technical_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on page_contents" ON public.page_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on enquiries" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on media" ON public.media FOR ALL USING (true) WITH CHECK (true);

-- 10. Storage Bucket Setup (Storage bucket: 'media')
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Allow public read on media storage bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated/service upload on media storage bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

CREATE POLICY "Allow authenticated/service update on media storage bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media');

CREATE POLICY "Allow authenticated/service delete on media storage bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');
