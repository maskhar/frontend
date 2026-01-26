-- supabase/migrations/05_fix_rls_policies.sql (Idempotent Version)
-- TUJUAN: Memastikan izin INSERT, UPDATE, DELETE ada untuk pengguna yang sudah login (admin)
-- di tabel-tabel konten agar bisa dikelola dari dasbor.

-- 1. Menambahkan policy untuk tabel 'main_services' jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow full admin access to main_services') THEN
    CREATE POLICY "Allow full admin access to main_services"
    ON public.main_services
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;

-- 2. Menambahkan policy untuk tabel 'how_it_works_steps' jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow full admin access to how_it_works_steps') THEN
    CREATE POLICY "Allow full admin access to how_it_works_steps"
    ON public.how_it_works_steps
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;

-- 3. Menambahkan policy untuk tabel 'service_items' jika belum ada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow full admin access to service_items') THEN
    CREATE POLICY "Allow full admin access to service_items"
    ON public.service_items
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;
