import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    // 1. GET THE TRANSACTION FIRST
    // We need to know the amount and who sent it
    const { data: tx, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !tx) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    // 2. SECURITY CHECK: PREVENT DOUBLE REFUNDS
    // If it's already "failed" or "completed", don't touch it again.
    if (tx.status === 'failed' || tx.status === 'completed') {
      return NextResponse.json({ success: false, error: "Transaction already finalized" }, { status: 400 });
    }

    // 3. IF REJECTING -> PROCESS REFUND
    if (status === 'failed') {
      const userId = tx.user_id;
      const amountToRefund = Math.abs(tx.amount); // Convert -50 to 50
      const asset = tx.currency;

      // Determine which wallet column to refund to
      let balanceField = 'balance'; // Default ETH
      if (asset === 'BTC') balanceField = 'btc_balance';
      if (asset === 'USDT') balanceField = 'usdt_balance';
      if (asset === 'SOL') balanceField = 'sol_balance';
      if (asset === 'TRX') balanceField = 'trx_balance';

      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select(balanceField)
        .eq('user_id', userId)
        .single();

      // ✅ FIX: Cast 'wallet' to 'any' to allow dynamic indexing with [balanceField]
      const currentBalance = wallet ? (wallet as any)[balanceField] || 0 : 0;
      const newBalance = currentBalance + amountToRefund;

      // Update the Wallet
      const { error: refundError } = await supabase
        .from('wallets')
        .update({ [balanceField]: newBalance })
        .eq('user_id', userId);

      if (refundError) throw new Error("Refund failed: " + refundError.message);
      
      console.log(`REFUND SUCCESS: Returned ${amountToRefund} ${asset} to ${userId}`);

    // 4. FINALLY, UPDATE THE STATUS TAG
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}