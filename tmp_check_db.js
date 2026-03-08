const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('wallets').select('*').limit(1);
  if (error) {
    console.error("DB Error:", error);
  } else if (data && data.length > 0) {
    console.log("Columns Present:", Object.keys(data[0]).join(', '));
    console.log("\nSpecific Tracking Columns:");
    console.log("last_chain_balance exists?", 'last_chain_balance' in data[0]);
    console.log("last_usdt_chain_balance exists?", 'last_usdt_chain_balance' in data[0]);
  } else {
    console.log("Table 'wallets' is empty, but query succeeded.");
  }
}
check();
