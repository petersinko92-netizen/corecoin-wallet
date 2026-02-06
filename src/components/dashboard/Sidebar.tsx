"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, Wallet, ArrowRightLeft, Settings, 
  LogOut, TrendingUp, Sun, Moon, Copy, CheckCircle 
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'sonner';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();
  
  const [userId, setUserId] = useState('Loading...');

  useEffect(() => {
    const getIdentity = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // ✅ FIX: Query 'wallets' table, looking for 'user_id'
        const { data } = await supabase
          .from('wallets')
          .select('readable_id')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to prevent console errors if null

        if (data?.readable_id) {
            setUserId(data.readable_id);
        } else {
            setUserId('CORE-User'); // Fallback just in case
        }
      }
    };
    getIdentity();
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    toast.success("User ID copied");
  };

  const menu = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
    { name: 'My Wallet', icon: Wallet, href: '/dashboard/wallet' },
    { name: 'Transactions', icon: ArrowRightLeft, href: '/dashboard/transactions' },
    { name: 'Staking', icon: TrendingUp, href: '/dashboard/staking' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <aside className={`hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 border-r transition-colors duration-300 ${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-white border-zinc-200'}`}>
      
      {/* HEADER + USER ID */}
      <div className="p-6 mb-2">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
             <LayoutGrid size={18} />
          </div>
          <span className={`font-bold tracking-tight text-xl ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>CORECOIN</span>
        </div>

        {/* TRUST BADGE: USER ID */}
        <div 
          onClick={handleCopyId}
          className={`group cursor-pointer p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-zinc-900/50 border-white/5 hover:border-emerald-500/30' : 'bg-zinc-50 border-zinc-200 hover:border-blue-500/30'}`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Verified User ID</span>
            <CheckCircle size={12} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-zinc-800'}`}>
              {userId}
            </span>
            <Copy size={14} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-500' 
                  : (theme === 'dark' ? 'text-zinc-500 hover:text-white hover:bg-white/5' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100')
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="p-4 space-y-2">
        {/* THEME TOGGLE */}
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${theme === 'dark' ? 'text-zinc-500 hover:bg-white/5 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </aside>
  );
}