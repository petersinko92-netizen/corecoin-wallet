"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Wallet, ArrowRightLeft, Settings } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function MobileNav() {
  const pathname = usePathname();
  const { theme } = useTheme();

  const menu = [
    { name: 'Home', icon: LayoutGrid, href: '/dashboard' },
    { name: 'Wallet', icon: Wallet, href: '/dashboard/wallet' },
    { name: 'History', icon: ArrowRightLeft, href: '/dashboard/transactions' },
    { name: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  const isDark = theme === 'dark';

  return (
    // ✅ Refined 'pb-[env(safe-area-inset-bottom)]' for premium floating glass look
    <div className={`lg:hidden fixed bottom-4 left-4 right-4 rounded-3xl z-50 transition-all duration-300 backdrop-blur-xl ${
      isDark ? 'bg-zinc-900/80 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/80 border border-slate-200/50 shadow-[0_10px_40px_rgba(0,0,0,0.1)]'
    }`}>
      <div className="flex justify-around items-center p-2.5">
        {menu.map((item) => {
          // ✅ FIX: Keep icon active even when looking at sub-pages (like specific assets)
          const isActive = item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href);

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all duration-300 active:scale-90 ${
                isActive 
                  ? 'text-emerald-500' 
                  : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-600')
              }`}
            >
              {/* Animated Background Pill for Active State */}
              <div className={`relative p-2.5 rounded-full transition-all ${
                 isActive ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/10 text-emerald-600') : 'bg-transparent text-inherit'
              }`}>
                 <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              <span className={`text-[10px] font-bold transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}