import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Initialize Supabase with SERVICE ROLE (Bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { targetUserId, amount, type, currency } = await req.json();

    // 1. Validate Input
    if (!targetUserId || !amount || !type || !currency) {
      return NextResponse.json({ success: false, error: 'Missing Data' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    
    // 2. Get the User's Wallet
    const { data: wallet, error: fetchError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (fetchError || !wallet) {
        return NextResponse.json({ success: false, error: 'Wallet not found for this user.' }, { status: 404 });
    }

    // 3. Determine which balance to update
    let updateData = {};
    let currentBalance = 0;

    switch (currency) {
        case 'ETH':
            currentBalance = wallet.balance || 0;
            updateData = { balance: type === 'credit' ? currentBalance + numAmount : currentBalance - numAmount };
            break;
        case 'USDT':
            currentBalance = wallet.usdt_balance || 0;
            updateData = { usdt_balance: type === 'credit' ? currentBalance + numAmount : currentBalance - numAmount };
            break;
        case 'BTC':
            currentBalance = wallet.btc_balance || 0;
            updateData = { btc_balance: type === 'credit' ? currentBalance + numAmount : currentBalance - numAmount };
            break;
        case 'SOL':
            currentBalance = wallet.sol_balance || 0;
            updateData = { sol_balance: type === 'credit' ? currentBalance + numAmount : currentBalance - numAmount };
            break;
        case 'TRX':
            currentBalance = wallet.trx_balance || 0;
            updateData = { trx_balance: type === 'credit' ? currentBalance + numAmount : currentBalance - numAmount };
            break;
        default:
            return NextResponse.json({ success: false, error: 'Invalid Asset' }, { status: 400 });
    }

    // 4. Update the Wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update(updateData)
      .eq('user_id', targetUserId);

    if (updateError) throw updateError;

    // 5. Create the Transaction Record (Visible in User Dashboard)
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: targetUserId,
      type: type === 'credit' ? 'deposit' : 'withdrawal',
      amount: type === 'credit' ? numAmount : -numAmount,
      currency: currency,
      status: 'completed',
      metadata: { method: 'admin_panel' },
      description: `Admin ${type === 'credit' ? 'Deposit' : 'Adjustment'}`
    });

    if (txError) throw txError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}