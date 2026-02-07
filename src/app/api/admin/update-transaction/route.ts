import { createClient } from '@supabase/supabase-js'; // ✅ Use direct client, not SSR
import { NextResponse } from 'next/server';

// Map assets to DB columns
const DB_MAP: Record<string, string> = {
  'ETH': 'balance',
  'BTC': 'btc_balance', 
  'USDT': 'usdt_balance',
  'SOL': 'sol_balance',
  'TRX': 'trx_balance'
};

export async function POST(request: Request) {
  try {
    // 1. Initialize Admin Client (Service Role)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // ✅ CRITICAL for Admin actions
    );

    const { id, status } = await request.json(); // We only need ID and Status

    // 2. Fetch the Transaction First (To know amount & type)
    const { data: tx, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !tx) throw new Error("Transaction not found");

    // 3. Update Status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id);

    if (updateError) throw updateError;

    // 4. HANDLE REFUND (Only if REJECTING a WITHDRAWAL)
    // If user tried to withdraw $100 and we say "Failed", we must give back the $100.
    if (status === 'failed' && tx.type === 'withdrawal') {
        
        const asset = tx.currency || 'ETH';
        const balanceField = DB_MAP[asset] || 'balance';
        const amountToRefund = Math.abs(tx.amount); // Ensure positive number

        // Get current wallet
        const { data: wallet } = await supabase
            .from('wallets')
            .select(balanceField)
            .eq('user_id', tx.user_id)
            .single();

        if (wallet) {
            const currentBalance = (wallet as any)[balanceField] || 0;
            const newBalance = currentBalance + amountToRefund;

            // Refund
            await supabase
                .from('wallets')
                .update({ [balanceField]: newBalance })
                .eq('user_id', tx.user_id);
            
            console.log(`REFUND: Returned ${amountToRefund} ${asset} to ${tx.user_id}`);
        }
    }

    // 5. HANDLE DEPOSIT REJECTION (Optional)
    // If you reject a 'deposit', we usually don't need to do anything to the balance
    // because pending deposits shouldn't be in the balance yet. 
    // If your logic adds them instantly, you might need to deduct here.
    // (Assuming current logic: Deposits are only added when 'completed', so rejecting 'processing' is safe).

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Update Transaction Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}