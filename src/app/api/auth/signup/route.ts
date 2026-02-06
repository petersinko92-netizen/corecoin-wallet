import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { encrypt } from '@/lib/encryption';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
        }
      }
    );

    // 1. Create Supabase User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } }
    });

    if (authError || !authData.user) {
        return NextResponse.json({ error: authError?.message || "Signup failed" }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. GENERATE & ENCRYPT WALLET
    const wallet = ethers.Wallet.createRandom();
    const encryptedKey = encrypt(wallet.privateKey); 

    // 3. SAVE TO DB (The Address and Key are now permanently linked)
    const { error: dbError } = await supabase.from('wallets').insert({
      user_id: userId,
      address: wallet.address,
      private_key: encryptedKey, // Saved as "iv:hex"
      balance: 0.0,
      readable_id: `CORE-${userId.slice(0, 6).toUpperCase()}`
    });

    if (dbError) throw dbError;

    // 4. Create Profile
    await supabase.from('profiles').insert({ id: userId, full_name: fullName, email });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Signup Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}