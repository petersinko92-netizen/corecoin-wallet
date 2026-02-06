"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Toaster } from 'sonner'; // Modern toast notifications

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      <Toaster position="top-center" theme="dark" />
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      {/* Logo Header */}
      <Link href="/" className="mb-8 flex items-center gap-3 relative z-10 group hover:scale-105 transition-transform duration-300">
        <div className="relative w-10 h-10">
          <Image src="/icon.svg" alt="Corecoin" fill className="object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" priority />
        </div>
        <span className="font-outfit text-2xl font-extrabold tracking-tight uppercase group-hover:text-emerald-400 transition-colors">
          CORECOIN
        </span>
      </Link>

      {/* Main Card Container */}
      <div className="w-full max-w-[440px] relative z-10">
        {children}
      </div>

      {/* Footer Links */}
      <div className="mt-10 text-zinc-600 text-xs flex gap-6 relative z-10 font-medium">
        <Link href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link>
        <Link href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</Link>
        <Link href="#" className="hover:text-emerald-500 transition-colors">Help Center</Link>
      </div>
    </div>
  );
}