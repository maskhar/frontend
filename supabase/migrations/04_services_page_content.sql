-- supabase/migrations/04_services_page_content.sql

-- 1. Create the main_services table
CREATE TABLE public.main_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    icon_name text, -- To store the name of the lucide-react icon
    display_order integer DEFAULT 0
);

-- 2. Enable RLS for main_services
ALTER TABLE public.main_services ENABLE ROW LEVEL SECURITY;

-- 3. Create public read policy for main_services
CREATE POLICY "Allow public read access to main services" ON public.main_services
    FOR SELECT USING (true);

-- 4. Create the how_it_works_steps table
CREATE TABLE public.how_it_works_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    step_number text,
    title text NOT NULL,
    description text,
    display_order integer DEFAULT 0
);

-- 5. Enable RLS for how_it_works_steps
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;

-- 6. Create public read policy for how_it_works_steps
CREATE POLICY "Allow public read access to how_it_works_steps" ON public.how_it_works_steps
    FOR SELECT USING (true);

-- 7. Insert data into main_services from the static content
INSERT INTO public.main_services (title, description, icon_name, display_order)
VALUES
    ('Distribusi Musik', 'Unggah musik Anda ke 100+ platform digital di seluruh dunia dengan mudah dan cepat.', 'Upload', 1),
    ('Perlindungan Hak Cipta', 'Lindungi karya musik Anda dengan sistem pengelolaan hak cipta yang komprehensif.', 'Shield', 2),
    ('Royalti Management', 'Kelola dan terima pembayaran royalti dari semua platform streaming dengan transparan.', 'DollarSign', 3),
    ('Analytics & Reporting', 'Pantau performa musik Anda dengan dashboard analytics yang lengkap.', 'BarChart3', 4),
    ('ISRC & UPC Gratis', 'Dapatkan kode ISRC dan UPC untuk setiap rilisan musik Anda secara gratis.', 'FileCheck', 5),
    ('Quality Control', 'Tim kami memastikan kualitas audio dan metadata musik Anda sesuai standar industri.', 'Headphones', 6),
    ('Artist Support', 'Dukungan penuh dari tim kami untuk membantu perjalanan karir musik Anda.', 'Users', 7),
    ('Fast Delivery', 'Proses distribusi cepat, musik Anda dapat live dalam 24-48 jam.', 'Send', 8);

-- 8. Insert data into how_it_works_steps from the static content
INSERT INTO public.how_it_works_steps (step_number, title, description, display_order)
VALUES
    ('01', 'Daftar', 'Buat akun dan lengkapi profil artis Anda', 1),
    ('02', 'Upload', 'Unggah file musik dan isi informasi rilisan', 2),
    ('03', 'Review', 'Tim kami akan mereview kualitas audio & metadata', 3),
    ('04', 'Distribute', 'Musik Anda live di 100+ platform digital', 4);

-- 9. Add comments to the tables for clarity
COMMENT ON TABLE public.main_services IS 'Stores the main service offerings displayed on the /services page.';
COMMENT ON TABLE public.how_it_works_steps IS 'Stores the steps for the "How It Works" section on the /services page.';
