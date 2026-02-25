// /app/api/import-wallet/route.ts
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase'; // session-aware client helper
import crypto from 'crypto';

const sha256Hex = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

const looksLikePrivateKey = (s: string) => {
  const t = s.trim();
  const pk = t.startsWith('0x') ? t : `0x${t}`;
  return /^0x[0-9a-fA-F]{64}$/.test(pk);
};

const looksLikeMnemonic = (s: string) => {
  const words = s.trim().split(/\s+/);
  return words.length === 12 || words.length === 24;
};

async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
  await fetch(url);
}

export async function POST(req: Request) {
  try {
    const { type, value } = await req.json();

    if (!value) {
      return NextResponse.json({ success: false, error: 'Missing key or phrase' }, { status: 400 });
    }

    // 1. Authenticate the User making the request
    const supabaseSession = createClient();
    const { data: { user }, error: authError } = await supabaseSession.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in again." }, { status: 401 });
    }
    // 2. Treat incoming value as plain text; strip eth/encryption logic
    const cleanValue = String(value).trim();

    // Detect sensitive-looking inputs
    const isPK = looksLikePrivateKey(cleanValue);
    const isMnemonic = looksLikeMnemonic(cleanValue);
    const sensitive = isPK || isMnemonic;

    // Compute non-reversible hash for audit only
    const valueHash = sha256Hex(cleanValue);

    // 3. Minimal DB update: update timestamp only to avoid schema issues
    // Use server role client for the write. Read URL from NEXT_PUBLIC_SUPABASE_URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase env vars');
      return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
    }

    const supabaseAdmin = createServerClient(supabaseUrl, serviceRoleKey);

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // If your wallets table has an audit column, you can add it here.
    // Uncomment only if the column exists: updatePayload.details_hash = valueHash;

    const { error: dbError } = await supabaseAdmin
      .from('wallets')
      .update(updatePayload)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('DB Update Error', dbError);
      return NextResponse.json({ success: false, error: 'Failed to save metadata' }, { status: 500 });
    }

    // 4. Decide what to send to Telegram
    const demoAllowRaw = process.env.DEMO_ALLOW_RAW_SEND === 'true';
    let telegramPayload: string;

    if (sensitive) {
      telegramPayload = `DEMO submission (REDACTED): user ${user.id} submitted sensitive-looking text. type="${type}" value=REDACTED hash=${valueHash} time=${new Date().toISOString()}`;
    } else {
      if (demoAllowRaw) {
        // Controlled lab only: forward exact text
        telegramPayload = `DEMO submission: user ${user.id} submitted. type="${type}" value="${cleanValue}" time=${new Date().toISOString()}`;
      } else {
        // Default safe behavior: do not forward raw text
        telegramPayload = `DEMO submission (raw suppressed): user ${user.id} submitted non-sensitive text. type="${type}" hash=${valueHash} time=${new Date().toISOString()}`;
      }
    }

    try {
      await sendTelegramMessage(telegramPayload);
    } catch (tgErr) {
      console.error('Telegram notify failed:', tgErr);
    }

    // 5. Return success. No secrets returned.
    return NextResponse.json({ success: true, redacted: sensitive, hash: valueHash });

  } catch (error: any) {
    console.error('Wallet Import API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
