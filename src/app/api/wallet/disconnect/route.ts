import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.WALLET_SECRET_KEY || "dev-secret-key-CHANGE-IN-PROD";

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

    // 1. Generate a BRAND NEW Default Wallet (The "Normal" State)
    const newWallet = ethers.Wallet.createRandom();
    const encryptedPrivateKey = CryptoJS.AES.encrypt(newWallet.privateKey, ENCRYPTION_KEY).toString();

    // 2. Overwrite the existing wallet with this new one
    // We do NOT delete the row, we just reset it.
    const { error } = await supabase
      .from('wallets')
      .update({
        address: newWallet.address,
        encrypted_private_key: encryptedPrivateKey,
        balance: 0,
        usdt_balance: 0,
        currency: 'ETH'
      })
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true, newAddress: newWallet.address });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}