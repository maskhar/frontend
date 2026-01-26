-- Migration to update the safe delete function for categories.
-- This version adds logic to set the status of moved plans to 'inactive'.

CREATE OR REPLACE FUNCTION public.handle_category_delete(category_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uncategorized_id UUID;
BEGIN
  -- Find or create the 'Uncategorized' category.
  SELECT id INTO uncategorized_id
  FROM public.categories
  WHERE name ILIKE 'Uncategorized'
  LIMIT 1;

  IF uncategorized_id IS NULL THEN
    INSERT INTO public.categories (name, display_order, status)
    VALUES ('Uncategorized', 999, 'inactive') -- Create it as inactive
    RETURNING id INTO uncategorized_id;
  END IF;

  -- Prevent deletion of the 'Uncategorized' category itself.
  IF category_id_to_delete = uncategorized_id THEN
    RAISE EXCEPTION 'Cannot delete the default "Uncategorized" category.';
  END IF;

  -- Re-assign plans to 'Uncategorized' AND set their status to 'inactive'.
  UPDATE public.plans
  SET 
    category_id = uncategorized_id,
    status = 'inactive' -- This is the new logic
  WHERE category_id = category_id_to_delete;

  -- Finally, delete the original category.
  DELETE FROM public.categories
  WHERE id = category_id_to_delete;

END;
$$;
