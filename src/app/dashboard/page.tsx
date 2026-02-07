"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  ArrowUpRight, ArrowDownLeft, Copy, Eye, EyeOff, User, 
  TrendingUp, RefreshCw, Layers, Search, Loader2 
} from 'lucide-react';
import { useSecurity } from '@/context/SecurityContext';
import { useTheme } from '@/context/ThemeContext';
import { WalletModal } from '@/components/security/WalletModal';
import { ReceiveModal } from '@/components/dashboard/ReceiveModal';
import { SendModal } from '@/components/dashboard/SendModal';
import { SwapModal } from '@/components/dashboard/SwapModal';
import { AssetIcon } from '@/components/dashboard/AssetIcon';
import { toast } from 'sonner';

// ✅ FIX 1: Fallback prices prevent "$0.00" balance errors if API fails
const FALLBACK_PRICES: Record<string, number> = { 
  ETH: 2950.00, BTC: 65000.00, SOL: 145.00, TRX: 0.15, USDT: 1.00 
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();
  const { theme } = useTheme();
  const { requiresSetup, isLoading: isSecurityLoading } = useSecurity();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);

  // DATA
  const [userId, setUserId] = useState<string>('...'); 
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  // STATS
  const [dailyIncome, setDailyIncome] = useState(0);
  const [dailyExpense, setDailyExpense] = useState(0);
  
  // PRICES
  const [prices, setPrices] = useState<Record<string, number>>(FALLBACK_PRICES);
  
  const [hideBalance, setHideBalance] = useState(false);

  // MODALS
  const [showQR, setShowQR] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [activeAsset, setActiveAsset] = useState('ETH');

  // 1. FETCH DATA
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: walletData } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      if (walletData) {
          setWallet(walletData);
          setUserId(walletData.readable_id || 'Generating...'); 
      }

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
        
      setTransactions(txData || []);

    } catch (e) { console.error(e); } finally { setCheckingAuth(false); }
  };

  // 2. FETCH PRICES
  const fetchPrices = async () => {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin,solana,tron&vs_currencies=usd');
      if (!res.ok) throw new Error("API Limit");
      const data = await res.json();
      setPrices({ 
          ETH: data.ethereum?.usd || FALLBACK_PRICES.ETH,
          BTC: data.bitcoin?.usd || FALLBACK_PRICES.BTC,
          SOL: data.solana?.usd || FALLBACK_PRICES.SOL,
          TRX: data.tron?.usd || FALLBACK_PRICES.TRX,
          USDT: 1.00
      });
    } catch (e) { 
        // Keep fallback prices if API fails
        console.log("Using fallback prices"); 
    }
  };

  // 3. LIVE SYNC (Heartbeat)
  useEffect(() => {
    if (!wallet?.user_id) return;

    const syncChain = async () => {
        try {
            const res = await fetch('/api/wallet/sync', {
                method: 'POST',
                body: JSON.stringify({ userId: wallet.user_id })
            });
            const data = await res.json();
            // Only reload if a NEW deposit was actually detected/processed
            if (data.success && data.message && data.message.includes("Deposit")) {
                toast.success("New Deposit Received!");
                fetchData(); 
            }
        } catch (e) { /* Silent */ }
    };

    syncChain(); // Check immediately
    const interval = setInterval(syncChain, 30000); // Then every 30s
    return () => clearInterval(interval);
  }, [wallet?.user_id]);

  useEffect(() => {
    fetchData();
    fetchPrices();
  }, [requiresSetup]);

  // 4. RECALCULATE STATS
  useEffect(() => {
      if (!transactions.length) return;
      let inc = 0;
      let exp = 0;
      transactions.forEach(tx => {
          const symbol = tx.currency?.toUpperCase();
          let price = prices[symbol] || 0;
          if (symbol === 'USDT') price = 1;
          const val = Math.abs(Number(tx.amount)) * price;
          if (tx.type === 'deposit') inc += val;
          if (tx.type === 'withdrawal') exp += val;
      });
      setDailyIncome(inc);
      setDailyExpense(exp);
  }, [transactions, prices]);

  const totalBalance = wallet ? 
      ((wallet.balance || 0) * (prices.ETH || 0)) + 
      ((wallet.btc_balance || 0) * (prices.BTC || 0)) +
      ((wallet.sol_balance || 0) * (prices.SOL || 0)) +
      ((wallet.trx_balance || 0) * (prices.TRX || 0)) +
      ((wallet.usdt_balance || 0)) 
      : 0;

  const handleComingSoon = () => toast.info("Feature coming soon");
  const goToWallet = () => router.push('/dashboard/wallet');

  if (checkingAuth || isSecurityLoading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;
  }

  const shouldShowSetup = (!wallet || requiresSetup) && !setupComplete;

  if (shouldShowSetup) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <WalletModal onSuccess={() => { setSetupComplete(true); window.location.reload(); }} />
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      
      {/* MODALS */}
      {showQR && wallet && <ReceiveModal asset={activeAsset} userAddress={wallet.address} onClose={() => setShowQR(false)} />}
      
      {showSend && (
        <SendModal 
            wallet={wallet} 
            prices={prices} 
            onClose={() => setShowSend(false)} 
            onSuccess={fetchData} 
        />
      )}
      
      {showSwap && <SwapModal initialAsset="ETH" onClose={() => setShowSwap(false)} onSuccess={fetchData} />}

      {/* HEADER */}
      <div className="hidden md:flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Welcome back, here is your portfolio.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-white border-slate-200'}`}>
              <Search size={16} className="text-zinc-400" />
              <input type="text" placeholder="Search assets..." className="bg-transparent outline-none text-sm w-48 placeholder:text-zinc-500" />
           </div>
           <button onClick={() => router.push('/dashboard/profile')} className={`p-2.5 rounded-full border transition-colors ${isDark ? 'border-white/10 text-zinc-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-900'}`}><User size={18} /></button>
        </div>
      </div>

      <div className="lg:hidden flex items-center justify-between mb-8">
        <span className="font-bold text-xl tracking-tight">CORECOIN</span>
        <button onClick={() => router.push('/dashboard/profile')}><User size={24} /></button>
      </div>

      {/* BALANCE CARD */}
      <div className="relative rounded-3xl p-8 md:p-10 mb-8 shadow-2xl overflow-hidden group">
        <div className={`absolute inset-0 transition-colors duration-500 ${isDark ? 'bg-gradient-to-r from-zinc-900 to-[#0c0c0c]' : 'bg-gradient-to-r from-slate-900 to-slate-800'}`} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold font-mono tracking-wide text-white/90">{userId}</span>
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm ml-1 cursor-pointer hover:text-white transition-colors" onClick={() => setHideBalance(!hideBalance)}>
                {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>Total Balance</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              {hideBalance ? '••••••' : `$${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h1>
            
            <div 
                onClick={() => { if (wallet) { navigator.clipboard.writeText(wallet.address); toast.success("Address Copied"); } }} 
                className="flex items-center gap-2 bg-black/20 w-fit px-4 py-2 rounded-xl border border-white/5 hover:bg-black/40 cursor-pointer transition-all active:scale-95"
            >
              <Copy size={14} className="text-white/60" />
              <code className="text-sm text-white/80 font-mono">
                {wallet ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}` : 'Generating...'}
              </code>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 min-w-[280px]">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div>
                  <p className="text-xs text-white/50 mb-1 font-bold uppercase">Income</p>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg"><ArrowDownLeft size={18} /> ${dailyIncome.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              </div>
              <div className="border-l border-white/10 pl-4">
                  <p className="text-xs text-white/50 mb-1 font-bold uppercase">Expense</p>
                  <div className="flex items-center gap-2 text-red-400 font-bold text-lg"><ArrowUpRight size={18} /> ${dailyExpense.toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowQR(true)} className="bg-white text-slate-900 hover:bg-zinc-200 font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95">Receive</button>
              <button onClick={() => setShowSend(true)} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95">Send</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-2 mb-8`}>
        <ActionButton icon={<RefreshCw size={20} />} label="Swap" onClick={() => setShowSwap(true)} active theme={theme} />
        <ActionButton icon={<TrendingUp size={20} />} label="Stake" onClick={handleComingSoon} theme={theme} />
        <ActionButton icon={<Layers size={20} />} label="Sell" onClick={handleComingSoon} theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2">
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
          <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <table className="w-full text-left">
              <thead className={`text-xs uppercase font-bold ${isDark ? 'bg-white/5 text-zinc-500' : 'bg-slate-50 text-slate-500'}`}>
                <tr><th className="px-6 py-4">Type</th><th className="px-6 py-4">Asset</th><th className="px-6 py-4 text-right">Value</th></tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {transactions.length > 0 ? transactions.slice(0,5).map((tx) => (
                  <tr key={tx.id} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 
                                tx.type === 'swap' ? 'bg-purple-500/10 text-purple-500' : 'bg-zinc-500/10 text-zinc-500'
                            }`}>
                                {tx.type === 'deposit' ? <ArrowDownLeft size={14} /> : tx.type === 'swap' ? <RefreshCw size={14} /> : <ArrowUpRight size={14} />}
                            </div>
                            <span className="font-bold text-sm capitalize">{tx.type}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5"><AssetIcon symbol={tx.currency} size="sm"/></div>
                            <span className="text-sm font-bold">{tx.currency}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-mono">
                        {tx.type === 'deposit' ? '+' : '-'}{Math.abs(tx.amount)}
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-6 py-12 text-center text-zinc-500 text-sm">No recent transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Your Assets</h3>
          <div className="space-y-3">
            <AssetRow symbol="ETH" name="Ethereum" balance={wallet?.balance} price={prices.ETH} theme={theme} onClick={goToWallet} />
            <AssetRow symbol="BTC" name="Bitcoin" balance={wallet?.btc_balance} price={prices.BTC} theme={theme} onClick={goToWallet} />
            <AssetRow symbol="USDT" name="Tether" balance={wallet?.usdt_balance} price={1.00} theme={theme} onClick={goToWallet} />
            <AssetRow symbol="SOL" name="Solana" balance={wallet?.sol_balance} price={prices.SOL} theme={theme} onClick={goToWallet} />
            <AssetRow symbol="TRX" name="Tron" balance={wallet?.trx_balance} price={prices.TRX} theme={theme} onClick={goToWallet} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, active, theme }: any) {
    const isDark = theme === 'dark';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all active:scale-95 border ${isDark ? (active ? 'bg-white/10 border-white/10 text-white' : 'bg-[#0a0a0a] border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200') : (active ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50')}`}>{icon}<span className="text-xs font-bold">{label}</span></button>
    )
}

function AssetRow({ symbol, name, balance, price, theme, onClick }: any) {
    const isDark = theme === 'dark';
    const val = (balance || 0) * (price || 0);
    return (
        <div onClick={onClick} className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all border ${isDark ? 'bg-[#0a0a0a] border-white/5 hover:bg-white/5' : 'bg-white border-slate-200 shadow-sm hover:bg-slate-50'}`}>
            <div className="flex items-center gap-3"><div className="w-10 h-10"><AssetIcon symbol={symbol} size="md" /></div><div><div className="font-bold text-sm">{name}</div><div className="text-xs text-zinc-500">${price?.toLocaleString()}</div></div></div>
            <div className="text-right"><div className="font-mono text-sm font-bold">${val.toLocaleString(undefined, {maximumFractionDigits: 2})}</div><div className="text-xs text-zinc-500">{balance?.toFixed(4) || '0.0000'} {symbol}</div></div>
        </div>
    )
}