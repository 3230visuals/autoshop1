-- MIGRATION 009: ADD NUMBER OF BAYS TO SHOPS
-- Allows shops to configure their total capacity (e.g. 10 bays)

ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS number_of_bays INT DEFAULT 8;

-- Create an index if needed for future lookups, though likely small volume
-- CREATE INDEX IF NOT EXISTS idx_shops_bay_count ON public.shops(number_of_bays);

-- Update existing shops to have 8 bays by default if they don't already
UPDATE public.shops SET number_of_bays = 8 WHERE number_of_bays IS NULL;
