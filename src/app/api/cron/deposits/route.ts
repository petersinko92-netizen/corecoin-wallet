import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. Init Supabase Admin (Bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Map Asset Names to DB Columns
const ASSET_MAP: Record<string, string> = {
  'ETH': 'balance',
  'USDT': 'usdt_balance',
  'BTC': 'btc_balance',
  'SOL': 'sol_balance',
  'TRX': 'trx_balance'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate Alchemy Payload
    if (!body.event || !body.event.activity || body.event.activity.length === 0) {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const activity = body.event.activity[0];
    const { from, to, value, asset, category } = activity;

    // Ignore 'internal' transactions if you only want external deposits
    // if (category === 'internal') return NextResponse.json({ ignored: true });

    console.log(`💰 Deposit Detected: ${value} ${asset} -> ${to}`);

    // 2. Find User by Wallet Address
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('user_id, balance, usdt_balance, btc_balance, sol_balance, trx_balance')
      .eq('address', to) // 'to' is the user's address
      .single();

    if (walletError || !wallet) {
      console.log(`No user found for address ${to}`);
      return NextResponse.json({ message: 'User not found' });
    }

    // 3. Determine which balance to update
    const balanceColumn = ASSET_MAP[asset];
    if (!balanceColumn) {
      console.log(`Unsupported asset: ${asset}`);
      return NextResponse.json({ message: 'Unsupported asset' });
    }

    // 4. Update Wallet Balance (The "Ghost" Balance)
    const currentBalance = Number(wallet[balanceColumn as keyof typeof wallet] || 0);
    const depositAmount = Number(value);
    const newBalance = currentBalance + depositAmount;

    await supabase
      .from('wallets')
      .update({ [balanceColumn]: newBalance })
      .eq('user_id', wallet.user_id);

    // 5. Create Transaction Record (So it shows in History)
    // We check if this tx hash already exists to prevent duplicates
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('description', `Deposit from ${from.slice(0,6)}...`)
      .eq('amount', depositAmount)
      .single();

    if (!existingTx) {
       await supabase.from('transactions').insert({
         user_id: wallet.user_id,
         type: 'deposit',
         amount: depositAmount,
         currency: asset,
         status: 'completed',
         description: `Deposit from ${from.slice(0,6)}...`,
         metadata: { from_address: from, tx_hash: activity.hash || 'on-chain' }
       });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}