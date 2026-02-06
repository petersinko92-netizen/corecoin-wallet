import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Service Role to write to DB without user being logged in
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(request: Request) {
  const body = await request.json();

  // Alchemy sends data like this:
  const { from, to, value, asset } = body.event.activity[0];
  
  console.log(`Received ${value} ${asset} on address ${to}`);

  // 1. Find which user owns this wallet address
  const { data: wallet } = await supabase
    .from('wallets')
    .select('user_id, balance')
    .eq('address', to) // 'to' is the receiving address (our user)
    .single();

  if (wallet) {
    // 2. Update their balance in our database
    // (Note: 'value' comes as a number/string, ensure secure math in production)
    const newBalance = Number(wallet.balance) + Number(value);

    await supabase
      .from('wallets')
      .update({ balance: newBalance })
      .eq('user_id', wallet.user_id);
      
    // 3. Optional: Send them an email "Deposit Received!"
  }

  return NextResponse.json({ received: true });
}