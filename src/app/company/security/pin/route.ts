import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // 1. Handle Cookies (Async for Next.js 15/16)
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
             try { cookieStore.set({ name, value, ...options }); } catch (e) {}
          },
          remove(name: string, options: any) {
             try { cookieStore.delete({ name, ...options }); } catch (e) {}
          },
        },
      }
    );

    // 2. Verify Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Please log in again' }, { status: 401 });
    }

    // 3. Parse Request
    const body = await request.json();
    const { action, pin } = body;

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: 'Invalid PIN format (Must be 4 digits)' }, { status: 400 });
    }

    // --- ACTION: SET PIN ---
    if (action === 'set') {
      console.log("Setting PIN for User ID:", user.id);
      
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(pin, salt);

      const { error: dbError } = await supabase.from('user_security').upsert({
        id: user.id,
        pin_hash: hash,
        updated_at: new Date().toISOString()
      });

      if (dbError) {
        console.error("Supabase Database Error:", dbError);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // --- ACTION: VERIFY PIN ---
    if (action === 'verify') {
      const { data, error: fetchError } = await supabase
        .from('user_security')
        .select('pin_hash')
        .eq('id', user.id)
        .single();
      
      if (fetchError || !data?.pin_hash) {
        return NextResponse.json({ error: 'PIN not set. Please create one.' }, { status: 404 });
      }

      const isValid = await bcrypt.compare(pin, data.pin_hash);
      
      if (isValid) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ error: 'Incorrect PIN' }, { status: 403 });
      }
    }

    return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });

  } catch (err: any) {
    // THIS IS THE IMPORTANT PART: It logs the real crash to your terminal
    console.error("SERVER CRASH at /api/security/pin:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}