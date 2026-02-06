"use client";
import React from 'react';
import { LayoutGrid, Loader2 } from 'lucide-react';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center animate-in fade-in duration-300">
      
      {/* Pulse Effect Background */}
      <div className="absolute w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />

      {/* Logo Animation */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
            <LayoutGrid size={32} className="text-emerald-500" />
          </div>
          {/* Spinning Ring */}
          <div className="absolute inset-0 -m-2 border-2 border-emerald-500/20 border-t-emerald-500 rounded-2xl animate-spin" />
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-tight mb-1">CORECOIN</h2>
          <p className="text-zinc-500 text-xs font-mono animate-pulse">ESTABLISHING SECURE CONNECTION...</p>
        </div>
      </div>
    </div>
  );
}