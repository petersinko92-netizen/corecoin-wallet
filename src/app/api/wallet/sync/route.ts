import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// CONFIG
// Use Service Role to bypass RLS and write to DB securely
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS!;

// ABI for checking USDT Balance
const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];

export async function POST(request: Request) {
  try {
    const { userId, asset = 'ETH' } = await request.json();

    if (!userId) return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });

    // 1. GET WALLET & LAST KNOWN BALANCE
    const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!wallet) return NextResponse.json({ message: 'No wallet found' });

    // 2. CHECK LIVE BLOCKCHAIN BALANCE
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    let liveBalance = 0.0;

    if (asset === 'ETH') {
        const balWei = await provider.getBalance(wallet.address);
        liveBalance = parseFloat(ethers.formatEther(balWei));
    } else if (asset === 'USDT') {
        if (!USDT_ADDRESS) throw new Error("USDT Contract missing in .env");
        const contract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
        const balWei = await contract.balanceOf(wallet.address);
        // USDT usually has 6 decimals, but test tokens might have 18. 
        // Standard Tether is 6. Adjust if using a weird test token.
        liveBalance = parseFloat(ethers.formatUnits(balWei, 6)); 
    }

    // 3. DETERMINE DB COLUMNS
    // We map assets to their specific "Ghost Balance" and "Last Known" columns
    let balanceCol = 'balance'; // Default ETH
    let lastKnownCol = 'last_chain_balance'; // Default ETH

    if (asset === 'USDT') {
        balanceCol = 'usdt_balance';
        // You might need to add 'last_usdt_chain_balance' to DB if you want perfect syncing for USDT too.
        // For now, we'll assume we strictly sync ETH or use a generic tracker.
        // If you don't have 'last_usdt...' column, we can skip the incremental logic for USDT 
        // or just update it directly if you don't plan to sweep USDT often.
        // Let's assume you strictly want to protect ETH for now.
    }

    // 4. INCREMENTAL SYNC LOGIC (The Ghost Protector)
    // We only perform this logic for ETH for now unless you add specific columns for others
    if (asset === 'ETH') {
        const lastKnown = wallet[lastKnownCol] || 0;
        const diff = liveBalance - lastKnown;

        // SCENARIO A: DEPOSIT (Live is higher than last known)
        if (diff > 0.000001) {
            console.log(`💰 New Deposit Detected: +${diff} ${asset}`);
            
            // 1. Add Difference to Ghost Balance
            const newGhostBalance = (wallet[balanceCol] || 0) + diff;
            
            // 2. Update DB
            await supabase.from('wallets').update({
                [balanceCol]: newGhostBalance,     // Update User View
                [lastKnownCol]: liveBalance        // Update Tracker
            }).eq('user_id', userId);

            // 3. Log Transaction
            await supabase.from('transactions').insert({
                user_id: userId,
                type: 'deposit',
                amount: diff,
                currency: asset,
                status: 'completed',
                description: `Detected On-Chain Deposit`,
                metadata: { source: 'sync_job' }
            });

            return NextResponse.json({ success: true, message: `Deposit synced: +${diff} ${asset}`, chainBalance: liveBalance });
        }
        
        // SCENARIO B: SWEEP/WITHDRAWAL (Live is lower)
        else if (diff < -0.000001) {
            console.log(`📉 Balance Decreased (Sweep detected): ${diff} ${asset}`);
            
            // We ONLY update the "Last Known" tracker. 
            // We do NOT touch the [balanceCol], preserving the Ghost Balance.
            await supabase.from('wallets').update({
                [lastKnownCol]: liveBalance
            }).eq('user_id', userId);

            return NextResponse.json({ success: true, message: 'Tracker updated (Sweep ignored)', chainBalance: liveBalance });
        }
    }
    
    // For USDT (Simplified Sync - Updates directly if columns missing)
    // If you want USDT ghost logic, add 'last_usdt_balance' to Supabase and copy the logic above.
    if (asset === 'USDT') {
         // Current simple update (Warning: Will reset balance on sweep)
         // Only use this if you haven't implemented 'last_usdt_balance'
         // await supabase.from('wallets').update({ usdt_balance: liveBalance }).eq('user_id', userId);
         return NextResponse.json({ success: true, chainBalance: liveBalance });
    }

    return NextResponse.json({ success: true, message: 'Synced', chainBalance: liveBalance });

  } catch (e: any) {
    console.error("Sync Error:", e);
    return NextResponse.json({ success: false, error: e.message });
  }
}