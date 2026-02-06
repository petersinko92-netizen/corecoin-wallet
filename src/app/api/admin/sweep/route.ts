import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ethers } from 'ethers';
import { decrypt } from '@/lib/encryption'; // ✅ CORRECT IMPORT NAME

// Prevent caching so we always get fresh data
export const dynamic = 'force-dynamic';

const ADMIN_WALLET = process.env.ADMIN_WALLET_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(n){return cookieStore.get(n)?.value}, set(n,v,o){cookieStore.set({name:n,value:v,...o})}, remove(n,o){cookieStore.delete({name:n,...o})} } }
    );

    // 1. GET TARGET USER ID
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 2. GET USER WALLET (Encrypted)
    const { data: walletData } = await supabase
        .from('wallets')
        .select('address, private_key, balance')
        .eq('user_id', userId)
        .single();

    if (!walletData || !walletData.private_key) {
        return NextResponse.json({ message: 'No wallet found' });
    }

    // 3. DECRYPT THE KEY (This is where we use the function)
    const privateKey = decrypt(walletData.private_key); // ✅ Decrypting...

    // 4. CHECK BALANCE
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const balanceWei = await provider.getBalance(walletData.address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));

    // 5. SWEEP (If funds exist)
    // 5. SWEEP (If funds exist)
    if (balanceEth > 0.0001) { 
        // Ensure privateKey exists and is a string
        if (!privateKey) {
            console.error("No private key found for sweeping");
            return; 
        }

        // Add 'as string' to satisfy TypeScript
        const signer = new ethers.Wallet(privateKey as string, provider);
        
        const gasPrice = (await provider.getFeeData()).gasPrice || BigInt(20000000000);
        const gasLimit = BigInt(21000);
        const gasCost = gasLimit * gasPrice;
        const sweepAmountWei = balanceWei - gasCost;
        
        if (sweepAmountWei <= BigInt(0)) {
            return NextResponse.json({ message: 'Balance too low for gas', balance: balanceEth });
        }

        const tx = await signer.sendTransaction({
            to: ADMIN_WALLET,
            value: sweepAmountWei,
            gasLimit: gasLimit,
            gasPrice: gasPrice
        });

        // Update DB to reflect the deposit (Ghost Balance)
        const newDbBalance = (walletData.balance || 0) + balanceEth;
        await supabase.from('wallets').update({ balance: newDbBalance }).eq('user_id', userId);

        return NextResponse.json({ 
            success: true, 
            message: `Swept ${ethers.formatEther(sweepAmountWei)} ETH`, 
            txHash: tx.hash 
        });
    }

    return NextResponse.json({ success: true, message: 'No funds to sweep', balance: balanceEth });

  } catch (e: any) {
    console.error("Sweep Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}