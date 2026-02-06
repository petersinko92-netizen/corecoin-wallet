"use client";
import React from 'react';
import Link from 'next/link';
import { ParticleNetwork } from './ParticleNetwork';
import { ArrowRight, Globe, ShieldCheck, Activity } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-16 md:pt-32 md:pb-20 px-6 border-b border-surface-border bg-background overflow-hidden">
      
      {/* Background Particles */}
      <div className="absolute inset-0 z-0">
        <ParticleNetwork />
      </div>
      
      {/* Fade overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b md:bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto w-full flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* LEFT COLUMN: Text */}
        <div className="text-left w-full z-30 order-1">
          
          <div className="inline-flex items-center gap-3 mb-6 md:mb-8 px-3 py-1.5 md:px-4 md:py-2 bg-surface/50 rounded-full border border-surface-border backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-zinc-300 text-[10px] md:text-xs font-bold tracking-wide uppercase">Trusted By Millions</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 leading-[1.1] tracking-tight">
            Own Your Crypto <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-200">
              Adventure.
            </span>
          </h1>

          <p className="text-zinc-400 text-base md:text-xl leading-relaxed max-w-lg mb-8 md:mb-10">
            Start exploring the finest crypto assets in the Web3 World. 
            Corecoin adopts a special <strong>DESM (Double Encryption Storage Mechanism)</strong> so your assets remain intact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-10 md:mb-12">
            <Link href="/auth/signup" className="h-12 md:h-14 px-8 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 text-sm md:text-base">
              Create Account <ArrowRight size={18} />
            </Link>
            <Link href="/auth/login" className="h-12 md:h-14 px-8 bg-surface border border-surface-border hover:bg-white/5 text-white font-bold rounded-xl transition-all flex items-center justify-center text-sm md:text-base">
              Login
            </Link>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-x-8 gap-y-4 text-zinc-500 text-xs md:text-sm font-semibold border-t border-white/5 pt-6 md:pt-8">
             <div className="flex items-center gap-2">
                <Globe size={16} className="text-primary" />
                <span>113 Countries</span>
             </div>
             <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" />
                <span>DESM Security</span>
             </div>
             <div className="flex items-center gap-2 col-span-2 md:col-span-1">
                <Activity size={16} className="text-primary" />
                <span>99.9% Uptime</span>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visuals */}
        {/* FIXED: Increased mobile height to h-[400px] so it breathes */}
        <div className="w-full flex justify-center items-center relative z-20 order-2 lg:order-2 mt-8 lg:mt-0">
          <div className="relative w-full max-w-[400px] h-[400px] md:w-[450px] md:h-[450px]">
             
             {/* Spinning Rings */}
             <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]"></div>
             <div className="absolute inset-12 md:inset-12 rounded-full border border-primary/20 border-dashed animate-[spin_30s_linear_infinite_reverse]"></div>
             <div className="absolute inset-0 bg-primary/5 blur-[60px] rounded-full"></div>
             
             {/* FLOATING ASSET CARDS */}
             <div className="absolute top-[5%] left-0 animate-bounce duration-[3000ms]">
               <AssetCard ticker="BTC" name="Bitcoin" color="bg-orange-500" />
             </div>
             <div className="absolute bottom-[15%] right-0 animate-bounce delay-700 duration-[4000ms]">
               <AssetCard ticker="ETH" name="Ethereum" color="bg-blue-600" />
             </div>
             <div className="absolute top-[15%] right-[0%] animate-bounce delay-1000 duration-[3500ms]">
               <AssetCard ticker="SOL" name="Solana" color="bg-purple-600" />
             </div>
             <div className="absolute bottom-[5%] left-[0%] animate-bounce delay-500 duration-[4500ms]">
               <AssetCard ticker="USDT" name="Tether" color="bg-emerald-500" />
             </div>

             {/* Center Hub */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-background/50 backdrop-blur-xl p-6 rounded-full border border-white/10 shadow-2xl">
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">90+</div>
                <div className="text-[10px] text-primary uppercase tracking-widest font-bold">Networks</div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}

// Sub-component (Slightly reduced padding for mobile cards to fit better)
function AssetCard({ ticker, name, color }: { ticker: string, name: string, color: string }) {
  return (
    <div className="flex items-center gap-2 p-2 pr-4 bg-surface/90 backdrop-blur-md border border-surface-border rounded-xl shadow-xl hover:border-primary/50 transition-colors cursor-default">
      <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center font-bold text-white text-[10px] shadow-lg tracking-wider`}>
        {ticker}
      </div>
      <div>
        <div className="text-xs font-bold text-white">{name}</div>
        <div className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">{ticker}</div>
      </div>
    </div>
  );
}