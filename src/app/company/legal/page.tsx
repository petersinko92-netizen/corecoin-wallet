"use client";
import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-12 border-b border-white/10 pb-8">Legal & Compliance</h1>
        
        <div className="space-y-12 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the Corecoin platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Risk Disclosure</h2>
            <p>Digital asset trading involves significant risk and is not suitable for all investors. You acknowledge that you are solely responsible for your investment decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Privacy Policy</h2>
            <p>We take your privacy seriously. Corecoin collects and processes data in accordance with global data protection regulations (GDPR/NDPR).</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}