-- Menambahkan kolom untuk mendukung halaman detail kategori harga

-- Step 1: Menambahkan kolom 'slug' ke tabel 'categories'.
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

COMMENT ON COLUMN public.categories.slug IS 'Slug yang akan digunakan di URL, contoh: /pricing/titip-edar-distribusi.';

-- Step 2: Menambahkan kolom 'long_description' ke tabel 'categories'.
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS long_description TEXT;

COMMENT ON COLUMN public.categories.long_description IS 'Deskripsi panjang untuk halaman detail kategori.';

-- Step 3 (Opsional, tapi direkomendasikan): Mengisi nilai slug untuk data yang sudah ada.
-- UPDATE public.categories SET slug = lower(replace(name, ' ', '-')) WHERE slug IS NULL;
