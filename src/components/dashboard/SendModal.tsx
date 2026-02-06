"use client";
import React, { useState } from 'react';
import { X, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SendModalProps {
  onClose: () => void;
  onSuccess: () => void;
  balance: number; 
}

export function SendModal({ onClose, onSuccess, balance }: SendModalProps) {
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount) return;
    
    // Basic validation
    if (parseFloat(amount) > balance) {
      toast.error("Insufficient ETH Balance");
      return;
    }
    if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
      toast.error("Invalid Ethereum Address");
      return;
    }
    setStep('pin');
  };

  const handleSend = async () => {
    if (pin.length !== 4) return;
    setLoading(true);

    try {
      const res = await fetch('/api/wallet/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toAddress, amount, pin }),
      });
      
      const data = await res.json();

      if (data.success) {
        toast.success(`Sent ${amount} ETH successfully!`);
        onSuccess(); // Refresh dashboard
        onClose();
      } else {
        toast.error(data.error || "Transaction Failed");
        setPin(''); // Reset PIN on error
      }
    } catch (e) {
      toast.error("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505]/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>

        <h2 className="text-xl font-bold text-white mb-6">Send ETH</h2>

        {step === 'details' ? (
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            
            {/* Address Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Recipient Address</label>
              <input 
                autoFocus
                type="text" 
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors font-mono"
                required
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Amount</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="0.000001"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">ETH</span>
              </div>
              <p className="text-[10px] text-zinc-500 ml-1">Available: {balance.toFixed(4)} ETH</p>
            </div>

            <button className="w-full bg-white text-black font-extrabold py-3.5 rounded-xl hover:bg-emerald-400 transition-all mt-4 flex items-center justify-center gap-2">
              Next <ArrowRight size={16} />
            </button>
          </form>

        ) : (
          // PIN STEP
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
               <ShieldCheck size={24} />
            </div>
            <p className="text-zinc-400 text-sm mb-6">Enter PIN to confirm sending <strong className="text-white">{amount} ETH</strong></p>

            <div className="flex justify-center gap-3 mb-8">
               <input 
                 autoFocus
                 type="password"
                 maxLength={4}
                 value={pin}
                 onChange={(e) => setPin(e.target.value)}
                 className="w-32 bg-zinc-900 border border-white/20 text-white text-3xl font-bold tracking-[0.5em] text-center rounded-xl py-2 focus:border-emerald-500 outline-none"
               />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setStep('details')}
                disabled={loading}
                className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl hover:bg-zinc-700 transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleSend}
                disabled={loading || pin.length < 4}
                className="w-full bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirm Send'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}