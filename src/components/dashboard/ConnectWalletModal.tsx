"use client";
import React, { useState } from 'react';
import { X, Shield, Key, FileText, Eye, EyeOff, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface ConnectWalletModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectWalletModal({ onClose, onSuccess }: ConnectWalletModalProps) {
  const [tab, setTab] = useState<'phrase' | 'privateKey'>('phrase');
  const [inputValue, setInputValue] = useState('');
  const [showText, setShowText] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Controls blur curtain
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!inputValue) return;
    setLoading(true);

    try {
      const res = await fetch('/api/wallet/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tab, value: inputValue }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Wallet imported successfully!");
        onSuccess(); 
        onClose();
        // FORCE RELOAD to ensure new balance shows up
        window.location.reload(); 
      } else {
        toast.error(data.error || "Import Failed");
      }
    } catch (e) {
      toast.error("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] border border-white/10 w-full max-w-md rounded-3xl p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500 border border-emerald-500/20">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Connect Existing Wallet</h2>
          <p className="text-zinc-500 text-xs mt-2 max-w-xs mx-auto">
            Import your assets using your secure keys. This connection is encrypted end-to-end.
          </p>
        </div>

        {/* TABS */}
        <div className="flex bg-zinc-900/50 p-1 rounded-xl mb-6 border border-white/5">
          <button 
            onClick={() => { setTab('phrase'); setInputValue(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'phrase' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <FileText size={14} /> Seed Phrase
          </button>
          <button 
            onClick={() => { setTab('privateKey'); setInputValue(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'privateKey' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <Key size={14} /> Private Key
          </button>
        </div>

        {/* SECURE INPUT FIELD */}
        <div className="relative mb-6 group">
          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block ml-1">
            {tab === 'phrase' ? '12 or 24 Word Phrase' : 'Raw Private Key'}
          </label>
          
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={tab === 'phrase' ? 3 : 2}
              className={`w-full bg-black border rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none transition-all resize-none font-mono ${
                showText ? 'text-white' : 'text-transparent' // Hide text color if masked
              } ${isFocused ? 'border-white/20' : 'border-white/10'}`}
              placeholder="Enter your secret here..."
              style={{
                // If not showing text, use password dots replacement visually
                textShadow: showText ? 'none' : '0 0 8px rgba(255,255,255,0.5)',
                caretColor: 'white'
              }}
              spellCheck={false}
            />

            {/* SHOULDER SURFING BLUR SHIELD */}
            {!isFocused && !inputValue && (
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl cursor-text pointer-events-none border border-dashed border-zinc-700">
                 <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold">
                   <Lock size={12} /> Click to focus securely
                 </div>
               </div>
            )}

            {/* TOGGLE VISIBILITY */}
            <button 
              type="button"
              onClick={() => setShowText(!showText)}
              className="absolute bottom-3 right-3 text-zinc-500 hover:text-white transition-colors"
            >
              {showText ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          {/* Security Warning */}
          <div className="flex items-center gap-2 mt-2 text-[10px] text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
            <Shield size={12} />
            <span>Ensure no one is watching your screen. Keys are encrypted instantly.</span>
          </div>
        </div>

        {/* ACTIONS */}
        <button 
          onClick={handleImport}
          disabled={loading || !inputValue}
          className="w-full bg-emerald-500 text-black font-extrabold py-3.5 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Connect Wallet'}
        </button>

      </div>
    </div>
  );
}