"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AnimatedSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'initial' | 'phase1' | 'phase2'>('initial');
  const [containerFade, setContainerFade] = useState(false);

  useEffect(() => {
    // Start Phase 1 on mount
    // The timeout ensures the initial state is rendered before adding the transition classes
    const t0 = setTimeout(() => {
      setPhase('phase1');
    }, 50);

    // Phase 2: The "Zoom Out" Exit Transition (after 2.5s)
    const t1 = setTimeout(() => {
      setPhase('phase2');
    }, 2500);

    // Fade out container (after 2.8s)
    const t2 = setTimeout(() => {
      setContainerFade(true);
    }, 2800);

    // End (after 3.2s)
    const t3 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Determine logo styles based on phase
  let logoStyle: React.CSSProperties = {
    opacity: 0,
    transform: 'scale(0.85)',
    transition: 'none',
  };

  if (phase === 'phase1') {
    logoStyle = {
      opacity: 1,
      transform: 'scale(1)',
      // opacity fades in over 1.2s, scale transitions over 2.5s
      transition: 'opacity 1200ms cubic-bezier(0.19, 1, 0.22, 1), transform 2500ms cubic-bezier(0.25, 1, 0.5, 1)',
    };
  } else if (phase === 'phase2') {
    logoStyle = {
      opacity: 0,
      transform: 'scale(1.1)',
      // opacity fades out over 0.5s, scale transitions over 0.6s
      transition: 'opacity 500ms cubic-bezier(0.55, 0.085, 0.68, 0.53), transform 600ms cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    };
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
      style={{
        opacity: containerFade ? 0 : 1,
        transition: 'opacity 400ms ease-in-out',
        pointerEvents: containerFade ? 'none' : 'auto',
      }}
    >
      <div style={logoStyle} className="relative w-[150px] h-[150px] md:w-[220px] md:h-[220px]">
        <Image 
          src="/icon.png" 
          alt="Airgo Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
    </div>
  );
}

