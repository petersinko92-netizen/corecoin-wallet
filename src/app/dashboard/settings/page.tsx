"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  User, Moon, Sun, Shield, Lock, Smartphone, 
  LogOut, ChevronRight, CreditCard, HelpCircle, 
  FileText, Mail, Bell, Globe, CheckCircle 
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null); // ✅ Replaces securityData
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);

        // 1. Fetch Wallet (Correct place for Readable ID)
        const { data: w } = await supabase
          .from('wallets')
          .select('readable_id')
          .eq('user_id', user.id)
          .single();
        
        setWallet(w);

        // 2. Fetch Profile (If exists)
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors if profile missing
        
        setProfile(prof);
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    toast.success("Logged out successfully");
  };

  const isDark = theme === 'dark';

  // --- REUSABLE ROW COMPONENT (THEME AWARE) ---
  const SettingRow = ({ icon: Icon, label, subLabel, action, isDestructive = false }: any) => (
    <button 
      onClick={action}
      className={`w-full flex items-center justify-between p-4 transition-colors 
        ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
        ${isDestructive ? 'text-red-500' : (isDark ? 'text-white' : 'text-slate-900')}
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center 
          ${isDestructive 
            ? 'bg-red-500/10' 
            : (isDark ? 'bg-zinc-800' : 'bg-slate-100')}
        `}>
          <Icon size={20} className={isDestructive ? 'text-red-500' : (isDark ? 'text-zinc-400' : 'text-slate-500')} />
        </div>
        <div className="text-left">
          <div className="font-medium text-sm">{label}</div>
          {subLabel && <div className="text-xs text-zinc-500">{subLabel}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
         {typeof action === 'function' && <ChevronRight size={16} className="text-zinc-400" />}
      </div>
    </button>
  );

  return (
    <div className="pb-32 animate-in fade-in duration-500 p-4 md:p-8">
      
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
      
      {/* 1. PROFILE CARD */}
      <div 
        onClick={() => router.push('/dashboard/profile')}
        className={`relative border rounded-3xl p-6 flex items-center gap-4 mb-8 shadow-xl overflow-hidden cursor-pointer group transition-all
          ${isDark 
            ? 'bg-gradient-to-br from-zinc-900 to-black border-white/10 hover:border-white/20' 
            : 'bg-white border-slate-200 hover:border-emerald-500/30'
          }
        `}
      >
        {isDark && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />}
        
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 shrink-0 overflow-hidden">
           {profile?.avatar_url ? (
             <img src={profile.avatar_url} alt="User" className="w-full h-full object-cover" />
           ) : (
             user?.email?.[0].toUpperCase() || "U"
           )}
        </div>
        
        <div className="min-w-0">
           <h2 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
             {profile?.full_name || user?.email?.split('@')[0] || "User"}
           </h2>
           <div className="flex items-center gap-2 mt-1">
             <span className={`text-xs font-mono px-2 py-0.5 rounded border 
               ${isDark ? 'bg-white/10 text-zinc-400 border-white/5' : 'bg-slate-100 text-slate-500 border-slate-200'}
             `}>
               {wallet?.readable_id || "LOADING..."}
             </span>
             <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
               <CheckCircle size={10} /> Verified L1
             </span>
           </div>
        </div>
      </div>

      {/* 2. GENERAL SETTINGS */}
      <div className="space-y-6">
        
        {/* Account Section */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 px-2">Account</h3>
          <div className={`border rounded-2xl overflow-hidden divide-y ${isDark ? 'bg-[#0a0a0a] border-white/10 divide-white/5' : 'bg-white border-slate-200 divide-slate-100'}`}>
             <SettingRow 
               icon={User} 
               label="Personal Information" 
               subLabel="Name, Date of Birth, Address"
               action={() => router.push('/dashboard/profile')} 
             />
             <SettingRow 
               icon={CreditCard} 
               label="Limits & Features" 
               subLabel="Withdrawal limit: $50,000/day"
               action={() => {}} 
             />
             <SettingRow 
               icon={Globe} 
               label="Language & Region" 
               subLabel={`${profile?.country || "Nigeria"} • English (US)`}
               action={() => {}} 
             />
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 px-2">Security</h3>
          <div className={`border rounded-2xl overflow-hidden divide-y ${isDark ? 'bg-[#0a0a0a] border-white/10 divide-white/5' : 'bg-white border-slate-200 divide-slate-100'}`}>
             <SettingRow 
               icon={Lock} 
               label="Change Transaction PIN" 
               subLabel="Required for all withdrawals"
               action={() => {}} 
             />
             <SettingRow 
               icon={Shield} 
               label="Two-Factor Authentication" 
               subLabel="Recommended for safety"
               action={() => toast.info("Coming soon in v2")} 
             />
             <SettingRow 
               icon={Smartphone} 
               label="Device Management" 
               subLabel="Manage active sessions"
               action={() => {}} 
             />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 px-2">Preferences</h3>
          <div className={`border rounded-2xl overflow-hidden divide-y ${isDark ? 'bg-[#0a0a0a] border-white/10 divide-white/5' : 'bg-white border-slate-200 divide-slate-100'}`}>
             <div className={`w-full flex items-center justify-between p-4 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
                     {theme === 'dark' ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Appearance</div>
                    <div className="text-xs text-zinc-500">Switch betwen Dark & Light mode</div>
                  </div>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>
             <SettingRow 
               icon={Bell} 
               label="Notifications" 
               subLabel="Push alerts, Email updates"
               action={() => {}} 
             />
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3 px-2">Support</h3>
          <div className={`border rounded-2xl overflow-hidden divide-y ${isDark ? 'bg-[#0a0a0a] border-white/10 divide-white/5' : 'bg-white border-slate-200 divide-slate-100'}`}>
             <SettingRow 
               icon={HelpCircle} 
               label="Help Center" 
               action={() => window.open('https://support.google.com', '_blank')} 
             />
             <SettingRow 
               icon={Mail} 
               label="Contact Support" 
               subLabel="Average response: 2 hrs"
               action={() => window.location.href = 'mailto:support@corecoin.com'} 
             />
             <SettingRow 
               icon={FileText} 
               label="Legal" 
               subLabel="Terms of Service & Privacy"
               action={() => {}} 
             />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4">
           <button 
             onClick={handleLogout}
             className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all active:scale-95"
           >
             <LogOut size={18} /> Sign Out
           </button>
           
           <div className="mt-8 text-center">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Corecoin v1.2.0</p>
              <p className="text-[10px] text-zinc-500 mt-1">Secured by Supabase & Ethereum</p>
           </div>
        </div>

      </div>
    </div>
  );
}