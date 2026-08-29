-- ===================================================================
-- DSP Precision Products - COMPLETE ONE-CLICK SETUP
-- Creates all tables, security policies, and default data
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

-- 9. Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to technical_content" ON public.technical_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access to page_contents" ON public.page_contents FOR SELECT USING (true);
CREATE POLICY "Allow public read access to media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow public insert to enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all access to service_role on admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on technical_content" ON public.technical_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on page_contents" ON public.page_contents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on enquiries" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to service_role on media" ON public.media FOR ALL USING (true) WITH CHECK (true);

-- 10. Insert Default Admin (Login: admin / Admin@12345)
INSERT INTO public.admins (username, email, password, role, name)
VALUES (
  'admin',
  'admin@dspballs.in',
  '$2a$10$w8T0iZpGq6RkXQj3J8M7OuF6fU0rE9J2m7H6j1S4x3d5V8a7b9c1.', -- Admin@12345
  'admin',
  'Super Admin'
)
ON CONFLICT (username) DO NOTHING;

-- 11. Insert Products
INSERT INTO public.products (slug, title, short, description, image_url, highlights, grades, specs, tables, "order", published)
VALUES
(
  'steel-balls',
  'High Carbon & Chrome Steel Balls',
  'High precision balls for bearings, automotive components and industrial assemblies.',
  'DSP produces chrome steel balls (AISI 52100 / 100Cr6) with superior surface finish, uniform hardness, and high dimensional accuracy for high-load, high-speed applications.',
  '/images/products/chrome-steel-balls.jpg',
  '["Exceptional wear resistance", "Through-hardened for uniform strength", "Mirror surface finish up to Ra 0.012 µm", "Available in AFBMA Grades 10 to 1000"]'::jsonb,
  '["AISI 52100", "100Cr6", "En31", "SUJ-2", "Grade 10 / 25 / 50 / 100 / 200"]'::jsonb,
  '[{"label": "Hardness", "value": "HRC 60 – 66"}, {"label": "Diameter range", "value": "0.5 mm to 50.8 mm (1/64\" to 2\")"}, {"label": "Standard", "value": "ISO 3290-1 / DIN 5401 / AFBMA"}]'::jsonb,
  '[]'::jsonb,
  0,
  true
),
(
  'stainless-steel-balls',
  'Stainless Steel Balls',
  'Corrosion-resistant precision balls in austenitic, martensitic, and ferritic grades.',
  'Ideal for valves, pumps, medical devices, food processing machinery, and marine hardware where resistance to chemical attack and environmental corrosion is essential.',
  '/images/products/stainless-steel-balls.jpg',
  '["AISI 316 / 316L for chemical resistance", "AISI 304 / 302 for general corrosion resistance", "AISI 420 / 440C for high hardness and moderate corrosion resistance", "Passivated for enhanced corrosion protection"]'::jsonb,
  '["AISI 304", "AISI 316", "AISI 316L", "AISI 420", "AISI 440C", "AISI 430"]'::jsonb,
  '[{"label": "Grades", "value": "AISI 304, 316, 316L, 420, 440C"}, {"label": "Hardness (440C)", "value": "HRC 58 – 65"}, {"label": "Hardness (316)", "value": "HRC 25 – 39 (Work hardened)"}]'::jsonb,
  '[]'::jsonb,
  1,
  true
),
(
  'carbide-balls',
  'Tungsten Carbide Balls',
  'Extreme hardness, wear resistance and compressive strength for high-stress applications.',
  'Manufactured from premium sintered tungsten carbide with cobalt or nickel binder, providing unmatched dimensional stability under severe pressure, abrasion, and temperature.',
  '/images/products/tungsten-carbide-balls.jpg',
  '["Hardness exceeding HRA 90", "High resistance to abrasion, impact and corrosion", "Nickel binder available for acid and corrosive environments", "Precision grade 5 to 50"]'::jsonb,
  '["TC 6% Co", "TC 8% Co", "TC 9% Ni", "TC 6% Ni (Corrosion resistant)"]'::jsonb,
  '[{"label": "Hardness", "value": "HRA 89 – 92"}, {"label": "Density", "value": "14.95 – 15.05 g/cm³"}, {"label": "Applications", "value": "Flowmeters, valves, gauging, coining"}]'::jsonb,
  '[]'::jsonb,
  2,
  true
),
(
  'ceramic-balls',
  'Ceramic Balls (Silicon Nitride & Zirconia)',
  'Non-conductive, ultra-lightweight and high-temperature balls for hybrid bearings.',
  'Silicon Nitride (Si3N4), Zirconia (ZrO2), and Alumina (Al2O3) balls offer 60% lower density than steel, zero electrical conductivity, and high resistance to thermal shock.',
  '/images/products/ceramic-balls.jpg',
  '["60% lighter than steel balls", "Electrically insulating and non-magnetic", "Operates up to 1000°C without lubrication degradation", "Low friction coefficient for ultra-high-speed spindles"]'::jsonb,
  '["Silicon Nitride (Si3N4)", "Zirconia (ZrO2)", "Alumina Oxide (Al2O3)"]'::jsonb,
  '[{"label": "Hardness (Si3N4)", "value": "HV 1600 – 1800"}, {"label": "Density", "value": "3.16 – 3.24 g/cm³"}, {"label": "Dielectric strength", "value": "Non-conductive"}]'::jsonb,
  '[]'::jsonb,
  3,
  true
),
(
  'brass-copper-balls',
  'Brass & Copper Balls',
  'Non-sparking, electrically conductive and corrosion-resistant precision balls.',
  'Used in electrical switchgear, safety equipment, valves, musical instruments, and decorative hardware where electrical conductivity, spark resistance or aesthetic finish is required.',
  '/images/products/brass-copper-balls.jpg',
  '["High electrical and thermal conductivity", "Non-sparking characteristics for hazardous environments", "Resistant to water and atmospheric corrosion", "Easy to machine and solder"]'::jsonb,
  '["CuZn37 (Brass)", "CuZn39Pb3", "Electrolytic Copper (99.9% Cu)", "Phosphor Bronze"]'::jsonb,
  '[{"label": "Hardness", "value": "HRB 75 – 87"}, {"label": "Electrical conductivity", "value": "High"}, {"label": "Diameter range", "value": "1.0 mm to 38.1 mm"}]'::jsonb,
  '[]'::jsonb,
  4,
  true
),
(
  'gauge-balls',
  'Precision Gauge & Calibration Balls',
  'Ultra-precision calibration and measurement balls for metrology and CMM inspection.',
  'DSP precision gauge balls are manufactured with spherical tolerances down to Grade 3 and Grade 5 for coordinate measuring machines, micrometer calibration, and bore gauging.',
  '/images/products/gauge-balls.jpg',
  '["Spherical accuracy within 0.08 µm", "Certified calibration traceability available", "Manufactured in Tungsten Carbide or 52100 Chrome Steel", "Supplied in matched sets or master reference sets"]'::jsonb,
  '["Grade 3", "Grade 5", "Grade 10", "Tungsten Carbide", "Chrome Steel 52100"]'::jsonb,
  '[{"label": "Sphericity", "value": "0.08 µm (Grade 3)"}, {"label": "Diameter tolerance", "value": "±0.13 µm"}, {"label": "Certification", "value": "NABL / ISO calibration traceable"}]'::jsonb,
  '[]'::jsonb,
  5,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- 12. Insert Site Settings
INSERT INTO public.site_settings (
  key, name, short_name, tagline, email, phone_work, phone_regd, phone_fax, mobile, whatsapp,
  work_office, regd_office, highlights, nav_links, hero_slides, seo_title, seo_description
)
VALUES (
  'main',
  'DSP Precision Products Pvt. Ltd.',
  'DSP Precision',
  'Manufacturer & Exporter of Precision Balls & Allied Products',
  'sales@dspballs.in',
  '+91-1795-246364',
  '+91-11-43052555',
  '+91-11-22784802',
  '+91 9313009966',
  '+919313009966',
  '{"label": "Baddi Plant (Works)", "lines": ["18, Industrial Estate, Baddi", "Dist. Solan – 173205, Himachal Pradesh, India", "Phone: +91-1795-246364"]}'::jsonb,
  '{"label": "Delhi Registered Office", "lines": ["E-373, Mayur Vihar, Phase-II", "Delhi – 110091, India", "Phone: +91-11-43052555", "Mobile: +91 9313009966"]}'::jsonb,
  '[{"label": "Established", "value": "1995"}, {"label": "Experience", "value": "25+ Yrs"}, {"label": "Standards", "value": "ISO 9001"}, {"label": "Ratings", "value": "90%+ Quality"}]'::jsonb,
  '[{"href": "/", "label": "Home", "order": 0}, {"href": "/about", "label": "About Us", "order": 1}, {"href": "/products", "label": "Products", "order": 2}, {"href": "/quality", "label": "Quality", "order": 3}, {"href": "/technical", "label": "Technical", "order": 4}, {"href": "/clients", "label": "Clients", "order": 5}, {"href": "/network", "label": "Network", "order": 6}, {"href": "/contact", "label": "Contact Us", "order": 7}]'::jsonb,
  '[{"desktopUrl": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80", "mobileUrl": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=80", "headline": "World-Class Precision Balls Since 1995", "subline": "Engineered to perfection at our Baddi plant for bearings, gauging, and global industry.", "order": 0}]'::jsonb,
  'DSP Precision Products Pvt. Ltd. | Precision Balls Manufacturer & Exporter India',
  'DSP Precision Products Pvt. Ltd. — Leading manufacturer & exporter of AFBMA, DIN & ISO precision steel, stainless steel, carbide, ceramic, brass, copper and gauge balls from Baddi, Himachal Pradesh, India.'
)
ON CONFLICT (key) DO NOTHING;
