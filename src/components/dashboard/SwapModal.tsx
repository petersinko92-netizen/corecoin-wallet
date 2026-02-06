"use client";
import React, { useState, useEffect } from 'react';
import { X, ArrowDown, Loader2, Wallet, Settings2, ChevronDown, Info } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';
import { AssetIcon } from './AssetIcon';

interface SwapModalProps {
  initialAsset: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DB_MAP: Record<string, string> = {
  'ETH': 'balance', 'BTC': 'btc_balance', 'USDT': 'usdt_balance',
  'SOL': 'sol_balance', 'TRX': 'trx_balance'
};

// Initial Fallback Prices
const FALLBACK_PRICES: Record<string, number> = {
  'ETH': 2950.00, 'BTC': 65000.00, 'USDT': 1.00, 'SOL': 145.00, 'TRX': 0.15
};

export function SwapModal({ initialAsset, onClose, onSuccess }: SwapModalProps) {
  const { theme } = useTheme();
  const supabase = createClient();
  const isDark = theme === 'dark';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fromAsset, setFromAsset] = useState(initialAsset);
  const [toAsset, setToAsset] = useState(initialAsset === 'USDT' ? 'ETH' : 'USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [prices, setPrices] = useState(FALLBACK_PRICES);

  // 1. Fetch Real-time Prices
  useEffect(() => {
    const fetchPrices = async () => {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,tron&vs_currencies=usd');
            if (res.ok) {
                const data = await res.json();
                setPrices({
                    BTC: data.bitcoin.usd,
                    ETH: data.ethereum.usd,
                    USDT: 1.00, // Always pegged
                    SOL: data.solana.usd,
                    TRX: data.tron.usd
                });
            }
        } catch (e) {
            // Silently fail to fallback prices
        }
    };
    fetchPrices();
  }, []);

  // 2. Fetch User Balance
  useEffect(() => {
    const fetchBalance = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const col = DB_MAP[fromAsset];
      const { data: w } = await supabase.from('wallets').select(col).eq('user_id', user.id).single();
      setBalance(w?.[col] || 0);
    };
    fetchBalance();
  }, [fromAsset, supabase]);

  // 3. Auto-Calculate Output
  useEffect(() => {
    const val = parseFloat(fromAmount);
    if (!val || isNaN(val)) { setToAmount(''); return; }
    
    // Calculate Rate: (Price From / Price To)
    const rate = prices[fromAsset] / prices[toAsset];
    const output = val * rate;
    
    // Trim decimals based on asset type (USDT=2, BTC=6, etc)
    const decimals = toAsset === 'USDT' ? 2 : 6;
    setToAmount(output.toFixed(decimals));
  }, [fromAmount, fromAsset, toAsset, prices]);

  const handleSwitch = () => {
    setFromAsset(toAsset); setToAsset(fromAsset); setFromAmount('');
  };

  const handleMax = () => {
    // For internal swap, allow 100% usage (no gas fee needed)
    setFromAmount(balance > 0 ? balance.toString() : '0');
  };

  const executeSwap = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      const amountIn = parseFloat(fromAmount);
      const amountOut = parseFloat(toAmount);

      const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      
      // Safety Check
      if (wallet[DB_MAP[fromAsset]] < amountIn) throw new Error("Insufficient balance");

      // 1. Update Wallet Balances (Atomic-ish)
      const { error } = await supabase.from('wallets').update({
        [DB_MAP[fromAsset]]: wallet[DB_MAP[fromAsset]] - amountIn,
        [DB_MAP[toAsset]]: wallet[DB_MAP[toAsset]] + amountOut
      }).eq('user_id', user.id);

      if (error) throw error;

      // 2. Log Transactions (One for Sell, One for Buy)
      const rate = (prices[fromAsset] / prices[toAsset]).toFixed(4);
      
      const tx1 = { 
          user_id: user.id, 
          type: 'swap', 
          amount: -amountIn, 
          currency: fromAsset, 
          status: 'completed', 
          metadata: { swapped_to: toAsset, rate: rate }, 
          description: `Swapped to ${toAsset}` 
      };
      
      const tx2 = { 
          user_id: user.id, 
          type: 'swap', 
          amount: amountOut, 
          currency: toAsset, 
          status: 'completed', 
          metadata: { swapped_from: fromAsset, rate: rate }, 
          description: `Received from ${fromAsset}` 
      };

      await supabase.from('transactions').insert([tx1, tx2]);

      toast.success(`Swapped ${fromAsset} to ${toAsset}`);
      onSuccess(); 
      onClose();
    } catch (e: any) { 
        toast.error(e.message || "Swap failed"); 
    } finally { 
        setLoading(false); 
    }
  };

  // NATIVE APP COLORS
  const bgMain = isDark ? 'bg-[#121212]' : 'bg-white';
  const bgInput = isDark ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F7]'; 
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-[#888]' : 'text-[#86868b]';

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div 
         onClick={(e) => e.stopPropagation()}
         className={`
           w-full md:w-[420px] 
           ${bgMain} 
           rounded-t-[32px] md:rounded-[32px]
           shadow-[0_-8px_30px_rgba(0,0,0,0.12)]
           overflow-hidden 
           flex flex-col 
           pb-8 md:pb-6
           transition-all
         `}
      >
        
        {/* MOBILE GRAB HANDLE */}
        <div className="md:hidden w-full flex justify-center pt-3 pb-1">
           <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-800 opacity-50" />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
           <span className={`text-[20px] font-bold ${textMain}`}>Swap</span>
           <div className="flex gap-3">
              <button className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textMain}`}>
                 <Settings2 size={20} />
              </button>
              <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${textMain}`}>
                 <X size={20} />
              </button>
           </div>
        </div>

        {/* --- STEP 1: INPUT --- */}
        {step === 1 && (
           <div className="px-4 pb-2 flex flex-col gap-1 relative">
              
              {/* FROM INPUT (Top Card) */}
              <div className={`p-5 rounded-[24px] ${bgInput} relative z-10 transition-colors`}>
                 <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${textSub}`}>Sell</span>
                 </div>
                 
                 <div className="flex items-center justify-between gap-4">
                    <input 
                       type="number" 
                       value={fromAmount}
                       onChange={(e) => setFromAmount(e.target.value)}
                       placeholder="0"
                       className={`w-full bg-transparent text-[40px] font-medium outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-800 ${textMain} h-12 tracking-tight`}
                    />
                    
                    {/* Asset Pill */}
                    <div className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full shadow-sm border ${isDark ? 'bg-[#2C2C2E] border-black' : 'bg-white border-black/5'} shrink-0`}>
                       <div className="w-6 h-6">
                          <AssetIcon symbol={fromAsset} size="sm" /> 
                       </div>
                       <span className={`font-bold text-[17px] ${textMain}`}>{fromAsset}</span>
                       <ChevronDown size={16} className={textSub} />
                    </div>
                 </div>

                 <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs ${textSub}`}>
                       ${(parseFloat(fromAmount || '0') * prices[fromAsset]).toLocaleString('en-US', {maximumFractionDigits: 2})}
                    </span>
                    <div className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity" onClick={handleMax}>
                       <Wallet size={12} className={textSub} />
                       <span className={`text-xs font-medium ${textSub}`}>
                          {balance.toFixed(4)}
                       </span>
                       <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">MAX</span>
                    </div>
                 </div>
              </div>

              {/* SWITCHER */}
              <div className="h-0 relative z-20 flex justify-center items-center">
                 <button 
                    onClick={handleSwitch} 
                    className={`absolute p-2 rounded-[14px] border-[4px] transition-transform active:rotate-180 active:scale-95 shadow-sm
                       ${isDark ? 'bg-[#121212] border-[#121212] text-white' : 'bg-white border-white text-slate-700'}
                    `}
                 >
                    <ArrowDown size={20} strokeWidth={2.5} />
                 </button>
              </div>

              {/* TO INPUT (Bottom Card) */}
              <div className={`p-5 pt-6 rounded-[24px] ${bgInput} relative z-0`}>
                 <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${textSub}`}>Buy</span>
                 </div>
                 
                 <div className="flex items-center justify-between gap-4">
                    <input 
                       disabled
                       value={toAmount}
                       placeholder="0"
                       className={`w-full bg-transparent text-[40px] font-medium outline-none opacity-40 ${textMain} h-12 tracking-tight`}
                    />
                    
                    {/* Asset Pill */}
                    <div className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full shadow-sm border ${isDark ? 'bg-[#2C2C2E] border-black' : 'bg-white border-black/5'} shrink-0`}>
                       <div className="w-6 h-6">
                           <AssetIcon symbol={toAsset} size="sm" />
                       </div>
                       <span className={`font-bold text-[17px] ${textMain}`}>{toAsset}</span>
                       <ChevronDown size={16} className={textSub} />
                    </div>
                 </div>

                 <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs ${textSub}`}>
                       ${(parseFloat(toAmount || '0') * prices[toAsset]).toLocaleString('en-US', {maximumFractionDigits: 2})}
                    </span>
                 </div>
              </div>

              {/* INFO ROW */}
              {fromAmount && (
                <div className="mt-3 px-2 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                   <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg">
                      <Info size={12} className="text-emerald-500" />
                      <span className={`text-[11px] font-bold text-emerald-500`}>Best price via Core DEX</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <span className={`text-[11px] font-medium ${textSub}`}>1 {fromAsset} ≈ {(prices[fromAsset] / prices[toAsset]).toFixed(4)} {toAsset}</span>
                   </div>
                </div>
              )}

              {/* ACTION BUTTON */}
              <button 
                 onClick={() => setStep(2)}
                 disabled={!fromAmount || parseFloat(fromAmount) <= 0 || parseFloat(fromAmount) > balance}
                 className={`w-full mt-3 py-4 rounded-[24px] font-bold text-[18px] text-white transition-all active:scale-[0.98] shadow-lg
                    ${!fromAmount ? 'bg-zinc-700/50 text-zinc-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}
                 `}
              >
                 {parseFloat(fromAmount) > balance ? 'Insufficient Balance' : 'Review Swap'}
              </button>
           </div>
        )}

        {/* --- STEP 2: REVIEW --- */}
        {step === 2 && (
           <div className="px-5 pb-2 flex flex-col gap-4 pt-2">
              <div className={`p-5 rounded-[24px] ${bgInput}`}>
                 <div className="flex justify-between mb-4">
                    <span className={`text-sm ${textSub}`}>You pay</span>
                    <div className="text-right">
                       <div className={`text-[18px] font-bold ${textMain}`}>{fromAmount} {fromAsset}</div>
                       <div className={`text-xs ${textSub}`}>${(parseFloat(fromAmount) * prices[fromAsset]).toFixed(2)}</div>
                    </div>
                 </div>
                 <div className="flex justify-between">
                    <span className={`text-sm ${textSub}`}>You receive</span>
                    <div className="text-right">
                       <div className={`text-[18px] font-bold text-emerald-500`}>{toAmount} {toAsset}</div>
                       <div className={`text-xs ${textSub}`}>${(parseFloat(toAmount) * prices[toAsset]).toFixed(2)}</div>
                    </div>
                 </div>
              </div>

              <div className={`p-5 rounded-[24px] border ${isDark ? 'border-[#2d2d2d]' : 'border-slate-100'} ${bgInput} space-y-3`}>
                 <Row label="Rate" value={`1 ${fromAsset} ≈ ${(prices[fromAsset]/prices[toAsset]).toFixed(2)} ${toAsset}`} isDark={isDark} />
                 <Row label="Network Cost" value="$0.00" isDark={isDark} />
                 <Row label="Max Slippage" value="0.5%" isDark={isDark} />
              </div>

              <div className="flex gap-2">
                  <button 
                     onClick={() => setStep(1)}
                     className={`w-1/3 py-4 rounded-[24px] font-bold text-[18px] border transition-all active:scale-[0.98]
                        ${isDark ? 'bg-transparent border-zinc-700 text-white hover:bg-white/5' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}
                     `}
                  >
                     Back
                  </button>
                  <button 
                     onClick={executeSwap}
                     disabled={loading}
                     className="w-2/3 py-4 rounded-[24px] font-bold text-[18px] bg-emerald-500 text-white hover:bg-emerald-600 flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                  >
                     {loading ? <Loader2 className="animate-spin" /> : 'Confirm Swap'}
                  </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, isDark }: any) {
   return (
      <div className="flex justify-between items-center">
         <span className={`text-[13px] font-medium ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>{label}</span>
         <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
      </div>
   );
}