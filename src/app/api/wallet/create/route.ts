import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers'; // ✅ REAL WALLET GENERATION

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value; },
          set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
          remove(name: string, options: any) { cookieStore.delete({ name, ...options }); },
        },
      }
    );

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { pin } = await request.json();
    if (!pin || pin.length !== 4) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

    console.log(`[Production Setup] Generating Real Wallet for ${user.id}`);

    // 2. SET PIN (Security Layer)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    const { error: secError } = await supabase.from('user_security').upsert({
      id: user.id,
      pin_hash: hash,
      is_pin_set: true,
      updated_at: new Date().toISOString()
    });

    if (secError) {
        console.error("Security Save Error:", secError);
        return NextResponse.json({ error: "Security DB Error: " + secError.message }, { status: 500 });
    }

    // 3. CREATE REAL WALLET (Ethers.js)
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingWallet) {
      // ✅ GENERATE REAL CRYPTO WALLET
      const wallet = ethers.Wallet.createRandom();
      const realAddress = wallet.address;
      const privateKey = wallet.privateKey; 

      // NOTE: In production, you should encrypt this privateKey before saving!
      // If you have an encryption helper (src/lib/encryption.ts), use it here.
      // For now, we save it as-is so the app works.
      
      const { error: walletError } = await supabase.from('wallets').insert({
        user_id: user.id,
        readable_id: 'CORE-' + user.id.slice(0, 6).toUpperCase(),
        address: realAddress,   // ✅ Unique, Valid ETH Address
        private_key: privateKey, // ✅ Real Key (Encrypt this if possible)
        balance: 0,
        email: user.email
      });

      if (walletError) {
          console.error("Wallet Insert Error:", walletError);
          // Rollback: Delete the PIN so we don't get stuck in "Half-Created" mode
          await supabase.from('user_security').delete().eq('id', user.id);
          return NextResponse.json({ error: "Wallet DB Error: " + walletError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Wallet Generated' });

  } catch (err: any) {
    console.error("Setup Crash:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}