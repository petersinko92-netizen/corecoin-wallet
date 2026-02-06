"use client";
import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';

const OTP_LENGTH = 8; 

// 1. Logic moved here to be wrapped in Suspense
function VerifyEmailForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, OTP_LENGTH).split('');
    const newOtp = [...otp];
    pasteData.forEach((char, i) => { if (i < OTP_LENGTH) newOtp[i] = char; });
    setOtp(newOtp);
    if (pasteData.length > 0) inputRefs.current[Math.min(pasteData.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const token = otp.join('');
    if (token.length !== OTP_LENGTH || !email) return;

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      toast.success("Email verified successfully!");
      router.push('/auth/success'); 
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast.error("User already registered. Please log in.");
        router.push('/auth/login');
      } else {
        toast.error("Rate limit: Please wait 60 seconds.");
      }
    } else {
      toast.success("Code resent! Check your inbox.");
    }
    setResending(false);
  };

  useEffect(() => {
    if (otp.every(d => d !== '')) handleVerify();
  }, [otp]);

  if (!email) return <div className="text-white text-center mt-20">No email provided.</div>;

  return (
    <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 ring-4 ring-emerald-500/5">
        <Mail size={32} />
      </div>

      <h1 className="text-2xl font-black text-white mb-2">Check your inbox</h1>
      <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
        Enter the {OTP_LENGTH}-digit code sent to <br/>
        <span className="text-white font-bold">{email}</span>
      </p>

      {error && (
         <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-center gap-2 text-red-400 text-sm font-medium">
           <AlertCircle size={16} /> {error}
         </div>
      )}

      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => { inputRefs.current[index] = el }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`
              ${OTP_LENGTH > 6 ? 'w-10 h-12 text-lg' : 'w-12 h-14 text-xl'} 
              bg-[#050505] border ${digit ? 'border-emerald-500' : 'border-white/10'} 
              rounded-xl text-center font-bold text-white 
              focus:border-emerald-500 outline-none transition-all 
              focus:scale-110 shadow-lg
            `}
          />
        ))}
      </div>

      <button 
        onClick={handleVerify}
        disabled={loading || otp.some(d => d === '')}
        className="w-full bg-emerald-500 text-black font-extrabold py-4 rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
      </button>

      <div className="mt-6">
        <p className="text-xs text-zinc-500 mb-2">Didn't receive code?</p>
        <button 
          onClick={handleResend} 
          disabled={resending}
          className="text-emerald-500 font-bold hover:underline transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
        >
          {resending ? <Loader2 className="animate-spin" size={14} /> : 'Resend Email'}
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <Link href="/auth/login" className="text-zinc-400 hover:text-white text-sm flex items-center justify-center gap-2 font-medium transition-colors">
           <ArrowLeft size={16} /> Back to Log In
        </Link>
      </div>
    </div>
  );
}

// 2. Main Export with Suspense Wrapper
export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-zinc-500">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Verifying environment...</p>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}