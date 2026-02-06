import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';

const ENCRYPTION_KEY = process.env.WALLET_SECRET_KEY || "dev-secret";
// Use Ankr's free RPC for stability
const PROVIDER_URL = "https://rpc.ankr.com/eth"; 

export async function POST(request: Request) {
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

    const { toAddress, amount, pin } = await request.json();
    if (!toAddress || !amount || !pin) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // 2. Validate Address
    if (!ethers.isAddress(toAddress)) {
      return NextResponse.json({ error: 'Invalid Ethereum Address' }, { status: 400 });
    }

    // 3. VERIFY PIN
    const { data: security } = await supabase.from('user_security').select('pin_hash').eq('id', user.id).single();
    if (!security || !await bcrypt.compare(pin, security.pin_hash)) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
    }

    // 4. Decrypt Wallet
    const { data: senderWallet } = await supabase.from('wallets').select('encrypted_private_key, address').eq('user_id', user.id).single();
    if (!senderWallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });

    const bytes = CryptoJS.AES.decrypt(senderWallet.encrypted_private_key, ENCRYPTION_KEY);
    const privateKey = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!privateKey) return NextResponse.json({ error: 'Security Error: Decryption failed' }, { status: 500 });

    // 5. Check Funds & Gas
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const amountWei = ethers.parseEther(amount.toString());
    const balance = await provider.getBalance(wallet.address);
    // Estimate standard gas (21000) * gasPrice
    const feeData = await provider.getFeeData();
    const gasCost = 21000n * (feeData.gasPrice || 1n);

    if (balance < (amountWei + gasCost)) {
      return NextResponse.json({ error: 'Insufficient ETH for transaction + gas fees' }, { status: 400 });
    }

    // 6. Send
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: amountWei
    });

    // 7. Save to History
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      amount: amount,
      currency: 'ETH',
      status: 'completed',
      to_address: toAddress,
      tx_hash: tx.hash
    });

    return NextResponse.json({ success: true, txHash: tx.hash });

  } catch (err: any) {
    console.error("SEND ERROR:", err);
    return NextResponse.json({ error: err.message || 'Transaction failed' }, { status: 500 });
  }
}