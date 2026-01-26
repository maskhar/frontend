-- Menambahkan kolom image_url ke tabel main_services jika belum ada
-- Kolom ini akan menyimpan URL publik dari gambar yang diunggah via Supabase Storage.
ALTER TABLE public.main_services
ADD COLUMN IF NOT EXISTS image_url TEXT;
