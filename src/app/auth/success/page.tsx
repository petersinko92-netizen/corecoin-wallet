"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Zap, Lock } from 'lucide-react';
import Image from 'next/image';

export default function AuthSuccessPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // The "Loading" Sequence
  const steps = [
    { text: "Verifying credentials...", icon: <Lock size={18} /> },
    { text: "Securing connection...", icon: <ShieldCheck size={18} /> },
    { text: "Syncing market data...", icon: <Zap size={18} /> },
    { text: "Redirecting...", icon: <Loader2 className="animate-spin" size={18} /> }
  ];

  useEffect(() => {
    // Cycle through steps every 800ms
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    // Redirect to Dashboard after 3.5 seconds
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center">
        
        {/* Pulsing Logo */}
        <div className="relative w-20 h-20 mb-8">
           <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
           <div className="relative w-full h-full bg-[#0a0a0a] border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
             <Image src="/icon.svg" alt="Corecoin" width={40} height={40} className="object-contain" />
           </div>
        </div>

        <h1 className="text-2xl font-black mb-2 animate-in fade-in slide-in-from-bottom-2">Welcome to Corecoin</h1>
        
        {/* Dynamic Status Text */}
        <div className="h-8 flex items-center gap-2 text-zinc-400 text-sm font-mono animate-pulse">
           {steps[step].icon}
           <span>{steps[step].text}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 bg-zinc-900 rounded-full mt-8 overflow-hidden">
           <div 
             className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
             style={{ width: `${((step + 1) / steps.length) * 100}%` }}
           />
        </div>

      </div>
    </div>
  );
}