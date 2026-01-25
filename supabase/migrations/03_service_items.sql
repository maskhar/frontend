-- supabase/migrations/03_service_items.sql

-- 1. Create the service_items table
CREATE TABLE public.service_items (
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

-- 3. Create a policy for public read access
CREATE POLICY "Allow public read access to service items" ON public.service_items
    FOR SELECT USING (true);

-- 4. Insert sample data for the 'visual_grid'
INSERT INTO public.service_items (title, price_text, image_url, display_order, type)
VALUES
    ('Mixing & Mastering', 'Mulai dari 500K', 'https://images.unsplash.com/photo-1598488035139-Bffb31835b36?q=80&w=2574&auto=format&fit=crop', 1, 'visual_grid'),
    ('Video Clip Production', 'Mulai dari 5JT', 'https://images.unsplash.com/photo-1542044896534-02055a30d978?q=80&w=2574&auto=format&fit=crop', 2, 'visual_grid'),
    ('Music Distribution', 'Gratis', 'https://images.unsplash.com/photo-1587825140708-df876c12b44e?q=80&w=2670&auto=format&fit=crop', 3, 'visual_grid'),
    ('Studio Recording', 'Mulai dari 100K/jam', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=2670&auto=format&fit=crop', 4, 'visual_grid'),
    ('Jingle & Scoring', 'Project-based', 'https://images.unsplash.com/photo-1516216628859-9bcce25a7e6a?q=80&w=2670&auto=format&fit=crop', 5, 'visual_grid'),
    ('Cover Song License', 'Hubungi Kami', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop', 6, 'visual_grid');

-- Optional: Add a comment to the table for clarity
COMMENT ON TABLE public.service_items IS 'Stores visual-first service items for pages like Services/Contract, e.g., for the main grid or other promotional sections.';
