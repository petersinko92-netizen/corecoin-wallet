import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto'; // ✅ Needed for Hex ID generation

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 1. Fetch All Wallets
    const { data: users, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. SELF-HEALING: Fix missing IDs
    const fixedUsers = await Promise.all(users.map(async (user) => {
        if (!user.readable_id || user.readable_id.trim() === '') {
            // ✅ FIX: Match the Signup Hex Format (CORE-A1B2C3)
            const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
            const newId = `CORE-${randomHex}`;
            
            console.log(`[Auto-Fix] Generating ID for ${user.id} -> ${newId}`);

            await supabase
                .from('wallets')
                .update({ readable_id: newId })
                .eq('id', user.id);
            
            return { ...user, readable_id: newId };
        }
        return user;
    }));

    return NextResponse.json({ success: true, users: fixedUsers });

  } catch (error: any) {
    console.error("Get Users Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}