-- Drop the table only if it exists, to avoid errors
DROP TABLE IF EXISTS public.plans;

-- 1. Create the "plans" table
CREATE TABLE public.plans (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT,
    period TEXT,
    description TEXT,
    features JSONB,
    popular BOOLEAN DEFAULT false,
    display_order INTEGER,
    CONSTRAINT plans_pkey PRIMARY KEY (id)
);

-- 2. Enable RLS on the table
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for the "plans" table
CREATE POLICY "Allow read access to everyone"
ON public.plans
FOR SELECT
USING (true);

-- NOTE: We will rely on the service_role key for admin actions (insert, update, delete)
-- by not creating policies for them. This is more secure for now.

-- 4. Insert the data for "Titip Edar"
INSERT INTO public.plans (category, name, price, period, description, features, popular, display_order)
VALUES
('titip_edar', 'Single', 'Rp 50.000', '/lagu', 'Untuk artis pemula yang baru memulai', '["Distribusi ke 100+ platform", "1 rilisan per lagu", "ISRC & UPC gratis", "Dashboard analytics lengkap", "Email support", "Priority support", "Royalty split", "Pre-save links", "Sistem pembagian royalti 70:30"]', false, 1),
('titip_edar', 'EP', 'Rp 100.000', '/EP', 'Untuk artis yang serius berkarir', '["Distribusi ke 100+ platform", "4-6 lagu per EP", "masimal durasi 20-30 Menit", "ISRC & UPC gratis", "Dashboard analytics lengkap", "Priority support", "Royalty split", "Pre-save links", "Sistem pembagian royalti 70:30"]', false, 2),
('titip_edar', 'Album', 'Rp 100.000', '/album', 'Untuk artis yang serius berkarir', '["Distribusi ke 100+ platform", "10 Lagu per Album", "ISRC & UPC gratis", "Dashboard analytics lengkap", "Priority support", "Royalty split", "Pre-save links", "Sistem pembagian royalti 70:30"]', false, 3);

-- 5. Insert the data for "Hak Cipta"
INSERT INTO public.plans (category, name, price, period, description, features, popular, display_order)
VALUES
('hak_cipta', 'Hak Cipta - Digital', 'Rp 100.000', '/3 tahun', 'Lindungi karya Anda dengan Content ID dan sistem proteksi kami.', '["Perlindungan Content ID di YouTube", "Manajemen klaim hak cipta", "Laporan analitik pelanggaran", "Pemantauan pelanggaran", "Integrasi platform distribusi", "Sistem pembagian royalti 70:30"]', false, 1),
('hak_cipta', 'Hak Cipta - PDKI', 'Rp 1 Jt', '/10 tahun', 'Pendaftaran resmi ke pangkalan data kekayaan intelektual.', '["Sertifikat resmi PDKI", "Dukungan hukum dasar", "Konsultasi ahli hak cipta", "Pembaruan reguler", "Akses sumber daya edukasi", "Sistem pembagian royalti 70:30"]', false, 2),
('hak_cipta', 'Hak Cipta - Direct License', 'Rp 100.000', '/tahun', 'Lisensi langsung untuk penggunaan komersial yang lebih luas.', '["Lisensi penggunaan publik", "Laporan royalti hak cipta", "Layanan pelanggan prioritas", "Manajemen klaim khusus", "Integrasi sistem global", "Sistem pembagian royalti 70:30"]', false, 3);

-- 6. Insert the data for "Label"
INSERT INTO public.plans (category, name, price, period, description, features, popular, display_order)
VALUES
('label', 'Whitelabel Soundpub', 'Rp 300.000', '/3 tahun', 'Gunakan infrastruktur Soundpub untuk brand Anda sendiri.', '["Manajemen artis tak terbatas", "Distribusi ke 100+ platform", "ISRC & UPC gratis", "Dashboard analytics lengkap", "Priority support", "Royalty split", "Pre-save links", "Sistem pembagian royalti 70:30"]', false, 1),
('label', 'Custom Dashboard', 'Start From Rp 1.3 Jt', NULL, 'Dashboard kustom dengan domain dan brand Anda sendiri.', '["Brand kustom (Whitelabel)", "Domain kustom", "Akses API khusus", "Manajemen user/sub-label", "Sistem pembagian royalti 70:30"]', false, 2),
('label', 'Custom + Request', 'Contact Admin', NULL, 'Solusi enterprise dengan fitur yang disesuaikan kebutuhan.', '["Semua fitur Custom Dashboard", "Request fitur khusus", "Server dedicated", "Account Manager khusus", "Prioritas pengembangan", "Sistem pembagian royalti 70:30"]', false, 3);