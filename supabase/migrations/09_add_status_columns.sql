-- Migration to add a 'status' column to categories and plans
-- This allows for items to be drafted or deactivated instead of being deleted.

-- Step 1: Define a new ENUM type for the status.
-- This ensures data integrity by only allowing these specific values.
CREATE TYPE public.item_status AS ENUM ('active', 'inactive');

-- Step 2: Add the 'status' column to the 'categories' table.
-- Default is 'active' so existing categories are visible by default.
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS status public.item_status NOT NULL DEFAULT 'active';

-- Step 3: Add the 'status' column to the 'plans' table.
-- Default is 'active' so existing plans are visible by default.
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS status public.item_status NOT NULL DEFAULT 'active';

-- Note: We will later modify the handle_category_delete function
-- to set the status of moved plans to 'inactive'.
