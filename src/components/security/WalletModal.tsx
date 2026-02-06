"use client";
import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Delete, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface WalletModalProps {
  onSuccess: () => void;
}

// ✅ CHANGED: Removed 'default' keyword to match import { WalletModal }
export function WalletModal({ onSuccess }: WalletModalProps) {
  const [step, setStep] = useState<'intro' | 'create' | 'confirm' | 'generating'>('intro');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  // 1. GET USER ON MOUNT
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // KEYPAD LOGIC
  const handleNumClick = (num: string) => {
    if (loading) return;
    
    const currentPin = step === 'create' ? pin : confirmPin;
    const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

    if (currentPin.length < 4) {
      const newVal = currentPin + num;
      setCurrentPin(newVal);
      
      if (newVal.length === 4) {
        if (step === 'create') {
           setTimeout(() => setStep('confirm'), 300); 
        } else {
           handleFinalSubmit(newVal); 
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'create') setPin(prev => prev.slice(0, -1));
    else setConfirmPin(prev => prev.slice(0, -1));
  };

  const handleFinalSubmit = async (finalConfirmPin: string) => {
    if (pin !== finalConfirmPin) {
      toast.error("PINs do not match. Try again.");
      setConfirmPin('');
      setPin('');
      setStep('create');
      return;
    }

    if (!user?.id) {
        toast.error("User session loading... please wait.");
        return;
    }

    setLoading(true);
    setStep('generating');

    try {
      // 2. SEND TO BACKEND
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            userId: user.id, 
            pin: pin 
        })
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || "Setup failed");
      }

      // 3. SUCCESS
      toast.success(data.message || "Wallet Secured!");
      onSuccess();
      window.location.reload(); 

    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Setup failed");
      setStep('create');
      setPin('');
      setConfirmPin('');
      setLoading(false);
    }
  };

  const renderDots = (value: string) => (
    <div className="flex gap-4 justify-center mb-8">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${
            i < value.length ? 'bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800 border border-white/5'
        }`} />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none" />

        {/* --- STEP 1: INTRO --- */}
        {step === 'intro' && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 text-emerald-500 animate-pulse">
              <Shield size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Secure Your Account</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Create a 4-digit PIN to encrypt your wallet and authorize transactions.
            </p>
            <button 
              onClick={() => setStep('create')}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Start Setup <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* --- STEP 2 & 3: KEYPAD --- */}
        {(step === 'create' || step === 'confirm') && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
             <div className="text-center mb-6">
               <h3 className="text-xl font-bold text-white">
                 {step === 'create' ? 'Create PIN' : 'Confirm PIN'}
               </h3>
               <p className="text-zinc-500 text-xs mt-2">
                 {step === 'create' ? 'Enter a secure 4-digit code' : 'Re-enter to verify'}
               </p>
             </div>

             {renderDots(step === 'create' ? pin : confirmPin)}

             {/* NUMERIC KEYPAD */}
             <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                 <button key={num} onClick={() => handleNumClick(num.toString())}
                   className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-white/10 text-2xl font-bold text-white transition-all active:scale-95">
                   {num}
                 </button>
               ))}
               <div className="h-16" />
               <button onClick={() => handleNumClick("0")}
                 className="h-16 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-white/10 text-2xl font-bold text-white transition-all active:scale-95">
                 0
               </button>
               <button onClick={handleDelete}
                 className="h-16 rounded-2xl bg-transparent hover:bg-red-500/10 hover:text-red-500 text-zinc-500 flex items-center justify-center transition-all active:scale-95">
                 <Delete size={24} />
               </button>
             </div>
          </div>
        )}

        {/* --- STEP 4: GENERATING --- */}
        {step === 'generating' && (
          <div className="text-center py-12">
             <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-6" />
             <h3 className="text-lg font-bold text-white">Securing Wallet...</h3>
             <p className="text-zinc-500 text-xs mt-2">Encrypting keys on server.</p>
          </div>
        )}
      </div>
    </div>
  );
}