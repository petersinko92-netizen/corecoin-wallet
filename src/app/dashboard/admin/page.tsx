"use client";
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Fuel, AlertTriangle, RefreshCw, Copy, ExternalLink, Server } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStatusPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/status');
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        toast.error("Failed to load status");
      }
    } catch (e) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address Copied");
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh]">
      <RefreshCw className="animate-spin text-zinc-500" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Status</h1>
          <p className="text-zinc-500 text-sm">Monitor your automated banking engine</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full">
           <Server size={12} />
           <span>Block: {data?.blockNumber}</span>
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"/>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* --- GAS TANK CARD --- */}
        <div className={`p-6 rounded-3xl border relative overflow-hidden ${
             data?.gasTank.status === 'healthy' 
             ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10' 
             : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/20'
        }`}>
           <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  data?.gasTank.status === 'healthy' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
              }`}>
                 <Fuel size={20} />
              </div>
              <div>
                 <h2 className="font-bold text-lg dark:text-white">Gas Tank</h2>
                 <p className="text-xs text-zinc-500">Pays for user sweeps</p>
              </div>
           </div>

           <div className="mb-6">
              <div className="text-3xl font-mono font-bold dark:text-white">
                 {data?.gasTank.balance.toFixed(4)} ETH
              </div>
              <div className="text-xs font-medium text-zinc-500 mt-1">
                 {data?.gasTank.status === 'healthy' 
                    ? '✅ Sufficient fuel for auto-sweeps' 
                    : '⚠️ CRITICAL: Refill immediately to keep system running'}
              </div>
           </div>

           {/* Refill Address */}
           <div className="bg-zinc-100 dark:bg-black/40 p-3 rounded-xl border border-dashed border-zinc-300 dark:border-white/10">
              <div className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Refill Address (Don't lose this key)</div>
              <div className="flex items-center justify-between gap-2">
                 <code className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                    {data?.gasTank.address}
                 </code>
                 <button onClick={() => copyToClipboard(data?.gasTank.address)} className="p-1 hover:text-blue-500 transition-colors">
                    <Copy size={14} />
                 </button>
              </div>
           </div>
        </div>

        {/* --- MASTER VAULT CARD --- */}
        <div className="p-6 rounded-3xl bg-emerald-500 text-white shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
           
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                 <ShieldCheck size={20} />
              </div>
              <div>
                 <h2 className="font-bold text-lg">Master Vault</h2>
                 <p className="text-xs text-emerald-100">All user funds arrive here</p>
              </div>
           </div>

           <div className="mb-6 relative z-10">
              <div className="text-3xl font-mono font-bold">
                 {data?.masterVault.balance.toFixed(4)} ETH
              </div>
              <div className="text-xs font-medium text-emerald-100 mt-1">
                 Safe & Secure Cold Storage
              </div>
           </div>

           <div className="bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-md relative z-10">
              <div className="text-[10px] uppercase font-bold text-emerald-200 mb-1">Vault Address</div>
              <div className="flex items-center justify-between gap-2">
                 <code className="text-xs text-white truncate">
                    {data?.masterVault.address}
                 </code>
                 <a 
                   href={`https://etherscan.io/address/${data?.masterVault.address}`} 
                   target="_blank" 
                   rel="noreferrer"
                   className="p-1 hover:text-emerald-200 transition-colors"
                 >
                    <ExternalLink size={14} />
                 </a>
              </div>
           </div>
        </div>

      </div>

      <div className="mt-6 flex justify-center">
         <button onClick={fetchStatus} className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors">
            <RefreshCw size={14} /> Refresh Status
         </button>
      </div>

    </div>
  );
}