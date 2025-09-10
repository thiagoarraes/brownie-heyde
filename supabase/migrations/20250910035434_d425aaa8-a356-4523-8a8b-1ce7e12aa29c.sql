-- Create function to migrate legacy data to current user
CREATE OR REPLACE FUNCTION public.migrate_legacy_data_to_user(target_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  purchases_updated integer;
  sales_updated integer;
  customers_updated integer;
  result json;
BEGIN
  -- Update legacy purchases
  UPDATE public.purchases 
  SET user_id = target_user_id
  WHERE user_id IS NULL;
  GET DIAGNOSTICS purchases_updated = ROW_COUNT;

  -- Update legacy sales
  UPDATE public.sales 
  SET user_id = target_user_id
  WHERE user_id IS NULL;
  GET DIAGNOSTICS sales_updated = ROW_COUNT;

  -- Update legacy customers
  UPDATE public.customers 
  SET user_id = target_user_id
  WHERE user_id IS NULL;
  GET DIAGNOSTICS customers_updated = ROW_COUNT;

  -- Return summary
  result := json_build_object(
    'purchases_migrated', purchases_updated,
    'sales_migrated', sales_updated,
    'customers_migrated', customers_updated,
    'success', true
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.migrate_legacy_data_to_user(uuid) TO authenticated;