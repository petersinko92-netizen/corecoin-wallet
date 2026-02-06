"use client";
import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Users, Target, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-pink-500/30">
      <Navbar />
      
      {/* Reduced padding top for mobile */}
      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full mb-6">
            <Users size={14} className="text-pink-500" />
            <span className="text-xs font-bold text-pink-500 uppercase tracking-wider">Who We Are</span>
          </div>
          {/* Responsive Font Size: 4xl on mobile, 6xl on desktop */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Building the <span className="text-zinc-600">Future of Finance.</span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Corecoin was founded with a simple mission: to make digital assets accessible, secure, and usable for everyone, everywhere.
          </p>
        </div>

        {/* Stats Grid: Stack on mobile (grid-cols-1), 3 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 mb-16 md:mb-24">
          <StatCard label="Active Users" value="2M+" />
          <StatCard label="Quarterly Volume" value="$15B+" />
          <StatCard label="Countries Supported" value="150+" />
        </div>

        {/* Mission Content: Stack on mobile, Side-by-Side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          <div className="space-y-6 md:space-y-8">
            <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl">
              <Target className="text-pink-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Our Mission</h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                To eliminate the barriers of traditional finance by providing a decentralized, transparent, and user-first ecosystem.
              </p>
            </div>
            <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-2xl">
              <Globe className="text-blue-500 mb-4" size={32} />
              <h3 className="text-xl font-bold mb-2">Global Reach</h3>
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                We are building bridges between fiat and crypto in emerging markets, empowering the unbanked with true financial freedom.
              </p>
            </div>
          </div>
          
          {/* Image Placeholder */}
          <div className="relative h-[300px] md:h-[400px] w-full bg-zinc-900 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center group mt-4 lg:mt-0">
             <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent opacity-50"></div>
             <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm z-10">Office / Team Image</p>
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="p-6 md:p-8 bg-zinc-900/30 border border-white/5 rounded-2xl text-center hover:border-pink-500/20 transition-colors">
      <div className="text-3xl md:text-4xl font-black text-white mb-2">{value}</div>
      <div className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}