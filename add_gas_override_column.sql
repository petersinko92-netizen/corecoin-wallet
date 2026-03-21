-- Add gas_override column to wallets table
-- This allows admins to bypass abnormal high gas limits for specific users
-- Default is FALSE so existing functionality remains unchanged

ALTER TABLE public.wallets
ADD COLUMN IF NOT EXISTS gas_override BOOLEAN DEFAULT FALSE;

-- Optional: If you also want it in profiles, uncomment below.
-- ALTER TABLE public.profiles
-- ADD COLUMN IF NOT EXISTS gas_override BOOLEAN DEFAULT FALSE;
