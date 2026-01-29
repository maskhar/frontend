-- Menambahkan kolom untuk mendukung halaman detail paket harga

-- Step 1: Menambahkan kolom 'slug' ke tabel 'plans'.
-- Slug ini akan unik untuk setiap paket dalam sebuah kategori.
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS slug TEXT;

COMMENT ON COLUMN public.plans.slug IS 'Slug yang akan digunakan di URL, contoh: /pricing/kategori-slug/paket-slug.';

-- Step 2: Menambahkan kolom 'long_description' ke tabel 'plans'.
-- Menggunakan tipe JSONB agar bisa menyimpan konten terstruktur di masa depan.
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS long_description JSONB;

COMMENT ON COLUMN public.plans.long_description IS 'Deskripsi panjang atau konten terstruktur untuk halaman detail paket.';

-- Membuat slug unik per kategori
ALTER TABLE public.plans
ADD CONSTRAINT unique_slug_per_category UNIQUE (category_id, slug);
