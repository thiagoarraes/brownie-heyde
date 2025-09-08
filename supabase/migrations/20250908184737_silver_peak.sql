/*
  # Create brownie business management schema

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key)
      - `date` (date)
      - `quantity` (integer with check > 0)
      - `total_value` (decimal with check > 0)
      - `supplier` (text)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `sales`
      - `id` (uuid, primary key)
      - `date` (date)
      - `customer_name` (text)
      - `quantity` (integer with check > 0)
      - `unit_price` (decimal with check > 0)
      - `total_value` (decimal with check > 0)
      - `payment_method` (text with enum check)
      - `brownie_type` (text with enum check)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `total_spent` (decimal with check >= 0)
      - `total_purchases` (integer with check >= 0)
      - `last_purchase_date` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (no authentication required)

  3. Functions and Triggers
    - Auto-update timestamps on record updates
    - Auto-update customer stats when sales are added
*/

-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  supplier TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraints to purchases table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'purchases_quantity_check' 
    AND table_name = 'purchases'
  ) THEN
    ALTER TABLE public.purchases ADD CONSTRAINT purchases_quantity_check CHECK (quantity > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'purchases_total_value_check' 
    AND table_name = 'purchases'
  ) THEN
    ALTER TABLE public.purchases ADD CONSTRAINT purchases_total_value_check CHECK (total_value > 0);
  END IF;
END $$;

-- Create sales table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  brownie_type TEXT NOT NULL DEFAULT 'Doce de leite',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraints to sales table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'sales_quantity_check' 
    AND table_name = 'sales'
  ) THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_quantity_check CHECK (quantity > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'sales_unit_price_check' 
    AND table_name = 'sales'
  ) THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_unit_price_check CHECK (unit_price > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'sales_total_value_check' 
    AND table_name = 'sales'
  ) THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_total_value_check CHECK (total_value > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'sales_payment_method_check' 
    AND table_name = 'sales'
  ) THEN
    ALTER TABLE public.sales ADD CONSTRAINT sales_payment_method_check CHECK (payment_method IN ('dinheiro', 'pix', 'cartao', 'outros'));
  END IF;
END $$;

-- Add brownie type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'brownie_type'
  ) THEN
    ALTER TABLE public.sales ADD COLUMN brownie_type TEXT NOT NULL DEFAULT 'Doce de leite';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'valid_brownie_type' 
    AND table_name = 'sales'
  ) THEN
    ALTER TABLE public.sales ADD CONSTRAINT valid_brownie_type CHECK (brownie_type IN ('Doce de leite', 'Ninho'));
  END IF;
END $$;

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  last_purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to customers name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'customers_name_key' 
    AND table_name = 'customers'
  ) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_name_key UNIQUE (name);
  END IF;
END $$;

-- Add constraints to customers table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'customers_total_spent_check' 
    AND table_name = 'customers'
  ) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_total_spent_check CHECK (total_spent >= 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'customers_total_purchases_check' 
    AND table_name = 'customers'
  ) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_total_purchases_check CHECK (total_purchases >= 0);
  END IF;
END $$;

-- Enable RLS but allow public access (no authentication required)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'purchases' 
    AND policyname = 'Allow public access to purchases'
  ) THEN
    CREATE POLICY "Allow public access to purchases" ON public.purchases FOR ALL USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'sales' 
    AND policyname = 'Allow public access to sales'
  ) THEN
    CREATE POLICY "Allow public access to sales" ON public.sales FOR ALL USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' 
    AND policyname = 'Allow public access to customers'
  ) THEN
    CREATE POLICY "Allow public access to customers" ON public.customers FOR ALL USING (true);
  END IF;
END $$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_purchases_updated_at'
  ) THEN
    CREATE TRIGGER update_purchases_updated_at
      BEFORE UPDATE ON public.purchases
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_sales_updated_at'
  ) THEN
    CREATE TRIGGER update_sales_updated_at
      BEFORE UPDATE ON public.sales
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_customers_updated_at'
  ) THEN
    CREATE TRIGGER update_customers_updated_at
      BEFORE UPDATE ON public.customers
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create function to automatically update customer stats when sales are added
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
$$ LANGUAGE plpgsql;

-- Create trigger to update customer stats on new sales if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_customer_stats_on_sale'
  ) THEN
    CREATE TRIGGER update_customer_stats_on_sale
      AFTER INSERT ON public.sales
      FOR EACH ROW
      EXECUTE FUNCTION public.update_customer_stats();
  END IF;
END $$;