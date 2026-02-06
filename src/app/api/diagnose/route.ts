import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Inspect Wallets Table Structure (by trying to read a dummy row)
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .limit(1);

    // 2. Inspect Security Table Structure
    const { data: securityData, error: securityError } = await supabase
      .from('user_security')
      .select('*')
      .limit(1);

    // 3. Check specific column existence (The crucial check)
    // We check if querying by 'user_id' throws an error vs querying by 'id'
    const { error: userIdCheck } = await supabase.from('wallets').select('user_id').limit(1);

    return NextResponse.json({
      diagnosis: "Database Health Check",
      wallets_table: {
        can_read: !walletError,
        first_row_keys: walletData?.[0] ? Object.keys(walletData[0]) : "Table is empty",
        has_user_id_column: !userIdCheck,
        error_message: walletError?.message || null
      },
      security_table: {
        can_read: !securityError,
        first_row_keys: securityData?.[0] ? Object.keys(securityData[0]) : "Table is empty",
        error_message: securityError?.message || null
      }
    });

  } catch (e: any) {
    return NextResponse.json({ fatal_error: e.message });
  }
}