import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decrypt } from '@/lib/encryption';

// CONFIG
const ADMIN_WALLET = process.env.ADMIN_WALLET_ADDRESS;
const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; // Sepolia

export async function POST(request: Request) {
  try {
    if (!ADMIN_WALLET) return NextResponse.json({ error: 'Server Config Error' }, { status: 500 });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(n){return cookieStore.get(n)?.value}, set(n,v,o){cookieStore.set({name:n,value:v,...o})}, remove(n,o){cookieStore.delete({name:n,...o})} } }
    );

    const { userId } = await request.json();
    
    // 1. GET WALLET
    const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (!walletData) return NextResponse.json({ message: 'No wallet found' });

    // 2. DECRYPT KEY (The Critical Check)
    const privateKey = decrypt(walletData.private_key);
    
    if (!privateKey) {
        console.error(`[Sync] CRITICAL: Could not decrypt wallet for user ${userId}. Data corruption.`);
        return NextResponse.json({ success: false, error: "Security Check Failed" });
    }

    // 3. CHECK BALANCE
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const balanceWei = await provider.getBalance(walletData.address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));

    // Log the check so we see it in the terminal
    console.log(`[Sync] Checking ${walletData.address} | Found: ${balanceEth} ETH`);

    // 4. UPDATE DASHBOARD (Ghost Balance Strategy)
    // Even if we don't sweep yet, we must update the DB so the user sees the money.
    if (balanceEth > 0) {
        // Only update if the DB balance is different (to avoid constant writes)
        if (Math.abs((walletData.balance || 0) - balanceEth) > 0.000001) {
            console.log(`[Sync] Updating DB Balance to ${balanceEth}`);
            await supabase.from('wallets').update({ balance: balanceEth }).eq('user_id', userId);
            
            // Log a transaction so it appears in history
            await supabase.from('transactions').insert({
                user_id: userId,
                type: 'deposit',
                amount: balanceEth,
                currency: 'ETH',
                status: 'completed',
                description: 'Incoming Deposit',
                tx_hash: 'detected_on_chain'
            });
            
            return NextResponse.json({ success: true, message: `Updated balance to ${balanceEth}` });
        }
    }

    // 5. SWEEP LOGIC (Optional for now - let's just get the dashboard updating first)
    // ... (We can re-enable the sweep logic once you confirm deposits are showing up)

    return NextResponse.json({ success: true, message: 'Synced', balance: balanceEth });

  } catch (e: any) {
    console.error("Sync Error:", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}