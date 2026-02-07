"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, AlertCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';

export default function SignupPage() {
  const { theme } = useTheme();
  const supabase = createClient();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ 
      full_name: '', 
      email: '', 
      password: '' 
  });
  
  // Real-time Validation Logic
  const validations = {
    length: formData.password.length >= 8,
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    name: formData.full_name.length > 2
  };
  
  const isFormValid = validations.length && validations.number && validations.special && validations.email && validations.name;

  // 1. SIGNUP HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setError('');

    try {
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
                fullName: formData.full_name
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Signup failed');
        }

        toast.success("Confirmation code sent!");
        
        // ✅ FIX: Redirect to Verify Email page with the email in the URL
        router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);

    } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
    } finally {
        setLoading(false);
    }
  };
  // 2. GOOGLE LOGIN HANDLER
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) toast.error(error.message);
  };

  const isDark = theme === 'dark';
  const bgCard = isDark ? 'bg-[#0a0a0a]/80 border-white/10' : 'bg-white/80 border-slate-200';
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-zinc-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#050505] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className={`${bgCard} border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-black ${textMain} mb-2 tracking-tight`}>Create Account</h1>
        <p className={textSub + " text-sm"}>
          Join 2 million traders today. <Link href="/auth/login" className="text-emerald-500 font-bold hover:underline">Log in &rarr;</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {error && (
           <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-500 text-sm font-medium">
             <AlertCircle size={16} /> {error}
           </div>
        )}

        {/* FULL NAME */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Full Name</label>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="John Doe" 
              className={`w-full border rounded-xl px-4 py-3.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all ${inputBg}`}
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
            {validations.name && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><Check size={16} strokeWidth={3} /></div>}
          </div>
        </div>

        {/* EMAIL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="name@example.com" 
              className={`w-full border rounded-xl px-4 py-3.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all ${inputBg}`}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            {validations.email && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"><Check size={16} strokeWidth={3} /></div>}
          </div>
        </div>

        {/* PASSWORD */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Create a strong password" 
              className={`w-full border rounded-xl px-4 py-3.5 text-sm focus:border-emerald-500 outline-none transition-all pr-12 ${inputBg}`}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
             <PasswordChip label="8+ Chars" valid={validations.length} isDark={isDark} />
             <PasswordChip label="Number" valid={validations.number} isDark={isDark} />
             <PasswordChip label="Symbol" valid={validations.special} isDark={isDark} />
          </div>
        </div>

        <button 
          disabled={!isFormValid || loading}
          className="w-full bg-emerald-500 text-white font-extrabold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
        </button>
      </form>

      <div className="relative my-8">
        <div className={`absolute inset-0 flex items-center`}>
            <div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} px-3 text-zinc-500 font-bold`}>Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
          type="button"
          onClick={handleGoogleLogin} 
          className={`w-full border font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3
              ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'}
          `}
        >
          {/* Google SVG Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>

    </div>
  );
}

function PasswordChip({ label, valid, isDark }: { label: string, valid: boolean, isDark: boolean }) {
  return (
    <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 
        ${valid 
          ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600' 
          : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-slate-100 border-slate-200 text-slate-400')
        }
    `}>
      {valid ? <Check size={10} strokeWidth={4} /> : <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-zinc-700' : 'bg-slate-300'}`}></div>}{label}
    </div>
  );
}