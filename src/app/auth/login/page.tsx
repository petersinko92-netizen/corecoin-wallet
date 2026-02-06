"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Chrome, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 1. EMAIL LOGIN HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      toast.success("Welcome back!");
      router.push('/auth/success');
    }
  };

  // 2. GOOGLE LOGIN HANDLER (The Fix)
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This redirects the user to your callback route after Google signs them in
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-zinc-400 text-sm">
          Don't have an account? <Link href="/auth/signup" className="text-emerald-500 font-bold hover:underline">Sign up &rarr;</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {error && (
           <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-400 text-sm font-medium">
             <AlertCircle size={16} /> {error}
           </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
          <input 
            required
            type="email" 
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors"
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
             <label className="text-xs font-bold text-zinc-500 uppercase">Password</label>
             <Link href="/auth/forgot-password" className="text-xs font-bold text-emerald-500 hover:text-emerald-400 hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <input 
              required
              type={showPassword ? "text" : "password"} 
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 outline-none transition-colors pr-12"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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
          className="w-full bg-white text-black font-extrabold py-4 rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-3 text-zinc-500 font-bold">Or login with</span></div>
      </div>
<button 
  type="button"
  onClick={handleGoogleLogin} 
  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
  Continue with Google
</button>

    </div>
  );
}