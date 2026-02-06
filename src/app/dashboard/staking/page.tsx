"use client";
import React from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useTheme, ThemeProvider } from '@/context/ThemeContext';
import { TrendingUp, Clock, ShieldCheck } from 'lucide-react';

export default function StakingPage() {
  return <ThemeProvider><StakingContent /></ThemeProvider>;
}

function StakingContent() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Sidebar />

      <main className="flex-1 lg:ml-72 p-4 md:p-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md text-center">
          
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full animate-pulse"></div>
            <TrendingUp size={40} className="text-emerald-500" />
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tight">Staking is Coming</h1>
          <p className={`text-lg mb-8 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>
            Earn up to <span className="text-emerald-500 font-bold">12% APY</span> on your ETH and USDT. 
            The secure staking vaults are currently being audited for maximum security.
          </p>

          <div className="grid grid-cols-1 gap-3 text-left max-w-sm mx-auto mb-8">
            <div className={`p-4 rounded-xl flex items-center gap-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-slate-200'}`}>
               <ShieldCheck className="text-emerald-500" />
               <div>
                 <p className="font-bold">Audited Contracts</p>
                 <p className="text-xs text-zinc-500">Security first architecture</p>
               </div>
            </div>
            <div className={`p-4 rounded-xl flex items-center gap-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-white border border-slate-200'}`}>
               <Clock className="text-blue-500" />
               <div>
                 <p className="font-bold">Launching Q3 2026</p>
                 <p className="text-xs text-zinc-500">Get notified when live</p>
               </div>
            </div>
          </div>

          <button disabled className="bg-zinc-800 text-zinc-400 font-bold py-3 px-8 rounded-full cursor-not-allowed">
            Joined Waitlist
          </button>

        </div>
      </main>
    </div>
  );
}