import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { MarketTicker } from '@/components/landing/MarketTicker';
import { CoreFeatures } from '@/components/landing/CoreFeatures';
import { MobileAppSection } from '@/components/landing/MobileAppSection';
import { Features } from '@/components/landing/Features'; // The Grid section
import { Footer } from '@/components/landing/Footer';
import { CookieConsent } from '@/components/ui/CookieConsent';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white">
      {/* Navigation */}
      <Navbar />
      
      <main>
        {/* 1. Hero Section: The Hook */}
        <Hero />
        
        {/* 2. Market Ticker: Live Trust Signals */}
        <MarketTicker />
        
        {/* 3. Core Features: The "Security" Visual (3D Wireframe) */}
        <CoreFeatures />
        
        {/* 4. Mobile App: "Trade Anywhere" (Phone Mockup) */}
        <MobileAppSection />
        
        {/* 5. Features Grid: Detailed "Why Choose Us" text */}
        <Features />
      </main>

      {/* Footer & Compliance */}
      <Footer />
      <CookieConsent />
    </div>
  );
}