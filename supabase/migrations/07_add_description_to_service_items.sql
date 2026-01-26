-- Menambahkan kolom deskripsi detail ke tabel service_items jika belum ada
-- Kolom ini akan menyimpan teks yang lebih panjang untuk ditampilkan di dialog detail pada halaman /services.
ALTER TABLE public.service_items
ADD COLUMN IF NOT EXISTS description TEXT;
