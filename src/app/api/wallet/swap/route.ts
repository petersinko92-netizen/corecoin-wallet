import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { fromCurrency, toCurrency, amount, rate } = await request.json(); // e.g., 'ETH', 'USDT', 0.1, 3000

    // 1. Get Current Balance
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    
    if (fromCurrency === 'ETH') {
      if (wallet.balance < amount) return NextResponse.json({ error: 'Insufficient ETH' }, { status: 400 });
      
      const ethDeduction = amount;
      const usdtAddition = amount * rate; // Simple calculation

      // 2. Perform Swap (Update DB)
      await supabase.from('wallets').update({
        balance: Number(wallet.balance) - Number(ethDeduction),
        usdt_balance: Number(wallet.usdt_balance || 0) + Number(usdtAddition)
      }).eq('user_id', user.id);
    } 
    // You can add USDT -> ETH logic here later

    // 3. Log Transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'swap',
      amount: amount,
      currency: `${fromCurrency} -> ${toCurrency}`,
      status: 'completed',
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}