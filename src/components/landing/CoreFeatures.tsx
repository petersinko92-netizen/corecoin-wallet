"use client";
import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Zap, Lock } from 'lucide-react';

export function CoreFeatures() {
  return (
    <section className="py-12 md:py-24 px-6 bg-[#050505] overflow-hidden border-b border-white/5 relative">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* LEFT: Text Content */}
        <div className="order-2 lg:order-1 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 md:mb-6 leading-tight">
            Institutional <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Security Standard.
            </span>
          </h2>
          <p className="text-zinc-400 text-base md:text-lg mb-8 md:mb-10 leading-relaxed max-w-lg">
            We don't just store crypto; we secure it. Corecoin uses a proprietary <strong>DESM (Double Encryption Storage Mechanism)</strong> 
            to ensure your assets are physically isolated from online threats.
          </p>

          <div className="space-y-6 md:space-y-8">
            <FeatureItem 
              icon={<ShieldCheck size={20} />} 
              title="Cold Storage Vaults" 
              desc="95% of user funds are held in air-gapped offline wallets."
            />
            <FeatureItem 
              icon={<Zap size={20} />} 
              title="Zero-Latency Trading" 
              desc="Our matching engine handles 100,000 transactions per second."
            />
            <FeatureItem 
              icon={<Lock size={20} />} 
              title="Biometric Access" 
              desc="Hardware-level security keys required for large withdrawals."
            />
          </div>
        </div>

        {/* RIGHT: Image with "Vignette" Fix */}
        <div className="order-1 lg:order-2 relative h-[300px] md:h-[600px] w-full flex items-center justify-center">
           
           <div className="relative w-full h-full">
             <Image 
               src="/feature-image.png" 
               alt="Security Infrastructure" 
               fill
               className="object-contain mix-blend-screen opacity-100" 
               priority
             />
             
             {/* THE FIX: Gradient Vignette Overlay 
                 This creates a fade from the edges (background color) to transparent (center).
                 It effectively paints over the hard lines of the image box.
             */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050505_70%)] pointer-events-none"></div>
             
             {/* Extra Safety Layers for Top/Bottom edges */}
             <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none"></div>
             <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
           </div>

        </div>

      </div>
    </section>
  );
}

// Sub-component
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="mt-1 w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all duration-300 shrink-0 border border-white/5 group-hover:border-emerald-500/20 shadow-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-bold text-lg md:text-xl mb-1 md:mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
        <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}