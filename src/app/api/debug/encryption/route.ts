import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET() {
  try {
    const report: any = {
      status: 'running_diagnostics',
      tests: {},
      database_check: {}
    };

    // TEST 1: System Integrity
    // Can we encrypt and decrypt a simple string right now?
    const testMessage = "corecoin-test-message";
    const encrypted = encrypt(testMessage);
    const decrypted = decrypt(encrypted);
    
    report.tests.system_integrity = {
      original: testMessage,
      encrypted_format: encrypted.includes(':') ? 'Valid (contains :)' : 'INVALID',
      decrypted_result: decrypted,
      passed: decrypted === testMessage
    };

    if (decrypted !== testMessage) {
      return NextResponse.json({ 
        CRITICAL_FAILURE: "Encryption system is broken. Check src/lib/encryption.ts",
        report 
      });
    }

    // TEST 2: Database Check
    // Let's look at the actual user causing the error
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    // Get the current logged in user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      report.database_check = "No user logged in. Please log in to test specific wallet.";
    } else {
      const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      
      if (!wallet) {
        report.database_check = "User has no wallet entry.";
      } else {
        // Try to decrypt THIS user's specific key
        const rawKey = wallet.private_key;
        const result = decrypt(rawKey);
        
        report.database_check = {
          user_id: user.id,
          wallet_address: wallet.address,
          raw_key_format_valid: rawKey && rawKey.includes(':'),
          decryption_attempt: result ? "SUCCESS" : "FAILED",
          // Show the first few chars to see if it looks like "iv:content" or "0x..."
          raw_key_preview: rawKey ? rawKey.substring(0, 10) + "..." : "null"
        };
      }
    }

    return NextResponse.json(report);

  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}