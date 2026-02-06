"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
    }

    setLoading(true);

    // REAL SUPABASE UPDATE
    const { error } = await supabase.auth.updateUser({ 
      password: password 
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Password updated successfully!");
      // Send them to success loader, then dashboard
      router.push('/auth/success'); 
    }
  };

  return (
    <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20">
          <Lock size={24} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Set New Password</h1>
        <p className="text-zinc-400 text-sm">
          Your identity has been verified. Create a new strong password below.
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">New Password</label>
          <div className="relative">
            <input 
              autoFocus
              required
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors pr-12"
              placeholder="Min. 6 characters"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-emerald-500 text-black font-extrabold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
        </button>

      </form>
    </div>
  );
}