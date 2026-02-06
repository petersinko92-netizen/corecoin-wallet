"use client";
import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="pt-40 pb-20 px-6 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
           <Briefcase size={32} />
        </div>
        <h1 className="text-4xl font-black mb-4">Join the Revolution</h1>
        <p className="text-zinc-400 mb-8">
           We are always looking for visionary talent to help us build the next generation of financial infrastructure.
        </p>
        
        <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-2xl">
           <p className="font-bold text-white">No open positions right now.</p>
           <p className="text-sm text-zinc-500 mt-2">Check back soon or email your CV to careers@corecoin.com</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}