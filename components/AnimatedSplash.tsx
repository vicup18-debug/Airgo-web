"use client";
import { useEffect, useState } from 'react';

export default function AnimatedSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'drawing' | 'filled' | 'fadeout'>('drawing');

  useEffect(() => {
    // Phase 1: Draw for 1.5 seconds
    const t1 = setTimeout(() => {
      setPhase('filled');
    }, 1500);

    // Phase 2: Glow & Filled for 1 second, then fadeout
    const t2 = setTimeout(() => {
      setPhase('fadeout');
    }, 2500);

    // End
    const t3 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className={`transform transition-all duration-1000 ease-in-out ${phase === 'fadeout' ? 'scale-110 blur-sm' : 'scale-100 blur-0'}`}>
        <svg viewBox="0 0 400 200" className="w-64 h-32 md:w-96 md:h-48">
           <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#F26D21" />
                 <stop offset="100%" stopColor="#FF9B42" />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="0">
                 <stop offset="0%" stopColor="#0F4E8B" />
                 <stop offset="100%" stopColor="#1A73E8" />
              </linearGradient>
              <filter id="glow">
                 <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                 <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                 </feMerge>
              </filter>
           </defs>
           
           <style>
             {`
               .draw-path {
                 stroke-dasharray: 1000;
                 stroke-dashoffset: 1000;
                 animation: draw 1.5s ease-in-out forwards;
               }
               @keyframes draw {
                 to {
                   stroke-dashoffset: 0;
                 }
               }
               .fill-path {
                 transition: fill-opacity 0.8s ease-in-out, filter 0.8s ease-in-out;
               }
             `}
           </style>

           {/* Orange Swoosh */}
           <path 
             d="M 40 140 C 120 180, 150 90, 250 140 C 220 160, 180 150, 140 130 C 100 110, 60 150, 40 140 Z" 
             fill="url(#orangeGrad)"
             fillOpacity={phase === 'drawing' ? 0 : 1}
             stroke="url(#orangeGrad)"
             strokeWidth={phase === 'drawing' ? "8" : "0"}
             strokeLinecap="round"
             strokeLinejoin="round"
             className="draw-path fill-path"
             filter={phase !== 'drawing' ? "url(#glow)" : ""}
           />

           {/* Blue Swoosh */}
           <path 
             d="M 140 130 C 180 70, 240 70, 320 140 C 350 170, 280 40, 170 80 C 160 85, 150 110, 140 130 Z" 
             fill="url(#blueGrad)"
             fillOpacity={phase === 'drawing' ? 0 : 1}
             stroke="url(#blueGrad)"
             strokeWidth={phase === 'drawing' ? "8" : "0"}
             strokeLinecap="round"
             strokeLinejoin="round"
             className="draw-path fill-path"
             filter={phase !== 'drawing' ? "url(#glow)" : ""}
             style={{ animationDelay: '0.2s' }}
           />
        </svg>
      </div>
    </div>
  );
}
