"use client";
import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ShieldCheck } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="pt-40 pb-20 px-6 text-center max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
           <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-black mb-6">Institutional-Grade Security</h1>
        <p className="text-zinc-400 text-lg mb-12">
           Your funds are secured by our proprietary Double Encryption Storage Mechanism (DESM).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
           <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-xl">
              <h3 className="font-bold text-white mb-2">Cold Storage</h3>
              <p className="text-sm text-zinc-500">95% of assets are kept offline in air-gapped vaults.</p>
           </div>
           <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-xl">
              <h3 className="font-bold text-white mb-2">Biometric Locks</h3>
              <p className="text-sm text-zinc-500">Withdrawals require multi-factor authentication.</p>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}