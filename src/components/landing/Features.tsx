"use client";
import React from 'react';
import { Layers, Globe, Zap, Code, Shield, PieChart, ArrowUpRight } from 'lucide-react';

export function Features() {
  return (
    <section className="py-24 px-6 bg-[#050505] relative overflow-hidden">
      
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16 md:mb-20">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
          The Complete <br />
          <span className="text-zinc-600">Crypto Ecosystem.</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-xl leading-relaxed">
          Everything you need to build wealth. From advanced trading tools to global payments, 
          Corecoin is the infrastructure for your financial future.
        </p>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 1. MAIN CARD (Large - Spans 2 cols) */}
        <div className="md:col-span-2 bg-zinc-900/30 border border-white/5 p-8 rounded-3xl hover:border-emerald-500/20 transition-all group relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <PieChart size={140} className="text-emerald-500" />
           </div>
           <div className="relative z-10">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
               <Layers className="text-emerald-500" size={24} />
             </div>
             <h3 className="text-2xl font-bold text-white mb-3">Unified Asset Dashboard</h3>
             <p className="text-zinc-400 text-base leading-relaxed max-w-md">
               Track your Spot, Margin, and Earn portfolios in one real-time view. 
               Get advanced PnL analysis, historical performance charts, and tax-ready export tools 
               integrated directly into your workspace.
             </p>
             
             {/* Mini UI Element: PnL Tag */}
             <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-400">Live PnL Updates</span>
             </div>
           </div>
        </div>

        {/* 2. GLOBAL CARD (Small) */}
        <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl hover:border-blue-500/20 transition-colors group flex flex-col justify-between">
           <div>
             <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
               <Globe className="text-blue-500" size={24} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Global Access</h3>
             <p className="text-zinc-400 text-sm leading-relaxed">
               Supported in 150+ countries with local bank transfers and instant P2P settlement.
             </p>
           </div>
           <div className="mt-6 flex -space-x-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#050505] flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                  {['🇺🇸','🇬🇧','🇳🇬','🇯🇵'][i-1]}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-[#050505] flex items-center justify-center text-[10px] text-white font-bold">+100</div>
           </div>
        </div>

        {/* 3. API CARD (Small) */}
        <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl hover:border-purple-500/20 transition-colors group">
           <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 border border-purple-500/20">
             <Code className="text-purple-500" size={24} />
           </div>
           <h3 className="text-xl font-bold text-white mb-2">Developer API</h3>
           <p className="text-zinc-400 text-sm mb-6">
             High-frequency trading ready. REST & WebSocket support with &lt;5ms latency.
           </p>
           {/* Code Snippet Visual */}
           <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-300">
             <div className="text-purple-400 mb-1">// Fetch Price</div>
             <div className="flex justify-between">
                <span>GET /api/v3/ticker</span>
                <span className="text-emerald-500">200 OK</span>
             </div>
           </div>
        </div>

        {/* 4. SECURITY/RESERVES CARD (Large - Spans 2 cols) */}
        <div className="md:col-span-2 bg-zinc-900/30 border border-white/5 p-8 rounded-3xl hover:border-orange-500/20 transition-colors group relative overflow-hidden">
           {/* Decorative Blur */}
           <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-colors"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
             <div className="flex-1">
               <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 border border-orange-500/20">
                 <Shield className="text-orange-500" size={24} />
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">Proof of Reserves</h3>
               <p className="text-zinc-400 text-base leading-relaxed">
                 We maintain 1:1 reserves for all user assets. Audited monthly by top-tier firms 
                 to ensure your funds are always available for withdrawal.
               </p>
             </div>

             {/* Live Data Visual */}
             <div className="w-full md:w-auto min-w-[280px] bg-black/40 border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex justify-between text-xs text-zinc-500 mb-2 uppercase tracking-wider font-bold">
                   <span>Reserve Ratio</span>
                   <span className="text-emerald-500 flex items-center gap-1"><Shield size={10}/> Verified</span>
                </div>
                <div className="w-full bg-zinc-800/50 rounded-full h-2 overflow-hidden mb-6">
                   <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 w-full h-full"></div>
                </div>
                <div className="flex justify-between gap-4">
                   <div className="text-center">
                      <div className="text-lg font-black text-white">102%</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">BTC Held</div>
                   </div>
                   <div className="w-px h-8 bg-white/10"></div>
                   <div className="text-center">
                      <div className="text-lg font-black text-white">105%</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">USDT Held</div>
                   </div>
                </div>
             </div>
           </div>
        </div>

      </div>
    </section>
  );
}