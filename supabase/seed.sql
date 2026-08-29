-- ===================================================================
-- DSP Precision Products - Complete Initial Data Seed
-- ===================================================================

-- 1. Insert Default Admin (Password: Admin@12345)
INSERT INTO public.admins (username, email, password, role, name)
VALUES (
  'admin',
  'admin@dspballs.in',
  '$2a$10$tZ2yDk7cRz1r2uQ7Dq4gNuV5P0bY8R2d4OqKk3vQ1Z5r6o7s8t9u.', -- Admin@12345
  'admin',
  'Super Admin'
)
ON CONFLICT (username) DO NOTHING;

-- 2. Insert Products
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
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  short = EXCLUDED.short,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  highlights = EXCLUDED.highlights,
  grades = EXCLUDED.grades,
  specs = EXCLUDED.specs;

-- 3. Insert Site Settings
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
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  email = EXCLUDED.email;
