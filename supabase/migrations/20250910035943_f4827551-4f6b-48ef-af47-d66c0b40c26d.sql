-- Create function to convert current user data to legacy (remove user_id)
CREATE OR REPLACE FUNCTION public.convert_current_data_to_legacy(current_user_id uuid)
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
  -- Update current user's purchases to legacy (set user_id to NULL)
  UPDATE public.purchases 
  SET user_id = NULL
  WHERE user_id = current_user_id;
  GET DIAGNOSTICS purchases_updated = ROW_COUNT;

  -- Update current user's sales to legacy (set user_id to NULL)
  UPDATE public.sales 
  SET user_id = NULL
  WHERE user_id = current_user_id;
  GET DIAGNOSTICS sales_updated = ROW_COUNT;

  -- Update current user's customers to legacy (set user_id to NULL)
  UPDATE public.customers 
  SET user_id = NULL
  WHERE user_id = current_user_id;
  GET DIAGNOSTICS customers_updated = ROW_COUNT;

  -- Return summary
  result := json_build_object(
    'purchases_converted', purchases_updated,
    'sales_converted', sales_updated,
    'customers_converted', customers_updated,
    'success', true
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.convert_current_data_to_legacy(uuid) TO authenticated;