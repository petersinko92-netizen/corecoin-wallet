import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // ✅ PREVENTS CACHING

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    let allTransactions: any[] = [];
    let from = 0;
    const step = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + step - 1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        allTransactions = allTransactions.concat(data);
      }
      
      if (!data || data.length < step) {
        hasMore = false;
      } else {
        from += step;
      }
    }
    
    const transactions = allTransactions;



    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}