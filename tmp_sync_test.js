const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSync() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: user } = await supabase.from('wallets').select('user_id, address').limit(1).single();
  if(!user) return console.log("No user");
  console.log("Testing sync for user:", user.user_id, "address:", user.address);

  const res = await fetch('http://localhost:3000/api/wallet/sync', {
    method: 'POST', body: JSON.stringify({userId: user.user_id, asset: 'ETH'}),
    headers: { 'Content-Type': 'application/json' }
  });
  console.log("ETH Sync:", await res.json());

  const resUsdt = await fetch('http://localhost:3000/api/wallet/sync', {
    method: 'POST', body: JSON.stringify({userId: user.user_id, asset: 'USDT'}),
    headers: { 'Content-Type': 'application/json' }
  });
  console.log("USDT Sync:", await resUsdt.json());
}
testSync();
