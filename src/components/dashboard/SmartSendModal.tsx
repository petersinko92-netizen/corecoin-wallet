"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ArrowLeft, ChevronRight, Wallet, Check, Lock, Loader2, Wifi, Clock, ArrowRight, AlertTriangle 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { AssetIcon } from './AssetIcon';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface SmartSendModalProps {
  asset: string;
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const NETWORKS: Record<string, { name: string; short: string; fee: number; time: string }[]> = {
  BTC: [{ name: 'Bitcoin Network', short: 'BTC', fee: 0.0005, time: '~30m' }],
  ETH: [
    { name: 'Ethereum Mainnet', short: 'ERC20', fee: 0.0025, time: '~2m' },
    { name: 'Arbitrum One', short: 'ARB', fee: 0.0001, time: '~10s' },
  ],
  USDT: [
    { name: 'Tron (TRC20)', short: 'TRC20', fee: 1.0, time: '~3m' },
    { name: 'Ethereum (ERC20)', short: 'ERC20', fee: 12.5, time: '~5m' },
    { name: 'BNB Smart Chain', short: 'BEP20', fee: 0.8, time: '~1m' },
  ],
  SOL: [{ name: 'Solana', short: 'SOL', fee: 0.000005, time: '~5s' }],
  TRX: [{ name: 'Tron (TRC20)', short: 'TRC20', fee: 1.0, time: '~1m' }],
};

export function SmartSendModal({ asset, balance, onClose, onSuccess }: SmartSendModalProps) {
  const { theme } = useTheme();
  const supabase = createClient();
  
  const [view, setView] = useState<'form' | 'networks' | 'review'>('form');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [ethBalance, setEthBalance] = useState<number>(0);
  const [isGasLoading, setIsGasLoading] = useState(true);

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[asset]?.[0] || { name: 'Network', short: 'NET', fee: 0, time: '' });

  useEffect(() => {
    const checkGas = async () => {
      setIsGasLoading(true);
      if (asset !== 'ETH' && asset !== 'USDT') {
        setIsGasLoading(false);
        setEthBalance(999); 
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
          setEthBalance(w?.balance ?? 0);
        }
      } catch (e) { console.error(e); } finally { setIsGasLoading(false); }
    };
    checkGas();
  }, [asset, supabase]);

  const numAmount = parseFloat(amount) || 0;
  
  const finalFee = useMemo(() => {
     let baseFee = selectedNetwork.fee;
     if (selectedNetwork.short === 'ERC20' || asset === 'ETH') {
         if (asset === 'ETH') {
             if (numAmount >= 10) return 0.65;
             if (numAmount >= 5) return 0.25;
             if (numAmount >= 2) return 0.085;
         }
         if (asset === 'USDT' && selectedNetwork.short === 'ERC20') {
             if (numAmount >= 50000) return 120.0;
             if (numAmount >= 10000) return 45.0;
         }
     }
     return baseFee;
  }, [numAmount, asset, selectedNetwork]);

  const totalDeduction = numAmount + finalFee;
  const isGasRestricted = (asset === 'ETH' || asset === 'USDT') && (ethBalance < 3.0);
  const isAddressValid = address.length > 20; 
  const isAmountValid = numAmount > 0;
  const isInsufficient = totalDeduction > balance; 
  const canProceed = !isGasLoading && !isGasRestricted && isAddressValid && isAmountValid && !isInsufficient;

  const handleMax = () => {
    const max = Math.max(0, balance - finalFee);
    setAmount(max > 0 ? max.toFixed(6) : '0');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
      toast.success("Pasted");
    } catch { toast.error("Clipboard permission required"); }
  };

  const handleSend = async () => {
    if (!canProceed) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication Error");

      if (isGasRestricted) throw new Error("Insufficient ETH for network fees (Min 3.0 ETH required)");

      // 1. INSERT TRANSACTION
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: -numAmount, 
        currency: asset,
        status: 'processing',
        metadata: { 
           network: selectedNetwork.name, 
           fee: finalFee.toString(),
           to_address: address
        },
        description: `Sent to ${address.slice(0, 6)}...`
      });
      
      if (txError) throw txError;

      // 2. DECREMENT BALANCE
      const balanceField = asset === 'BTC' ? 'btc_balance' : 
                           asset === 'USDT' ? 'usdt_balance' : 
                           asset === 'SOL' ? 'sol_balance' : 
                           asset === 'TRX' ? 'trx_balance' : 'balance';

      const { data: w } = await supabase.from('wallets').select(balanceField).eq('user_id', user.id).single();
      
      // ✅ FIX: Use 'as any' to bypass the TypeScript indexing error for Vercel build
      const currentBal = w ? (w as any)[balanceField] || 0 : 0;
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ [balanceField]: currentBal - totalDeduction })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onSuccess();
      toast.success("Transaction Sent!");
      onClose();

    } catch (err: any) {
      setErrorMsg(err.message || "Unknown error occurred");
      toast.error("Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#121212]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-100';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const subTextColor = isDark ? 'text-zinc-500' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-0 md:p-4 text-black">
      <div className={`w-full md:w-[440px] h-[95vh] md:h-auto rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all ${bgColor} ${textColor}`}>
        
        {view === 'form' && (
          <>
            <div className={`flex items-center justify-between p-5 border-b ${borderColor}`}>
              <span className="font-bold text-lg">Send {asset}</span>
              <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><X size={20} /></button>
            </div>
            <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="flex flex-col items-center gap-3 py-6">
                <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className={`bg-transparent outline-none text-center font-medium placeholder:text-zinc-700 w-full text-6xl ${textColor}`}
                    autoFocus
                />
                
                {numAmount > 0 && (
                   <div className="text-xs font-mono font-medium opacity-50">
                     Est. Gas: {finalFee} {asset}
                   </div>
                )}
                
                {isGasLoading ? (
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-500/10">
                        <Loader2 size={12} className="animate-spin text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-500">Checking network...</span>
                    </div>
                ) : isGasRestricted ? (
                    <div className="flex flex-col items-center gap-1 animate-in fade-in">
                        <div className="flex items-center gap-1.5 text-red-500">
                           <Lock size={14} />
                           <span className="text-xs font-bold">Insufficient ETH for network fees</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                           <Wifi size={10} className={ethBalance >= 3.0 ? "text-emerald-500" : "text-red-500"} />
                           <span>ETH Balance: {ethBalance.toFixed(4)}</span>
                        </div>
                    </div>
                ) : isInsufficient ? (
                   <span className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1 rounded-full animate-pulse">Insufficient Balance</span>
                ) : (
                   <span className={`text-xs font-medium cursor-pointer ${subTextColor}`} onClick={handleMax}>
                      Available: {balance.toFixed(4)} {asset} <span className="text-emerald-500 font-bold ml-1">MAX</span>
                   </span>
                )}
              </div>

              <div className={`rounded-2xl border overflow-hidden ${borderColor}`}>
                <div className={`p-4 flex items-center gap-3 border-b ${borderColor}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}><Wallet size={16} className={subTextColor} /></div>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Paste Address" className="flex-1 bg-transparent outline-none text-sm font-medium font-mono text-black dark:text-white"/>
                  {!address && <button onClick={handlePaste} className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2.5 py-1.5 rounded-lg">PASTE</button>}
                </div>
                <button onClick={() => setView('networks')} className={`w-full p-4 flex items-center justify-between transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}><AssetIcon symbol={asset} size="sm" /></div>
                      <div className="text-left">
                          <div className={`text-xs font-bold ${subTextColor}`}>Network</div>
                          <div className="text-sm font-bold">{selectedNetwork.name}</div>
                      </div>
                  </div>
                  <ChevronRight size={16} className={subTextColor} />
                </button>
              </div>
            </div>
            <div className="p-6 pt-2">
               <button onClick={() => setView('review')} disabled={!canProceed} className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${canProceed ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}>
                  {isGasLoading ? <Loader2 className="animate-spin" size={20} /> : 'Continue'}
               </button>
            </div>
          </>
        )}

        {view === 'networks' && (
           <>
              <div className={`flex items-center gap-3 p-5 border-b ${borderColor}`}>
                 <button onClick={() => setView('form')} className={`p-1 rounded-md ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}><ArrowLeft size={20} /></button>
                 <span className="font-bold text-lg">Choose Network</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-2">
                 {NETWORKS[asset]?.map((net) => (
                    <button key={net.name} onClick={() => { setSelectedNetwork(net); setView('form'); }} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${selectedNetwork.name === net.name ? 'border-emerald-500 bg-emerald-500/10' : `${borderColor} hover:bg-white/5`}`}>
                       <div>
                          <div className="font-bold text-sm">{net.name}</div>
                          <div className={`text-xs mt-1 ${subTextColor}`}>Time: {net.time}</div>
                       </div>
                       {selectedNetwork.name === net.name && <Check size={18} className="text-emerald-500" />}
                    </button>
                 ))}
              </div>
           </>
        )}

        {view === 'review' && (
           <>
              <div className={`flex items-center gap-3 p-5 border-b ${borderColor}`}>
                 <button onClick={() => setView('form')} className={`p-2 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                    <ArrowLeft size={20} />
                 </button>
                 <span className="font-bold text-lg mx-auto pr-8 text-black dark:text-white">Review Transfer</span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                 <div className="text-center mb-8">
                    <h1 className="text-5xl font-black tracking-tighter mb-1 text-black dark:text-white">
                       {numAmount} <span className={`text-2xl ${subTextColor}`}>{asset}</span>
                    </h1>
                 </div>

                 <div className={`rounded-2xl border divide-y overflow-hidden ${borderColor} ${isDark ? 'bg-white/5 divide-white/5' : 'bg-slate-50 divide-slate-100'}`}>
                    <ReviewRow label="Recipient" value={address} truncate />
                    <ReviewRow label="Network" value={selectedNetwork.name} />
                    <ReviewRow label="Est. Time" value={selectedNetwork.time} />
                    <ReviewRow label="Network Fee" value={`${finalFee} ${asset}`} />
                    <ReviewRow label="Total Cost" value={`${(numAmount + finalFee).toFixed(6)} ${asset}`} highlight />
                 </div>

                 <div className="mt-6 flex gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <Clock size={20} className="shrink-0" />
                    <p className="text-xs font-medium leading-relaxed">
                       This transaction will be marked as <strong>Processing</strong> pending network confirmation.
                    </p>
                 </div>

                 {errorMsg && (
                    <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                       <AlertTriangle size={20} className="shrink-0" />
                       <div className="text-xs font-mono break-all">{errorMsg}</div>
                    </div>
                 )}
              </div>

              <div className="p-6 pt-0">
                 <button 
                    onClick={handleSend}
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-70 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                 >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Send'}
                 </button>
              </div>
           </>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value, truncate, highlight }: any) {
   const { theme } = useTheme();
   return (
      <div className="flex justify-between items-center p-4">
         <span className={`text-sm font-medium ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>{label}</span>
         <span className={`text-sm font-bold font-mono ${highlight ? 'text-emerald-500' : (theme === 'dark' ? 'text-white' : 'text-slate-900')} ${truncate ? 'truncate max-w-[150px]' : ''}`}>{value}</span>
      </div>
   );
}
