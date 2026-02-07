import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ethers } from 'ethers'; 
import { encrypt } from '@/lib/encryption';
import crypto from 'crypto'; // ✅ Needed for the ID generation

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // 1. Initialize Admin Client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (authError) {
       if (authError.message.includes("already registered")) {
         return NextResponse.json({ error: "User already exists. Please log in." }, { status: 400 });
       }
       throw authError;
    }

    if (!authData.user) throw new Error("User creation failed");
    const userId = authData.user.id;

    // 3. GENERATE WALLET & ID
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    
    // ✅ FIXED: Generate ID in 'CORE-XXXXXX' format
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); 
    const readableId = `CORE-${randomHex}`;
    
    // Encrypt Private Key
    const encryptedKey = encrypt(wallet.privateKey);

    // 4. Insert into Wallets
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({
        user_id: userId,
        address: address,                
        readable_id: readableId,         // ✅ Now saves as "CORE-D508F8"
        email: email,                    
        private_key: encryptedKey,       
        encrypted_private_key: encryptedKey, 
        currency: 'ETH',                 
        network: 'mainnet',              
        is_primary: true,                
        balance: 0.00,
        btc_balance: 0.00,
        usdt_balance: 0.00,
        sol_balance: 0.00,
        trx_balance: 0.00
      });

    // 5. Create Profile
    await supabaseAdmin.from('profiles').insert({
        user_id: userId,
        email: email,
        full_name: fullName
    });

    if (walletError) {
       console.error("Wallet DB Insert Error:", walletError);
    }

    return NextResponse.json({ success: true, userId });

  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}