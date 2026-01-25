-- Menambahkan kolom image_url ke tabel main_services
-- Kolom ini akan menyimpan URL publik dari gambar yang diunggah via Supabase Storage.
ALTER TABLE public.main_services
ADD COLUMN image_url TEXT;
