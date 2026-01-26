-- Migration to create a safe delete function for categories.
-- This function ensures that when a category is deleted,
-- its associated plans are moved to an "Uncategorized" category instead of being orphaned.

-- Step 1: Create the PostgreSQL function `handle_category_delete`
CREATE OR REPLACE FUNCTION public.handle_category_delete(category_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to run with elevated privileges to modify data
AS $$
DECLARE
  uncategorized_id UUID;
BEGIN
  -- Step 1.1: Find the ID of the 'Uncategorized' category.
  -- The name is case-insensitive ('ilike') to be robust.
  SELECT id INTO uncategorized_id
  FROM public.categories
  WHERE name ILIKE 'Uncategorized'
  LIMIT 1;

  -- Step 1.2: If 'Uncategorized' category does not exist, create it.
  IF uncategorized_id IS NULL THEN
    INSERT INTO public.categories (name, display_order)
    VALUES ('Uncategorized', 999)
    RETURNING id INTO uncategorized_id;
  END IF;

  -- Step 1.3: Ensure we are not trying to delete the 'Uncategorized' category itself.
  IF category_id_to_delete = uncategorized_id THEN
    RAISE EXCEPTION 'Cannot delete the default "Uncategorized" category.';
  END IF;

  -- Step 1.4: Re-assign all plans from the category being deleted to the 'Uncategorized' category.
  UPDATE public.plans
  SET category_id = uncategorized_id
  WHERE category_id = category_id_to_delete;

  -- Step 1.5: Finally, delete the original category.
  DELETE FROM public.categories
  WHERE id = category_id_to_delete;

END;
$$;

-- Note: After creating this function, you should call it from your application
-- using supabase.rpc('handle_category_delete', { category_id_to_delete: '...' })
-- instead of a direct .delete() call on the categories table.
