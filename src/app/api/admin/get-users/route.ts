import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Initialize Supabase with SERVICE ROLE (Bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch All Wallets
    const { data: users, error } = await supabase
      .from('wallets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 2. SELF-HEALING: Check for missing IDs and fix them on the fly
    const fixedUsers = await Promise.all(users.map(async (user) => {
        // If user has no Readable ID, generate one NOW
        if (!user.readable_id || user.readable_id.trim() === '') {
            const randomNum = Math.floor(100000 + Math.random() * 900000);
            const newId = `CORE-${randomNum}`;
            
            console.log(`[Auto-Fix] Generating ID for ${user.id} -> ${newId}`);

            // Update DB
            await supabase
                .from('wallets')
                .update({ readable_id: newId })
                .eq('id', user.id); // Update by row ID
            
            // Return fixed user object for the UI
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