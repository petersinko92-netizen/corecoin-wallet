"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, Send, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP SECTION: LOGO & LINKS (Unchanged) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
          
          {/* BRAND COLUMN */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Image 
                  src="/icon.svg" 
                  alt="Corecoin" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-outfit text-xl font-extrabold tracking-tight text-white uppercase group-hover:text-emerald-400 transition-colors">
                CORECOIN
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-sm">
              The complete crypto ecosystem for everyone. Buy, sell, trade, and earn cryptocurrencies with institutional-grade security and zero friction.
            </p>
            
            <div className="flex gap-4">
               <SocialLink icon={<Twitter size={18} />} href="#" />
               <SocialLink icon={<Send size={18} />} href="#" />
               <SocialLink icon={<Instagram size={18} />} href="#" />
               <SocialLink icon={<Youtube size={18} />} href="#" />
            </div>
          </div>

          {/* COLUMN 1: PRODUCTS */}
          <div>
            <h4 className="text-white font-bold mb-6">Products</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><FooterLink href="#">Buy Crypto</FooterLink></li>
              <li><FooterLink href="#">Spot Market</FooterLink></li>
              <li><FooterLink href="#">Corecoin Earn</FooterLink></li>
              <li><FooterLink href="#">Corecoin API</FooterLink></li>
              <li><FooterLink href="#">Institutional Services</FooterLink></li>
            </ul>
          </div>

          {/* COLUMN 2: COMPANY */}
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><FooterLink href="#">About Us</FooterLink></li>
              <li><FooterLink href="#">Careers</FooterLink></li>
              <li><FooterLink href="#">Press</FooterLink></li>
              <li><FooterLink href="#">Community</FooterLink></li>
              <li><FooterLink href="#">Legal & Privacy</FooterLink></li>
            </ul>
          </div>

          {/* COLUMN 3: SUPPORT */}
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><FooterLink href="#">Help Center</FooterLink></li>
              <li><FooterLink href="#">Trading Fees</FooterLink></li>
              <li><FooterLink href="#">Security Center</FooterLink></li>
              <li><FooterLink href="#">Submit a Ticket</FooterLink></li>
              <li><FooterLink href="#">Status Page</FooterLink></li>
            </ul>
          </div>

          {/* COLUMN 4: DEVELOPERS */}
          <div>
            <h4 className="text-white font-bold mb-6">Developers</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><FooterLink href="#">Documentation</FooterLink></li>
              <li><FooterLink href="#">Github</FooterLink></li>
              <li><FooterLink href="#">Audit Reports</FooterLink></li>
              <li><FooterLink href="#">Bug Bounty</FooterLink></li>
            </ul>
          </div>

        </div>

        {/* DIVIDER */}
        <div className="w-full h-px bg-white/5 mb-10"></div>

        {/* BOTTOM SECTION: DISCLAIMER & COPYRIGHT */}
        <div className="flex flex-col gap-8">
          
          {/* THE DISCLAIMER TEXT (FIXED FOR CUSTODIAL EXCHANGE) */}
          <div className="text-[11px] leading-relaxed text-zinc-600 space-y-4 text-justify border-l-2 border-zinc-800 pl-4">
            <p>
              <strong>Corecoin is a digital asset exchange platform.</strong> While we employ institutional-grade security measures (DESM) to protect user funds, digital asset trading involves significant risk. Corecoin does not conduct any independent diligence on the individual growth potential of any blockchain asset listed on the platform.
            </p>
            <p>
              You are fully and solely responsible for evaluating your investments and determining whether you will trade blockchain assets based on your own research. In many cases, blockchain assets you trade may decrease in value. Past performance is not indicative of future results.
            </p>
            <p>
               The value of the blockchain assets you hold is subject to market volatility. Unlike traditional bank deposits, your crypto assets are not covered by government deposit insurance schemes (such as FDIC or NDIC) unless explicitly stated for specific fiat balances.
            </p>
            <p className="font-medium text-zinc-500">
              <strong>Security Notice:</strong> While Corecoin manages the custody of assets, you are responsible for maintaining the security of your account credentials (passwords, 2FA codes, and API keys). Corecoin will never ask for your password or 2FA code via email or social media.
            </p>
          </div>

          {/* COPYRIGHT & LEGAL LINKS */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8 mt-4">
            <div className="text-zinc-500 text-xs">
              Copyright © 2026 Corecoin Technologies Inc. All rights reserved.
            </div>
            
            <div className="flex gap-6 text-xs text-zinc-500 font-medium">
               <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
               <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
               <Link href="#" className="hover:text-white transition-colors">Trademarks</Link>
               <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

// Small helper for Links
function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-emerald-400 transition-colors block">
      {children}
    </Link>
  );
}

// Small helper for Social Icons
function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <Link 
      href={href} 
      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-black transition-all"
    >
      {icon}
    </Link>
  );
}