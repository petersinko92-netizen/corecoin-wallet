"use client";
import React, { useRef, useEffect } from 'react';

export function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let particles: Particle[] = [];
    
    // Configuration: Max Visibility
    const particleCount = window.innerWidth < 768 ? 60 : 120; 
    const connectionDistance = 160; 
    const mouseDistance = 300; // Radius of interaction

    const mouse = { x: 0, y: 0 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseColor: string;

      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 1.5; // Faster
        this.vy = (Math.random() - 0.5) * 1.5;
        this.size = Math.random() * 2.5 + 1; // Bigger dots
        // High contrast colors
        this.baseColor = Math.random() > 0.4 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(16, 185, 129, 0.9)';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        // Strong Mouse Interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouseDistance - distance) / mouseDistance;
            const repulsion = 4; // Stronger push
            
            this.vx -= forceDirectionX * force * 0.1 * repulsion;
            this.vy -= forceDirectionY * force * 0.1 * repulsion;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.baseColor; // Glow effect
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      
      particles.forEach((p, index) => {
        p.update();
        p.draw();

        for (let j = index; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            const opacity = 1 - distance / connectionDistance;
            
            // Check mouse proximity to line
            const mouseToLinkDist = Math.sqrt((mouse.x - p.x)**2 + (mouse.y - p.y)**2);
            
            if (mouseToLinkDist < 100) {
                 // Active Line (Green & Thick)
                 ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                 ctx.lineWidth = 1.5;
            } else {
                 // Passive Line (White & Thin)
                 ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`; 
                 ctx.lineWidth = 0.5;
            }

            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    init();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-auto" 
      style={{ background: 'transparent' }} 
    />
  );
}