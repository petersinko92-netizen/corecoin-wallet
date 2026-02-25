-- SQL Command to add the USDT ghost balance tracker column
-- Please run this inside your Supabase SQL Editor

ALTER TABLE public.wallets 
ADD COLUMN last_usdt_chain_balance numeric DEFAULT 0;

-- Optional: If you ever want to add tracking for other chains
-- ALTER TABLE public.wallets ADD COLUMN last_btc_chain_balance numeric DEFAULT 0;
-- ALTER TABLE public.wallets ADD COLUMN last_sol_chain_balance numeric DEFAULT 0;
-- ALTER TABLE public.wallets ADD COLUMN last_trx_chain_balance numeric DEFAULT 0;
