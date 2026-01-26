-- supabase/migrations/04_services_page_content.sql

-- 1. Create the main_services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.main_services (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    description text,
    icon_name text, -- To store the name of the lucide-react icon
    display_order integer DEFAULT 0
);

-- 2. Enable RLS for main_services
ALTER TABLE public.main_services ENABLE ROW LEVEL SECURITY;

-- 3. Create public read policy for main_services if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow public read access to main services') THEN
    CREATE POLICY "Allow public read access to main services" ON public.main_services
        FOR SELECT USING (true);
  END IF;
END
$$;

-- 4. Create the how_it_works_steps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.how_it_works_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    step_number text,
    title text NOT NULL,
    description text,
    display_order integer DEFAULT 0
);

-- 5. Enable RLS for how_it_works_steps
ALTER TABLE public.how_it_works_steps ENABLE ROW LEVEL SECURITY;

-- 6. Create public read policy for how_it_works_steps if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow public read access to how_it_works_steps') THEN
    CREATE POLICY "Allow public read access to how_it_works_steps" ON public.how_it_works_steps
        FOR SELECT USING (true);
  END IF;
END
$$;

-- NOTE: Sample data insertions have been removed to prevent duplication on re-runs.

-- 9. Add comments to the tables for clarity
COMMENT ON TABLE public.main_services IS 'Stores the main service offerings displayed on the /services page.';
COMMENT ON TABLE public.how_it_works_steps IS 'Stores the steps for the "How It Works" section on the /services page.';
