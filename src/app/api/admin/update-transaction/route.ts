import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/next';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    const { transactionId, status, userId, amount, asset } = await request.json();

    // 1. Update Transaction Status
    const { error: txError } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId);

    if (txError) throw txError;

    // 2. Handle Refund if Failed
    if (status === 'failed') {
      const balanceField = asset === 'BTC' ? 'btc_balance' : asset === 'USDT' ? 'usdt_balance' : 'balance';
      const amountToRefund = Math.abs(amount);

      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select(balanceField)
        .eq('user_id', userId)
        .single();

      // Casting to any to fix the TypeScript indexing error for Vercel
      const currentBalance = wallet ? (wallet as any)[balanceField] || 0 : 0;
      const newBalance = currentBalance + amountToRefund;

      // Update the Wallet
      const { error: refundError } = await supabase
        .from('wallets')
        .update({ [balanceField]: newBalance })
        .eq('user_id', userId);

      if (refundError) throw new Error("Refund failed: " + refundError.message);
      
      console.log(`REFUND SUCCESS: Returned ${amountToRefund} ${asset} to ${userId}`);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}