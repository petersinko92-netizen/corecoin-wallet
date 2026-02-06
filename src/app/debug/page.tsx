"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function DebugPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus({ error: "Not Logged In" });
        setLoading(false);
        return;
      }

      // 2. Check Wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // 3. Check Security
      const { data: security, error: secError } = await supabase
        .from('user_security')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setStatus({
        userId: user.id,
        userEmail: user.email,
        walletFound: !!wallet,
        walletData: wallet || "NULL",
        walletError: walletError?.message || "None",
        securityFound: !!security,
        pinSet: security?.is_pin_set,
        securityError: secError?.message || "None"
      });
      setLoading(false);
    }
    check();
  }, []);

  if (loading) return <div className="p-10 text-white">Scanning Database...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono">
      <h1 className="text-2xl font-bold text-emerald-500 mb-6">System Diagnostic</h1>
      
      <div className="space-y-4">
        <div className="p-4 border border-zinc-800 rounded">
          <h3 className="text-zinc-500">Authenticated User</h3>
          <p className="text-xl">{status.userId || "No User"}</p>
          <p className="text-sm text-zinc-400">{status.userEmail}</p>
        </div>

        <div className={`p-4 border rounded ${status.walletFound ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
          <h3 className={status.walletFound ? "text-emerald-500" : "text-red-500"}>
            1. Wallet Table {status.walletFound ? "✅ OK" : "❌ MISSING"}
          </h3>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(status.walletData, null, 2)}</pre>
          {status.walletError !== "None" && <p className="text-red-400 mt-2">Error: {status.walletError}</p>}
        </div>

        <div className={`p-4 border rounded ${status.securityFound && status.pinSet ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-red-500/50 bg-red-900/10'}`}>
          <h3 className={status.securityFound ? "text-emerald-500" : "text-red-500"}>
            2. Security Table {status.securityFound ? "✅ OK" : "❌ MISSING"}
          </h3>
          <p>PIN Set: {status.pinSet ? "TRUE" : "FALSE"}</p>
          {status.securityError !== "None" && <p className="text-red-400 mt-2">Error: {status.securityError}</p>}
        </div>
      </div>

      <div className="mt-8">
        <button onClick={() => window.location.href = '/dashboard'} className="bg-white text-black px-6 py-3 rounded font-bold">
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
}