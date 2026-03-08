"use client";
import React, { useState } from 'react';
import { X, Shield, Key, FileText, Eye, EyeOff, Loader2, Lock, Smartphone, Search } from 'lucide-react';
import { toast } from 'sonner';
import { AssetIcon } from '../dashboard/AssetIcon';

interface ConnectWalletModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectWalletModal({ onClose, onSuccess }: ConnectWalletModalProps) {
  const [importType, setImportType] = useState<'phrase' | 'privateKey'>('phrase');
  
  const [inputValue, setInputValue] = useState('');
  const [showText, setShowText] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!inputValue) return;
    setLoading(true);

    try {
      const res = await fetch('/api/wallet/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: importType, value: inputValue }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Wallet connected securely!");
        onSuccess(); 
        onClose();
        window.location.reload(); 
      } else {
        toast.error(data.error || "Connection Failed");
      }
    } catch (e) {
      toast.error("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950/80 backdrop-blur-xl border border-white/5 w-full max-w-[420px] rounded-[32px] p-6 relative shadow-[0_0_80px_rgba(16,185,129,0.1)] animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Glow Accent */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-zinc-400 hover:bg-white/10 hover:text-white transition-all z-50 active:scale-95">
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="mb-6 mt-2 relative z-10">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Connect
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50"></div>
            </div>
          </h2>
          <p className="text-zinc-500 text-sm mt-1">
            Choose how you want to connect your assets securely.
          </p>
        </div>

        <div className="relative z-10 transition-all duration-300 h-auto min-h-[380px]">
           <div className="animate-in fade-in h-full flex flex-col justify-between gap-4">
              <div className="flex gap-2">
                <button onClick={() => setImportType('phrase')} className={`flex-1 py-3 text-[11px] uppercase tracking-wider font-bold rounded-xl border transition-colors ${importType === 'phrase' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-white/10 text-zinc-500 hover:bg-white/5'}`}>Seed Phrase</button>
                <button onClick={() => setImportType('privateKey')} className={`flex-1 py-3 text-[11px] uppercase tracking-wider font-bold rounded-xl border transition-colors ${importType === 'privateKey' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-transparent border-white/10 text-zinc-500 hover:bg-white/5'}`}>Private Key</button>
              </div>

              {/* SECURE INPUT FIELD */}
              <div className="relative group flex flex-col">
                <div className="relative flex">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full h-full min-h-[110px] bg-black border rounded-2xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all resize-none shadow-inner ${
                      showText ? 'text-zinc-300 font-mono tracking-wide' : 'text-transparent font-sans bg-clip-text' // Hide text color if masked
                    } ${isFocused ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}
                    placeholder={importType === 'phrase' ? "Enter 12 or 24 word phrase separated by spaces..." : "Enter raw private key (e.g. 0x...)"}
                    style={{
                      textShadow: showText ? 'none' : '0 0 10px rgba(16,185,129,0.5)',
                      caretColor: '#10b981'
                    }}
                    spellCheck={false}
                  />

                  {/* SHOULDER SURFING BLUR SHIELD */}
                  {!isFocused && !inputValue && (
                    <div className="absolute inset-x-0 inset-y-0 m-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl cursor-text pointer-events-none border border-dashed border-zinc-800">
                      <Lock size={20} className="text-zinc-600 mb-2" />
                      <span className="text-zinc-400 text-xs font-bold w-2/3 text-center">Click to input securely. Your screen is protected.</span>
                    </div>
                  )}

                  {/* TOGGLE VISIBILITY */}
                  <button 
                    type="button"
                    onClick={() => setShowText(!showText)}
                    className="absolute bottom-3 right-3 p-2 bg-black border border-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors z-10"
                  >
                    {showText ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                
                {/* Security Warning Information Block */}
                <div className="mt-4 flex flex-col gap-2 bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <Shield size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-tight text-zinc-400">
                      <strong className="text-zinc-300">End-to-End Encrypted.</strong> Your data is locally encrypted using AES-256 before leaving your browser.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FileText size={14} className="text-rose-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-tight text-zinc-400">
                      <strong className="text-zinc-300">Never share your keys.</strong> Corecoin support will never ask for your private key or seed phrase in chat.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Search size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-[11px] leading-tight text-zinc-400">
                      <strong className="text-zinc-300">Verify your connection.</strong> Always ensure you are connecting via the official and secure Corecoin domain.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <button 
                onClick={handleImport}
                disabled={loading || !inputValue}
                className="w-full mt-2 bg-emerald-500 text-black font-extrabold py-4 rounded-xl hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none bg-gradient-to-r from-emerald-500 to-emerald-400"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                   <>Establish Secure Connection <Lock size={16} className="fill-black/20" /></>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}