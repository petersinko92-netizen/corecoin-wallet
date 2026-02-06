"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Copy, Eye, EyeOff, User, 
  ArrowDownLeft, ArrowUpRight, Search, Bell, ChevronRight 
} from 'lucide-react';
import { CRYPTO_ASSETS } from '@/lib/constants';
import { AssetIcon } from '@/components/dashboard/AssetIcon';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

export default function WalletPage() {
  const supabase = createClient();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  
  // Safe Fallback Prices
  const [prices, setPrices] = useState<Record<string, number>>({
    BTC: 96000, ETH: 2800, USDT: 1.00, SOL: 145, TRX: 0.20
  });
  
  const [hideBalance, setHideBalance] = useState(false);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [dailyExpense, setDailyExpense] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Wallet (Now contains readable_id!)
      const { data: w } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setWallet(w); 
      // Note: We don't need to fetch 'user_security' anymore just for the ID.

      // 2. Safe Price Fetch (Anti-Crash)
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,tron&vs_currencies=usd&include_24hr_change=true');
        if (!res.ok) throw new Error("Rate limit");
        const p = await res.json();
        setPrices({ 
          BTC: p.bitcoin.usd, ETH: p.ethereum.usd, USDT: 1.00, SOL: p.solana.usd, TRX: p.tron.usd 
        });
      } catch (e) {
        // Silent fail - keeps fallback prices
      }

      // 3. Transactions Stats
      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', user.id);
      if (txData) {
        const income = txData.filter(t => t.type === 'deposit').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const expense = txData.filter(t => t.type === 'withdrawal').reduce((acc, curr) => acc + Number(curr.amount), 0);
        setDailyIncome(income);
        setDailyExpense(expense);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const getBalance = (assetId: string) => {
    if (!wallet) return 0;
    const map: Record<string, number> = {
      'BTC': wallet.btc_balance, 'ETH': wallet.balance, 'USDT': wallet.usdt_balance,
      'SOL': wallet.sol_balance, 'TRX': wallet.trx_balance
    };
    return map[assetId] || 0;
  };

  const totalBalance = CRYPTO_ASSETS.reduce((acc, asset) => {
    const bal = getBalance(asset.id);
    const price = prices[asset.id] || 0;
    return acc + (bal * price);
  }, 0);

  const handleCopyAddr = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success("Address Copied");
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#F3F4F6]'}`}>
       <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-8 pb-32 animate-in fade-in duration-500">
      
      {/* 1. MATURE HEADER */}
      <div className="flex items-center justify-between mb-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
           <span onClick={() => router.push('/dashboard')} className="hover:text-emerald-500 cursor-pointer transition-colors">Dashboard</span>
           <ChevronRight size={10} />
           <span className={`${theme === 'dark' ? 'text-white' : 'text-slate-900'} font-bold`}>Wallet</span>
        </div>
         
        {/* Utility Icons */}
        <div className="hidden md:flex items-center gap-4">
           <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-slate-200'}`}>
              <Search size={14} className="text-zinc-500" />
              <input type="text" placeholder="Filter..." className={`bg-transparent outline-none text-xs w-32 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} />
           </div>

           <button className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'} transition-colors`}>
              <Bell size={16} />
           </button>

           <button 
             onClick={() => router.push('/dashboard/profile')}
             className={`p-2 rounded-lg border transition-colors ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-emerald-500' : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600'}`}
           >
             <User size={16} />
           </button>
        </div>
      </div>
      
      {/* 2. MASTER CARD */}
      <div className="relative rounded-3xl p-8 md:p-10 mb-8 shadow-2xl overflow-hidden group">
        <div className={`absolute inset-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-gradient-to-r from-zinc-900 to-[#0c0c0c]' : 'bg-gradient-to-r from-slate-900 to-slate-800'}`} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <User size={12} className="text-emerald-400" />
                {/* ✅ FIX: Read ID from Wallet, NOT Security */}
                <span className="text-xs font-bold font-mono tracking-wide text-white/90">
                    {wallet?.readable_id || "Loading..."}
                </span>
              </div>
              <div className="flex items-center gap-1 text-white/50 text-sm">
                <span>Total Balance</span>
                <button onClick={() => setHideBalance(!hideBalance)} className="hover:text-white transition-colors">
                  {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight break-words">
              {hideBalance ? '••••••' : totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </h1>

            <div 
              onClick={handleCopyAddr}
              className="flex items-center gap-2 bg-black/20 w-fit px-4 py-2 rounded-xl border border-white/5 hover:bg-black/40 cursor-pointer transition-all active:scale-95"
            >
              <div className={`w-2 h-2 rounded-full ${wallet ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <code className="text-sm text-white/80 font-mono">
                {wallet ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` : 'Generating...'}
              </code>
              {wallet && <Copy size={14} className="text-white/40 ml-2" />}
            </div>
          </div>

          <div className="flex flex-col justify-center min-w-full md:min-w-[280px]">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
              <div>
                <p className="text-xs text-white/50 mb-1 font-bold uppercase">Income</p>
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <ArrowDownLeft size={18} /> ${dailyIncome.toFixed(2)}
                </div>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="text-xs text-white/50 mb-1 font-bold uppercase">Expense</p>
                <div className="flex items-center gap-2 text-red-400 font-bold text-lg">
                  <ArrowUpRight size={18} /> ${dailyExpense.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSETS LIST */}
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>
        Portfolio <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-white/10 text-zinc-300' : 'bg-slate-200 text-slate-600'}`}>{CRYPTO_ASSETS.length}</span>
      </h3>

      <div className="space-y-3">
        {CRYPTO_ASSETS.map((asset) => {
          const balance = getBalance(asset.id);
          const price = prices[asset.id] || 0;
          const value = balance * price;

          return (
            <button
              key={asset.id}
              onClick={() => router.push(`/dashboard/wallet/${asset.id}`)}
              className={`w-full rounded-2xl p-4 flex items-center justify-between group transition-all shadow-sm hover:shadow-md active:scale-[0.99]
                ${theme === 'dark' 
                  ? 'bg-[#0a0a0a] border border-white/5 hover:bg-white/5' 
                  : 'bg-white border border-slate-100 hover:border-slate-200'
                }
              `}
            >
              <div className="flex items-center gap-4">
                 <AssetIcon symbol={asset.id} size="md" />
                 
                 <div className="text-left">
                    <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{asset.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">${price.toLocaleString()}</span>
                    </div>
                 </div>
              </div>
              
              <div className="text-right">
                 <div className={`font-mono text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {hideBalance ? '•••' : value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                 </div>
                 <div className="text-xs text-zinc-500 font-mono">
                   {hideBalance ? '•••' : balance} {asset.id}
                 </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}