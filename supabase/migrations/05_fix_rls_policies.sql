-- supabase/migrations/05_fix_rls_policies.sql
-- TUJUAN: Menambahkan izin INSERT, UPDATE, DELETE untuk pengguna yang sudah login (admin)
-- di tabel-tabel konten agar bisa dikelola dari dasbor.

-- 1. Menambahkan policy untuk tabel 'main_services'
-- Policy ini mengizinkan pengguna yang terotentikasi untuk melakukan SEMUA aksi (SELECT, INSERT, UPDATE, DELETE).
CREATE POLICY "Allow full admin access to main_services"
ON public.main_services
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 2. Menambahkan policy untuk tabel 'how_it_works_steps'
CREATE POLICY "Allow full admin access to how_it_works_steps"
ON public.how_it_works_steps
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- 3. Menambahkan policy untuk tabel 'service_items' (Perbaikan proaktif)
CREATE POLICY "Allow full admin access to service_items"
ON public.service_items
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
