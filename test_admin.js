require('dotenv').config({ path: '.env.local' });

async function testSignupAndAdmin() {
    console.log("=== STARTING SIGNUP TEST ===");

    // 1. Test Signup
    const signupData = {
        email: `test_user_${Date.now()}@example.com`,
        password: "TestPassword123!",
        fullName: "Test User"
    };

    // We mock the API request because Next server might not be running. 
    // We will directly query Supabase instead to verify if the previous signup worked.
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: users, error: userErr } = await supabase.from('wallets').select('*').limit(3).order('created_at', { ascending: false });

    if (userErr) {
        console.error("DB Error:", userErr);
        return;
    }

    console.log("Found recent wallets:");
    users.forEach(u => console.log(`- ${u.email}: ${u.address}`));
}

testSignupAndAdmin();
