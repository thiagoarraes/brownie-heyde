-- Add brownie_type column to sales table
ALTER TABLE public.sales 
ADD COLUMN brownie_type TEXT NOT NULL DEFAULT 'Doce de leite';

-- Add check constraint to ensure valid brownie types
ALTER TABLE public.sales 
ADD CONSTRAINT valid_brownie_type 
CHECK (brownie_type IN ('Doce de leite', 'Ninho'));
