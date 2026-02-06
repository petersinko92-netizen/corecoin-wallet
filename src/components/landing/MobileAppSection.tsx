"use client";
import React from 'react';
import Image from 'next/image';
import { Apple, Play, Smartphone, Star, Download } from 'lucide-react';

export function MobileAppSection() {
  return (
    <section className="py-16 md:py-24 px-6 bg-[#050505] overflow-hidden border-b border-white/5 relative">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-emerald-500/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* 1. TEXT CONTENT (Order 1) */}
        <div className="relative z-10 text-center lg:text-left order-1">
          
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-md">
             <Smartphone size={16} className="text-emerald-400" />
             <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Mobile App</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1]">
            Trade Anywhere, <br />
            <span className="text-zinc-600">Anytime.</span>
          </h2>
          
          <p className="text-zinc-400 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Stay connected to the market with the Corecoin App. Experience faster execution, real-time alerts, and biometric security right in your pocket.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start w-full sm:w-auto">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 group w-full sm:w-auto">
               <Apple size={24} className="fill-current" />
               <div className="text-left leading-none">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Download on the</div>
                  <div className="text-sm md:text-base font-black">App Store</div>
               </div>
            </button>

            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-zinc-900 border border-white/10 text-white rounded-xl hover:bg-zinc-800 transition-all shadow-lg hover:scale-105 active:scale-95 group w-full sm:w-auto">
               <Play size={24} className="fill-current" />
               <div className="text-left leading-none">
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">Get it on</div>
                  <div className="text-sm md:text-base font-black">Google Play</div>
               </div>
            </button>
          </div>

          <div className="mt-8 md:mt-12 flex items-center justify-center lg:justify-start gap-6 md:gap-12 text-zinc-500 font-medium text-sm border-t border-white/5 pt-6 md:pt-8">
             <div className="flex items-center gap-2 md:gap-3">
                <Star size={16} className="text-emerald-500 fill-emerald-500" />
                <div className="text-left">
                    <span className="text-white font-bold">4.8/5</span> <span className="text-xs uppercase ml-1">Rating</span>
                </div>
             </div>
             <div className="w-px h-6 bg-white/10"></div>
             <div className="flex items-center gap-2 md:gap-3">
                <Download size={16} className="text-blue-500" />
                <div className="text-left">
                    <span className="text-white font-bold">1M+</span> <span className="text-xs uppercase ml-1">Downloads</span>
                </div>
             </div>
          </div>
        </div>

        {/* 2. IMAGE CONTENT (Order 2) */}
        <div className="relative h-[400px] md:h-[600px] w-full flex items-center justify-center order-2 mt-8 lg:mt-0 overflow-hidden">
           
           <div className="relative w-full h-full animate-float flex items-center justify-center">
             
             {/* THE IMAGE */}
             {/* scale-110: Slight zoom to push edges out */}
             <Image 
               src="/mobile-app.jpg" 
               alt="Corecoin Mobile Trading" 
               fill
               className="object-cover md:object-contain scale-110"
               priority
             />
             
             {/* THE 4-WALL FADE FIX */}
             {/* Instead of one weak circle, we place 4 strong walls of black paint. */}
             
             {/* 1. LEFT WALL (Solid Black -> Transparent) */}
             <div className="absolute top-0 bottom-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] via-[#050505] to-transparent z-20"></div>
             
             {/* 2. RIGHT WALL (Solid Black -> Transparent) */}
             <div className="absolute top-0 bottom-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] via-[#050505] to-transparent z-20"></div>
             
             {/* 3. TOP WALL (Solid Black -> Transparent) */}
             <div className="absolute top-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-b from-[#050505] via-[#050505] to-transparent z-20"></div>
             
             {/* 4. BOTTOM WALL (Solid Black -> Transparent) */}
             <div className="absolute bottom-0 left-0 right-0 h-24 md:h-40 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-20"></div>

             {/* 5. Center Softener (Optional, just to darken the background slightly) */}
             <div className="absolute inset-0 z-10 bg-[#050505]/20 pointer-events-none mix-blend-multiply"></div>

           </div>

        </div>

      </div>
    </section>
  );
}