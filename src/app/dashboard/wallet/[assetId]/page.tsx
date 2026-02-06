"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { 
  ArrowLeft, Send, QrCode, RefreshCw, 
  ArrowDownLeft, ArrowUpRight, Loader2, History, XCircle 
} from 'lucide-react';
import { CRYPTO_ASSETS } from '@/lib/constants';
import { SmartSendModal } from '@/components/dashboard/SmartSendModal';
import { ReceiveModal } from '@/components/dashboard/ReceiveModal';
import { SwapModal } from '@/components/dashboard/SwapModal';
import { TransactionReceipt } from '@/components/dashboard/TransactionReceipt';
import { AssetIcon } from '@/components/dashboard/AssetIcon';
import { useTheme } from '@/context/ThemeContext'; 
import { toast } from 'sonner';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();
  
  const assetId = typeof params.assetId === 'string' ? params.assetId.toUpperCase() : 'ETH';
  const assetConfig = CRYPTO_ASSETS.find(a => a.id === assetId);

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [price, setPrice] = useState(0);
  const [change24h, setChange24h] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  
  const [action, setAction] = useState<'send' | 'receive' | 'swap' | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null); 

  const fallbackPrices: Record<string, number> = {
    BTC: 65000, ETH: 2950, USDT: 1.00, SOL: 145, TRX: 0.15
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Wallet (Single Row)
      const { data: w } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (w) setWallet(w);

      // 2. Fetch Price (CoinGecko)
      const coinIdMap: any = { 'BTC': 'bitcoin', 'ETH': 'ethereum', 'USDT': 'tether', 'SOL': 'solana', 'TRX': 'tron' };
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIdMap[assetId]}&vs_currencies=usd&include_24hr_change=true`);
        if (!res.ok) throw new Error("Limit");
        const p = await res.json();
        const coinData = p[coinIdMap[assetId]];
        setPrice(coinData?.usd || 0);
        setChange24h(coinData?.usd_24h_change || 0);
      } catch (e) {
         setPrice(fallbackPrices[assetId] || 0);
      }

      // 3. Fetch Transactions (OPTIMIZED: Filtered in Database)
      // We explicitly ask for transactions where currency == assetId
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('currency', assetId) // ✅ Database-side filtering
        .order('created_at', { ascending: false })
        .limit(50); // Pagination safety

      if (txs) setTransactions(txs);

    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setLoading(false);
    }
  }, [assetId, supabase]);

  // INITIAL LOAD & REALTIME
  useEffect(() => {
    if(!assetConfig) { router.push('/dashboard/wallet'); return; }
    
    fetchData(); 

    // Listen for NEW transactions for THIS asset only
    const channel = supabase
      .channel(`asset_updates_${assetId}`)
      .on('postgres_changes', { 
         event: '*', 
         schema: 'public', 
         table: 'transactions',
         filter: `currency=eq.${assetId}` // ✅ Only listen for relevant updates
      }, (payload: any) => {
         fetchData();
         
         // Toast Logic
         if (payload.eventType === 'UPDATE' && payload.new.status !== payload.old.status) {
            const newStatus = payload.new.status;
            if (newStatus === 'completed') toast.success("Transaction Confirmed!");
            if (newStatus === 'failed') toast.error("Transaction failed");
         }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [assetId, fetchData, supabase]);

  const getBalance = () => {
    if (!wallet) return 0;
    // ✅ Maps strictly to the DB columns we created
    const map: Record<string, number> = {
      'BTC': wallet.btc_balance, 
      'ETH': wallet.balance, // Main column is ETH
      'USDT': wallet.usdt_balance,
      'SOL': wallet.sol_balance, 
      'TRX': wallet.trx_balance
    };
    return map[assetId] || 0;
  };

  const balance = getBalance();
  const usdValue = balance * price;
  const isDark = theme === 'dark';

  if (loading || !assetConfig) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#050505]' : 'bg-[#F3F4F6]'}`}>
       <Loader2 className="animate-spin text-emerald-500" size={32} />
    </div>
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4 md:p-8 pb-32 animate-in fade-in duration-500">
      
      {/* --- MODAL MANAGER --- */}
      {action === 'receive' && (
        <ReceiveModal asset={assetId} userAddress={wallet.address} onClose={() => setAction(null)} />
      )}
      
      {action === 'send' && (
        <SmartSendModal 
          asset={assetId} 
          balance={balance} 
          onClose={() => setAction(null)} 
          onSuccess={() => { 
             fetchData();
             setAction(null);
          }} 
        />
      )}

      {action === 'swap' && (
        <SwapModal 
          initialAsset={assetId} 
          onClose={() => setAction(null)} 
          onSuccess={() => {
             fetchData();
          }} 
        />
      )}

      {selectedTx && (
        <TransactionReceipt tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className={`p-2 rounded-full border transition-transform active:scale-95 ${isDark ? 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}`}>
           <ArrowLeft size={18} />
        </button>
        <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
           {assetConfig.name} Wallet
        </span>
      </div>

      {/* HERO SECTION */}
      <div className="w-full text-center mb-10">
         <div className="mx-auto mb-3 flex justify-center">
            <AssetIcon symbol={assetId} size="lg" className="drop-shadow-2xl" />
         </div>
         <div className="mb-6">
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-1 break-words ${isDark ? 'text-white' : 'text-slate-900'}`}>
               {usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </h1>
            <div className="flex items-center justify-center gap-2">
               <p className="text-zinc-500 font-mono text-sm font-medium">
                  {balance.toFixed(6)} {assetId}
               </p>
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${change24h >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
               </span>
            </div>
         </div>
         <div className="flex items-center justify-center gap-4">
            <ActionButton icon={Send} label="Send" onClick={() => setAction('send')} />
            <ActionButton icon={QrCode} label="Receive" onClick={() => setAction('receive')} />
            <ActionButton icon={RefreshCw} label="Swap" onClick={() => setAction('swap')} />
         </div>
      </div>

      {/* ACTIVITY LIST */}
      <div className="w-full max-w-2xl mx-auto">
         <div className="flex justify-between items-center px-4 mb-3">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Transaction History</span>
         </div>
         
         <div className={`w-full rounded-3xl overflow-hidden border min-h-[200px] ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            {transactions.length > 0 ? (
               <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {transactions.map((tx) => {
                     const isDeposit = tx.type === 'deposit';
                     const isSwap = tx.type === 'swap'; 
                     const isFailed = tx.status === 'failed';
                     const smartDate = formatListDate(tx.created_at);

                     return (
                        <button 
                           key={tx.id} 
                           onClick={() => setSelectedTx(tx)}
                           className={`w-full text-left p-4 flex items-center justify-between transition-colors group
                             ${isDark ? 'hover:bg-white/[0.03] active:bg-white/[0.05]' : 'hover:bg-slate-50 active:bg-slate-100'}
                           `}
                        >
                           {/* LEFT: ICON + DETAILS */}
                           <div className="flex items-center gap-4 overflow-hidden">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors
                                 ${isFailed ? 'bg-red-500/10 text-red-500' : 
                                   isSwap ? 'bg-purple-500/10 text-purple-500' :
                                   isDeposit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}
                              `}>
                                 {isFailed ? <XCircle size={20} /> : 
                                  isSwap ? <RefreshCw size={18} /> : 
                                  isDeposit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                              </div>
                              <div className="min-w-0 flex flex-col">
                                 <span className={`font-semibold text-sm capitalize truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {isSwap ? 'Swap' : isDeposit ? 'Received' : 'Sent'} {tx.currency}
                                 </span>
                                 <span className="text-xs text-zinc-500 truncate font-medium">
                                    {smartDate} • {tx.status}
                                 </span>
                              </div>
                           </div>

                           {/* RIGHT: AMOUNT */}
                           <div className="text-right shrink-0">
                              <div className={`font-mono text-sm font-bold tracking-tight
                                 ${isFailed ? 'text-zinc-500 line-through' : 
                                   isDeposit ? 'text-emerald-500' : (isDark ? 'text-white' : 'text-slate-900')}
                              `}>
                                 {isDeposit ? '+' : ''}{tx.amount}
                              </div>
                           </div>
                        </button>
                     );
                  })}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
                     <History size={24} className="text-zinc-400" />
                  </div>
                  <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>No transactions</h3>
                  <p className="text-xs text-zinc-500">Activity will appear here once you transact.</p>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: any) {
   const { theme } = useTheme();
   return (
      <button onClick={onClick} className="flex flex-col items-center gap-2 group">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95
            ${theme === 'dark' 
               ? 'bg-zinc-800 text-white hover:bg-emerald-600' 
               : 'bg-white text-slate-700 hover:bg-emerald-500 hover:text-white border border-slate-200'
            }
         `}>
            <Icon size={20} />
         </div>
         <span className={`text-[11px] font-bold transition-colors ${theme === 'dark' ? 'text-zinc-500 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'}`}>{label}</span>
      </button>
   );
}

function formatListDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  
  const d = new Date(date); d.setHours(0,0,0,0);
  const n = new Date(now); n.setHours(0,0,0,0);
  const diffTime = n.getTime() - d.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${date.toLocaleDateString('en-US', { weekday: 'short' })}, ${timeStr}`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}