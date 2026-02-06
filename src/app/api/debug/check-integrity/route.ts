import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { decrypt } from '@/lib/encryption';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(n){return cookieStore.get(n)?.value}, set(n,v,o){cookieStore.set({name:n,value:v,...o})}, remove(n,o){cookieStore.delete({name:n,...o})} } }
  );

  // Fetch all wallets (Warning: Only do this in dev/test)
  const { data: wallets } = await supabase.from('wallets').select('user_id, address, private_key');

  if (!wallets) return NextResponse.json({ message: "No wallets" });

  const report = [];

  for (const w of wallets) {
      try {
          const decryptedKey = decrypt(w.private_key);
          const wallet = new ethers.Wallet(decryptedKey);
          
          if (wallet.address.toLowerCase() === w.address.toLowerCase()) {
              report.push({ user: w.user_id, status: "MATCH ✅" });
          } else {
              report.push({ 
                  user: w.user_id, 
                  status: "MISMATCH ❌", 
                  dbAddress: w.address, 
                  realAddress: wallet.address 
              });
          }
      } catch (e) {
          report.push({ user: w.user_id, status: "DECRYPT FAIL ❌" });
      }
  }

  return NextResponse.json({ report });
}