'use client';

import { useEffect, useState, useRef } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with a subtle fade/slide animation on mount.
 * Uses CSS transitions (not framer-motion). Respects reduced-motion.
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger the transition on next frame
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 ease-out ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
