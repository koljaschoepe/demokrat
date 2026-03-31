'use client';

import { useReducedMotion } from '@/hooks/use-reduced-motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  animationClass: string;
  fallbackClass?: string;
}

/**
 * Wraps animated content to respect reduced motion preferences.
 * When reduced motion is on, applies fallbackClass instead of animationClass.
 */
export function MotionWrapper({
  children,
  className = '',
  animationClass,
  fallbackClass = '',
}: MotionWrapperProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className={`${className} ${reducedMotion ? fallbackClass : animationClass}`}
    >
      {children}
    </div>
  );
}
