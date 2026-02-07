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
  
  // 🔍 SEO: JSON-LD Structured Data
  // This tells Google we are a legitimate Organization and helps get Sitelinks.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "CoreCoin",
        "url": "https://corecoin.co",
        "logo": "https://corecoin.co/icon-512.png",
        "sameAs": [
          "https://twitter.com/corecoin",
          "https://instagram.com/corecoin"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-555-019-2834", // Optional: Add real support number or remove
          "contactType": "customer service"
        }
      },
      {
        "@type": "WebSite",
        "name": "CoreCoin Wallet",
        "url": "https://corecoin.co",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://corecoin.co/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white">
      
      {/* 🔍 SEO Script Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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