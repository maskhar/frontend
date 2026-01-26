-- supabase/migrations/03_service_items.sql

-- 1. Create the service_items table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.service_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    price_text text,
    image_url text,
    display_order integer DEFAULT 0,
    type text NOT NULL CHECK (type IN ('visual_grid', 'extra_service'))
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy for public read access if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow public read access to service items') THEN
    CREATE POLICY "Allow public read access to service items" ON public.service_items
        FOR SELECT USING (true);
  END IF;
END
$$;

-- NOTE: Sample data insertion has been removed to prevent duplication on re-runs.
-- The data should be managed from the application's dashboard.

-- Optional: Add a comment to the table for clarity
COMMENT ON TABLE public.service_items IS 'Stores visual-first service items for pages like Services/Contract, e.g., for the main grid or other promotional sections.';
