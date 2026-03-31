'use client';

import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        !prefersReducedMotion && 'animate-page-fade-in',
        className
      )}
      style={
        !prefersReducedMotion
          ? {
              animation: 'page-fade-in 200ms ease-out forwards',
            }
          : undefined
      }
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes page-fade-in {
              from {
                opacity: 0;
                transform: translateY(4px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `,
        }}
      />
      {children}
    </div>
  );
}
