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
    // ✅ Added 'pb-[env(safe-area-inset-bottom)]' for iPhone Home Bar safety
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300 ${
      isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-200 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]'
    }`}>
      <div className="flex justify-around items-center p-2 pt-3">
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
              <div className={`relative p-1.5 rounded-xl transition-all ${
                 isActive ? (isDark ? 'bg-emerald-500/10' : 'bg-emerald-50') : 'bg-transparent'
              }`}>
                 <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
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