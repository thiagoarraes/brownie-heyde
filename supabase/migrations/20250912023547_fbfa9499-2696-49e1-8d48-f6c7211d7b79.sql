-- Enable Row Level Security on all tables that contain sensitive data
-- This was disabled but policies existed, creating a security vulnerability

-- Enable RLS on profiles table (contains email addresses)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on purchases table (contains business financial data)
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Enable RLS on sales table (contains customer and financial data)  
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Enable RLS on customers table (contains customer information)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;