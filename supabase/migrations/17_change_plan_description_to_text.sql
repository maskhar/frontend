-- Mengubah tipe data kolom long_description pada tabel plans menjadi TEXT

ALTER TABLE public.plans
ALTER COLUMN long_description TYPE TEXT;
