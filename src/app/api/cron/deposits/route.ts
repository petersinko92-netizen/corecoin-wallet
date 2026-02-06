import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Fallback RPCs (Robustness)
const RPC_URLS = [
  "https://rpc.ankr.com/eth",
  "https://eth.llamarpc.com",
  "https://cloudflare-eth.com",
];

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get: (n) => cookieStore.get(n)?.value } }
    );

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Fetch Wallets
    const { data: wallets } = await supabase.from('wallets').select('*');
    if (!wallets || wallets.length === 0) return NextResponse.json({ message: 'No wallets to check' });

    const updates = [];
    let provider = new ethers.JsonRpcProvider(RPC_URLS[0]);

    for (const wallet of wallets) {
      try {
        // A. Get Actual Funds on Blockchain
        const balanceBigInt = await provider.getBalance(wallet.address);
        const currentChainBalance = parseFloat(ethers.formatEther(balanceBigInt));
        
        // B. Compare with Last Known Chain Balance
        const lastKnown = wallet.last_chain_balance || 0;
        
        // C. Logic: Did money come IN?
        if (currentChainBalance > lastKnown) {
            const difference = currentChainBalance - lastKnown;
            
            // Ignore tiny dust (less than 0.0001 ETH)
            if (difference > 0.0001) {
                console.log(`Deposit detected for ${wallet.address}: +${difference} ETH`);

                // 1. Update User's LEDGER Balance (What they see)
                // We ADD the new money to whatever they already have (Example: $10 + $20 = $30)
                const newLedgerBalance = (wallet.balance || 0) + difference;

                // 2. Update Database
                await supabase.from('wallets').update({
                    balance: newLedgerBalance,         // User sees this ($30)
                    last_chain_balance: currentChainBalance // Technical tracker ($20)
                }).eq('id', wallet.id);

                // 3. Log Transaction
                await supabase.from('transactions').insert({
                    user_id: wallet.user_id,
                    type: 'deposit',
                    amount: difference,
                    currency: 'ETH',
                    status: 'completed'
                });

                updates.push({ address: wallet.address, deposit: difference });
            } else {
                // If difference is tiny, just update the tracker so we don't check again
                 await supabase.from('wallets').update({
                    last_chain_balance: currentChainBalance
                }).eq('id', wallet.id);
            }
        } 
        // D. Logic: Did money go OUT (e.g. Sweep)?
        else if (currentChainBalance < lastKnown) {
            // Funds moved out (likely a sweep). 
            // We DO NOT deduct from User Ledger. User keeps their balance.
            // We only update the technical tracker.
            console.log(`Funds moved/swept for ${wallet.address}. Updating tracker.`);
            
            await supabase.from('wallets').update({
                last_chain_balance: currentChainBalance
            }).eq('id', wallet.id);
        }

      } catch (e) {
        console.error(`Error checking ${wallet.address}:`, e);
      }
    }

    return NextResponse.json({ success: true, updates });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}