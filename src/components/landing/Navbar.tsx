"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown, ChevronRight, BarChart2, Wallet, Shield, Globe, Users, FileText } from 'lucide-react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for Desktop Hover
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // State for Mobile Accordion (Which section is open?)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const toggleMobileSection = (section: string) => {
    if (mobileExpanded === section) {
      setMobileExpanded(null); // Close if already open
    } else {
      setMobileExpanded(section); // Open new section
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b ${
          isScrolled || activeDropdown
            ? 'bg-[#050505]/90 backdrop-blur-xl border-white/5 py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-full relative">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-0.5 group z-50">
            <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image src="/logo.svg" alt="Corecoin" fill className="object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" priority />
            </div>
            <span className="font-outfit text-2xl md:text-[26px] font-extrabold tracking-tight leading-none text-white uppercase mt-1 transition-colors duration-300 group-hover:text-emerald-400">
              CORECOIN
            </span>
          </Link>

          {/* DESKTOP NAV (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-8 h-full">
             <div className="relative h-full flex items-center" onMouseEnter={() => setActiveDropdown('products')}>
                <button className={`text-sm font-bold transition-colors flex items-center gap-1 py-2 ${activeDropdown === 'products' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}>
                  Products <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <Link href="/markets" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Markets</Link>
             <div className="relative h-full flex items-center" onMouseEnter={() => setActiveDropdown('company')}>
                <button className={`text-sm font-bold transition-colors flex items-center gap-1 py-2 ${activeDropdown === 'company' ? 'text-emerald-400' : 'text-zinc-400 hover:text-white'}`}>
                  Company <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
                </button>
             </div>
             <Link href="/support" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Support</Link>
          </nav>

          {/* AUTH (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">Log In</Link>
            <Link href="/auth/signup" className="h-10 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center">
              Get Started
            </Link>
          </div>

          {/* MOBILE TOGGLE BUTTON */}
          <button className="md:hidden z-50 text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* --- DESKTOP DROPDOWNS --- */}
        <div 
          className={`absolute top-full left-0 w-full bg-[#0a0a0a] border-y border-white/5 shadow-2xl transition-all duration-300 overflow-hidden ${
            activeDropdown === 'products' ? 'max-h-[300px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}
          onMouseEnter={() => setActiveDropdown('products')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
           <div className="max-w-7xl mx-auto p-8 grid grid-cols-4 gap-8">
              <DropdownItem icon={<BarChart2 className="text-emerald-500" />} title="Spot Trading" desc="Trade crypto with zero fees." href="/markets" />
              <DropdownItem icon={<Wallet className="text-blue-500" />} title="Core Wallet" desc="Secure non-custodial storage." href="#" />
              <DropdownItem icon={<Shield className="text-orange-500" />} title="Institutional" desc="VIP services for pro traders." href="#" />
              <DropdownItem icon={<Globe className="text-purple-500" />} title="Corecoin API" desc="High-frequency trading data." href="#" />
           </div>
        </div>

        <div 
          className={`absolute top-full left-0 w-full bg-[#0a0a0a] border-y border-white/5 shadow-2xl transition-all duration-300 overflow-hidden ${
            activeDropdown === 'company' ? 'max-h-[300px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}
          onMouseEnter={() => setActiveDropdown('company')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
           <div className="max-w-7xl mx-auto p-8 grid grid-cols-4 gap-8">
              <DropdownItem icon={<Users className="text-pink-500" />} title="About Us" desc="Our mission and team." href="/company/about" />
              <DropdownItem icon={<FileText className="text-yellow-500" />} title="Careers" desc="Join the revolution." href="/company/careers" />
              <DropdownItem icon={<Shield className="text-emerald-500" />} title="Security" desc="How we protect your funds." href="/company/security" />
              <DropdownItem icon={<Globe className="text-blue-500" />} title="Legal" desc="Terms and privacy." href="/company/legal" />
           </div>
        </div>

      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div className={`fixed inset-0 z-[90] bg-[#050505] transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="flex flex-col h-full pt-28 px-6 pb-10 overflow-y-auto">
            
            <div className="flex flex-col gap-2 mb-8">
              {/* Markets Link */}
              <Link href="/markets" className="text-2xl font-bold text-white py-4 border-b border-white/5 flex justify-between items-center" onClick={() => setIsMobileMenuOpen(false)}>
                 Markets <ChevronRight size={20} className="text-zinc-600"/>
              </Link>

              {/* PRODUCTS ACCORDION */}
              <div>
                <button 
                  onClick={() => toggleMobileSection('products')}
                  className="w-full text-2xl font-bold text-white py-4 border-b border-white/5 flex justify-between items-center"
                >
                   Products 
                   <ChevronDown size={20} className={`text-zinc-600 transition-transform ${mobileExpanded === 'products' ? 'rotate-180' : ''}`} />
                </button>
                {/* Expanded Content */}
                <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'products' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                   <div className="flex flex-col gap-4 pl-4 border-l border-white/10 ml-2">
                      <MobileSubLink href="/markets" onClick={() => setIsMobileMenuOpen(false)}>Spot Trading</MobileSubLink>
                      <MobileSubLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Core Wallet</MobileSubLink>
                      <MobileSubLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Institutional</MobileSubLink>
                      <MobileSubLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Corecoin API</MobileSubLink>
                   </div>
                </div>
              </div>

              {/* COMPANY ACCORDION */}
              <div>
                <button 
                  onClick={() => toggleMobileSection('company')}
                  className="w-full text-2xl font-bold text-white py-4 border-b border-white/5 flex justify-between items-center"
                >
                   Company 
                   <ChevronDown size={20} className={`text-zinc-600 transition-transform ${mobileExpanded === 'company' ? 'rotate-180' : ''}`} />
                </button>
                {/* Expanded Content */}
                <div className={`overflow-hidden transition-all duration-300 ${mobileExpanded === 'company' ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                   <div className="flex flex-col gap-4 pl-4 border-l border-white/10 ml-2">
                      <MobileSubLink href="/company/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</MobileSubLink>
                      <MobileSubLink href="/company/careers" onClick={() => setIsMobileMenuOpen(false)}>Careers</MobileSubLink>
                      <MobileSubLink href="/company/security" onClick={() => setIsMobileMenuOpen(false)}>Security</MobileSubLink>
                      <MobileSubLink href="/company/legal" onClick={() => setIsMobileMenuOpen(false)}>Legal</MobileSubLink>
                   </div>
                </div>
              </div>

              {/* Support Link */}
              <Link href="/support" className="text-2xl font-bold text-white py-4 border-b border-white/5 flex justify-between items-center" onClick={() => setIsMobileMenuOpen(false)}>
                 Support <ChevronRight size={20} className="text-zinc-600"/>
              </Link>

            </div>

            {/* Mobile Auth Buttons */}
            <div className="mt-auto">
              <Link href="/auth/login" className="w-full h-14 rounded-xl border border-white/10 flex items-center justify-center text-white font-bold mb-4" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
              <Link href="/auth/signup" className="w-full h-14 rounded-xl bg-emerald-500 text-black font-bold flex items-center justify-center shadow-lg hover:bg-emerald-400" onClick={() => setIsMobileMenuOpen(false)}>Create Account</Link>
            </div>

         </div>
      </div>
    </>
  );
}

// Helpers
function DropdownItem({ icon, title, desc, href }: any) {
  return (
    <Link href={href} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-emerald-500/20 shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-white font-bold text-sm mb-1 group-hover:text-emerald-400 transition-colors">{title}</div>
        <div className="text-zinc-500 text-xs">{desc}</div>
      </div>
    </Link>
  );
}

function MobileSubLink({ href, onClick, children }: any) {
  return (
    <Link href={href} onClick={onClick} className="text-zinc-400 hover:text-white text-lg font-medium py-1 block transition-colors">
      {children}
    </Link>
  );
}