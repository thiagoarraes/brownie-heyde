-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
  customer_exists BOOLEAN;
BEGIN
  -- Check if customer exists
  SELECT EXISTS(SELECT 1 FROM public.customers WHERE LOWER(name) = LOWER(NEW.customer_name)) INTO customer_exists;
  
  IF customer_exists THEN
    -- Update existing customer
    UPDATE public.customers 
    SET 
      total_spent = total_spent + NEW.total_value,
      total_purchases = total_purchases + 1,
      last_purchase_date = NEW.date,
      updated_at = now()
    WHERE LOWER(name) = LOWER(NEW.customer_name);
  ELSE
    -- Create new customer
    INSERT INTO public.customers (name, total_spent, total_purchases, last_purchase_date)
    VALUES (NEW.customer_name, NEW.total_value, 1, NEW.date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
