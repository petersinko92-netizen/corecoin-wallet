import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
             return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { userId, gasOverride } = await request.json();

    if (!userId || typeof gasOverride !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    // Toggle logic in DB
    const { error } = await supabase
      .from('wallets')
      .update({ gas_override: gasOverride })
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("ADMIN GAS TOGGLE ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
