"use client";
import React, { useState } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useSecurity } from '@/context/SecurityContext';
import { toast } from 'sonner';

export function LockScreen() {
  const { unlock, isLoading } = useSecurity();
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleNumClick = async (num: string) => {
    if (verifying || pin.length >= 4) return;
    const newPin = pin + num;
    setPin(newPin);

    if (newPin.length === 4) {
      setVerifying(true);
      // Small delay for UX so user sees the 4th dot
      setTimeout(async () => {
        const success = await unlock(newPin);
        if (!success) {
          toast.error("Incorrect PIN");
          setPin('');
        }
        setVerifying(false);
      }, 300);
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm text-center">
        
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-500">
          {verifying ? <Loader2 className="animate-spin" size={32} /> : <Lock size={32} />}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Wallet Locked</h2>
        <p className="text-zinc-500 text-sm mb-8">Enter your PIN to resume session</p>

        {/* DOTS */}
        <div className="flex gap-4 justify-center mb-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${
              i < pin.length ? 'bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 border border-white/5'
            }`} />
          ))}
        </div>

        {/* KEYPAD */}
        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button key={num} onClick={() => handleNumClick(num.toString())}
              className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-white/10 text-2xl font-bold text-white transition-all active:scale-95">
              {num}
            </button>
          ))}
          <div />
          <button onClick={() => handleNumClick("0")} className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-white/10 text-2xl font-bold text-white transition-all active:scale-95">0</button>
          <button onClick={handleDelete} className="h-16 flex items-center justify-center rounded-2xl bg-transparent text-zinc-500 hover:text-red-400 active:scale-95">Delete</button>
        </div>

      </div>
    </div>
  );
}