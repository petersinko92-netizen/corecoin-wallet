import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { encrypt } from '@/lib/encryption';

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

    const { type, value } = await request.json();
    if (!value) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    let wallet;
    try {
        // 2. Derive Wallet from Input
        if (type === 'phrase') {
            // Normalize phrase (trim spaces)
            wallet = ethers.Wallet.fromPhrase(value.trim());
        } else {
            // Handle Private Key (add 0x if missing)
            const pKey = value.trim().startsWith('0x') ? value.trim() : '0x' + value.trim();
            wallet = new ethers.Wallet(pKey);
        }
    } catch (e) {
        return NextResponse.json({ error: 'Invalid Seed Phrase or Private Key' }, { status: 400 });
    }

    console.log(`[Wallet Import] User ${user.id} importing wallet ${wallet.address}`);

    // 3. Encrypt the Key
    const encryptedKey = encrypt(wallet.privateKey);

    // 4. Update Database (Overwrite existing wallet)
    // We use UPSERT to either create or update the row
    const { error: dbError } = await supabase
        .from('wallets')
        .upsert({
            user_id: user.id,
            address: wallet.address,
            private_key: encryptedKey,
            readable_id: 'CORE-' + user.id.slice(0, 6).toUpperCase(), // Ensure ID stays
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

    if (dbError) {
        console.error("DB Import Error:", dbError);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, address: wallet.address });

  } catch (err: any) {
    console.error("Import Crash:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}