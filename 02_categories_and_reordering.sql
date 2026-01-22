-- Migration: Add Categories and Reordering
-- This script restructures the database to support manageable categories
-- and reordering of plans within them.

-- Step 1: Create the new 'categories' table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE public.categories IS 'Stores the different categories for pricing plans.';

-- Step 2: Enable Row Level Security on the new table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies for the 'categories' table
-- Allow anyone to read the categories
CREATE POLICY "Allow read access to everyone for categories"
ON public.categories
FOR SELECT
USING (true);

-- Allow authenticated users (admins) to manage categories
CREATE POLICY "Allow full access for authenticated users on categories"
ON public.categories
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');


-- Step 4: Populate the 'categories' table from the existing distinct categories in 'plans'
-- This ensures existing data is migrated.
INSERT INTO public.categories (name, display_order)
SELECT DISTINCT category,
    CASE
        WHEN category = 'titip_edar' THEN 1
        WHEN category = 'hak_cipta' THEN 2
        WHEN category = 'label' THEN 3
        ELSE 99
    END
FROM public.plans;


-- Step 5: Add the new 'category_id' column to the 'plans' table
ALTER TABLE public.plans
ADD COLUMN category_id UUID;


-- Step 6: Create the foreign key relationship
ALTER TABLE public.plans
ADD CONSTRAINT fk_plans_category
FOREIGN KEY (category_id)
REFERENCES public.categories(id)
ON DELETE CASCADE; -- This means if you delete a category, all its plans are also deleted.


-- Step 7: Update the 'plans' table to populate the new 'category_id'
-- This links each plan to its corresponding new category entry.
UPDATE public.plans p
SET category_id = (SELECT c.id FROM public.categories c WHERE c.name = p.category);


-- Step 8: Make the 'category_id' column required now that it's populated
ALTER TABLE public.plans
ALTER COLUMN category_id SET NOT NULL;


-- Step 9: Drop the old, redundant 'category' text column
ALTER TABLE public.plans
DROP COLUMN category;

-- Final check: Your 'plans' table should now have 'category_id' and no 'category' column.
-- The 'categories' table should be populated with your three categories.
