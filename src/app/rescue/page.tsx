"use client";
import React, { useState } from 'react';
import { Key, Unlock, Loader2, Copy, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function RescuePage() {
  const [encryptedKey, setEncryptedKey] = useState('');
  const [decryptedKey, setDecryptedKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encryptedKey) return toast.error("Please enter an encrypted key string.");
    
    setLoading(true);
    setDecryptedKey(''); 

    try {
      const res = await fetch('/api/rescue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encryptedKey }),
      });
      
      const data = await res.json();

      if (data.success) {
        setDecryptedKey(data.decryptedKey);
        toast.success("Key successfully decrypted!");
      } else {
        toast.error(data.error || "Failed to decrypt.");
      }
    } catch (err) {
      toast.error("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (decryptedKey) {
      navigator.clipboard.writeText(decryptedKey);
      toast.success("Raw Private Key copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 text-red-500">
            <Unlock size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Rescue Tool</h1>
        </div>

        <form onSubmit={handleDecrypt} className="space-y-6 relative z-10">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block ml-1">
              Encrypted Database String
            </label>
            <textarea
              value={encryptedKey}
              onChange={(e) => setEncryptedKey(e.target.value)}
              placeholder="Paste the AES-256 encrypted string from Supabase here..."
              className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-zinc-300 outline-none focus:border-red-500/50 resize-none h-32 font-mono"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !encryptedKey}
            className="w-full bg-white text-black font-extrabold py-4 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Unlock size={18} /> Decrypt Key</>}
          </button>
        </form>

        {decryptedKey && (
          <div className="mt-8">
            <label className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 block ml-1">
              Raw Private Key
            </label>
            <div className="relative group">
              <input
                type="text"
                readOnly
                value={decryptedKey}
                className="w-full bg-black border border-emerald-500/30 rounded-2xl py-4 pl-4 pr-12 text-emerald-400 outline-none font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-xl"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}