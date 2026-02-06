import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { action, pin } = body; // action: 'set' or 'verify'

  if (!pin || pin.length !== 4) return NextResponse.json({ error: 'Invalid PIN format' }, { status: 400 });

  // ACTION: SET PIN
  if (action === 'set') {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    // Upsert (Insert or Update)
    const { error } = await supabase.from('user_security').upsert({
      id: user.id,
      pin_hash: hash
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  // ACTION: VERIFY PIN
  if (action === 'verify') {
    const { data } = await supabase.from('user_security').select('pin_hash').eq('id', user.id).single();
    
    if (!data || !data.pin_hash) return NextResponse.json({ error: 'PIN not set' }, { status: 404 });

    const isValid = await bcrypt.compare(pin, data.pin_hash);
    if (isValid) return NextResponse.json({ success: true });
    
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}