"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    // REAL SUPABASE CALL
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This is the magic: Logs them in via callback, then sends them to change password
      redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
    });

    setLoading(false);

    if (error) {
      // Rate limit error is common here
      setError(error.message);
    } else {
      setIsSent(true);
    }
  };

  return (
    <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
      
      {!isSent ? (
        /* STATE 1: INPUT FORM */
        <>
          <div className="text-center mb-8">
             <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20">
               <Mail size={24} />
             </div>
             <h1 className="text-2xl font-black text-white mb-2">Forgot Password?</h1>
             <p className="text-zinc-400 text-sm">
               Enter your email and we'll send you a link to reset your password.
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-medium">
                 <AlertCircle size={16} /> {error}
               </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
              <input 
                autoFocus
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors placeholder:text-zinc-700"
                placeholder="name@example.com"
                required
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-500 text-black font-extrabold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
            </button>
          </form>
        </>
      ) : (
        /* STATE 2: SUCCESS CONFIRMATION */
        <div className="text-center py-4">
           <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 animate-in zoom-in duration-300">
             <CheckCircle size={32} />
           </div>
           <h1 className="text-2xl font-black text-white mb-2">Check your mail</h1>
           <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
             We have sent password recovery instructions to <br/>
             <span className="text-white font-bold">{email}</span>
           </p>
           
           <p className="text-xs text-zinc-500">
             Did not receive the email? <button onClick={() => { setIsSent(false); setError(''); }} className="text-emerald-500 font-bold hover:underline">Try again</button>
           </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <Link href="/auth/login" className="text-zinc-400 hover:text-white text-sm flex items-center justify-center gap-2 font-medium transition-colors">
           <ArrowLeft size={16} /> Back to Log In
        </Link>
      </div>

    </div>
  );
}