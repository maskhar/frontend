-- Migration: Add Categories and Reordering (Idempotent Version)
-- This script restructures the database to support manageable categories
-- and reordering of plans within them. It's designed to be safely re-run.

-- Step 1: Create the 'categories' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    name TEXT NOT NULL UNIQUE,
    display_order INTEGER,
    CONSTRAINT categories_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE public.categories IS 'Stores the different categories for pricing plans.';

-- Step 2: Enable Row Level Security on the new table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS Policies for the 'categories' table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow read access to everyone for categories') THEN
    CREATE POLICY "Allow read access to everyone for categories"
    ON public.categories FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Allow full access for authenticated users on categories') THEN
    CREATE POLICY "Allow full access for authenticated users on categories"
    ON public.categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END
$$;

-- Step 4: Populate the 'categories' table from the existing distinct categories in 'plans'
-- This will only insert categories that don't already exist.
INSERT INTO public.categories (name, display_order)
SELECT DISTINCT category,
    CASE
        WHEN category = 'titip_edar' THEN 1
        WHEN category = 'hak_cipta' THEN 2
        WHEN category = 'label' THEN 3
        ELSE 99
    END
FROM public.plans p
WHERE NOT EXISTS (SELECT 1 FROM public.categories c WHERE c.name = p.category);

-- Step 5: Add the 'category_id' column to the 'plans' table if it doesn't exist
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS category_id UUID;

-- Step 6: Update the 'plans' table to populate the new 'category_id'
-- This links each plan to its corresponding new category entry.
UPDATE public.plans p
SET category_id = (SELECT c.id FROM public.categories c WHERE c.name = p.category)
WHERE p.category_id IS NULL; -- Only update rows that haven't been updated yet

-- Step 7: Make the 'category_id' column required IF IT IS NOT ALREADY.
-- We must first ensure all values are populated.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.plans WHERE category_id IS NULL) THEN
    RAISE NOTICE 'Cannot set category_id to NOT NULL because some rows are still NULL. Please run the previous UPDATE statement again.';
  ELSE
    ALTER TABLE public.plans ALTER COLUMN category_id SET NOT NULL;
  END IF;
END
$$;

-- Step 8: Add the foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_plans_category') THEN
    ALTER TABLE public.plans
    ADD CONSTRAINT fk_plans_category
    FOREIGN KEY (category_id)
    REFERENCES public.categories(id)
    ON DELETE CASCADE;
  END IF;
END
$$;

-- Step 9: Drop the old, redundant 'category' text column if it exists
ALTER TABLE public.plans
DROP COLUMN IF EXISTS category;

-- Final check: Your 'plans' table should now have 'category_id' and no 'category' column.
-- The 'categories' table should be populated.
