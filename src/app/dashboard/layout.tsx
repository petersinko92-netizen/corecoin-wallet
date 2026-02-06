"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { GlobalLoader } from '@/components/ui/GlobalLoader';
import { LockScreen } from '@/components/security/LockScreen'; // ✅ IMPORT THIS
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { SecurityProvider, useSecurity } from '@/context/SecurityContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SecurityProvider>
         <AuthenticatedLayout>{children}</AuthenticatedLayout>
      </SecurityProvider>
    </ThemeProvider>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  // ✅ LISTEN TO SECURITY STATE
  const { isLocked, isLoading: isSecurityLoading } = useSecurity(); 
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // Use getUser() instead of getSession() for better security (validates token with server)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 1500); 
    };
    checkUser();
  }, [router]);

  // BLOCKING LOADER
  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-[#050505] text-white' 
        : 'bg-[#F3F4F6] text-slate-900'
    }`}>
      
      {/* ✅ SECURITY OVERLAY */}
      {/* If isLocked is true, this sits on top of everything else */}
      {isLocked && <LockScreen />}

      <Sidebar />

      <main className="lg:ml-72 min-h-screen pb-24 lg:pb-0 animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto w-full">
           {children}
        </div>
      </main>

      <MobileNav />
      
    </div>
  );
}