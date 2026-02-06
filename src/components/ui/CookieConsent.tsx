"use client";
import React, { useState, useEffect } from 'react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check if the user has ALREADY accepted
    const hasConsent = localStorage.getItem('corecoin_cookie_consent');
    
    // 2. If not, show the banner after a short delay
    if (!hasConsent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // 3. Save the choice to the browser's memory
    localStorage.setItem('corecoin_cookie_consent', 'true');
    setIsVisible(false);
  };

  const handleReject = () => {
    // Optional: You can store a 'false' if you want to remember they rejected
    localStorage.setItem('corecoin_cookie_consent', 'false');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#1e1e1e] border-t border-white/10 p-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
            <strong>We value your privacy.</strong> We use cookies to optimize your trading experience and analyze traffic. 
            By continuing, you agree to our <a href="#" className="text-primary hover:underline">Cookies Policy</a>.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleReject} 
            className="flex-1 md:flex-none px-6 py-2 bg-transparent border border-white/20 rounded-lg text-white text-xs font-bold hover:bg-white/10 transition-colors"
          >
            Reject All
          </button>
          <button 
            onClick={handleAccept} 
            className="flex-1 md:flex-none px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}