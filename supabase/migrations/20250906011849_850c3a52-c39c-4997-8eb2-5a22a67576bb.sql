-- Create purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_value DECIMAL(10,2) NOT NULL CHECK (total_value > 0),
  supplier TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
  total_value DECIMAL(10,2) NOT NULL CHECK (total_value > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dinheiro', 'pix', 'cartao', 'outros')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  total_purchases INTEGER NOT NULL DEFAULT 0 CHECK (total_purchases >= 0),
  last_purchase_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access (no authentication required)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public access to purchases" ON public.purchases FOR ALL USING (true);
CREATE POLICY "Allow public access to sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow public access to customers" ON public.customers FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

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

-- Create trigger to update customer stats on new sales
CREATE TRIGGER update_customer_stats_on_sale
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_stats();
