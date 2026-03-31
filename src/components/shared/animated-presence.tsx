'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface AnimatedPresenceProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'scale';
}

const ANIMATION_STYLES = {
  fade: {
    enter: { opacity: 1 },
    exit: { opacity: 0 },
    initial: { opacity: 0 },
    transition: 'opacity 200ms ease-out',
  },
  'slide-up': {
    enter: { opacity: 1, transform: 'translateY(0)' },
    exit: { opacity: 0, transform: 'translateY(8px)' },
    initial: { opacity: 0, transform: 'translateY(8px)' },
    transition: 'opacity 200ms ease-out, transform 200ms ease-out',
  },
  scale: {
    enter: { opacity: 1, transform: 'scale(1)' },
    exit: { opacity: 0, transform: 'scale(0.95)' },
    initial: { opacity: 0, transform: 'scale(0.95)' },
    transition: 'opacity 200ms ease-out, transform 200ms ease-out',
  },
};

export function AnimatedPresence({
  show,
  children,
  className,
  animation = 'fade',
}: AnimatedPresenceProps) {
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // Request animation frame to ensure the element is mounted before animating in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      if (prefersReducedMotion) {
        setMounted(false);
      }
    }
  }, [show, prefersReducedMotion]);

  useEffect(() => {
    if (!visible && !prefersReducedMotion) {
      const el = ref.current;
      if (!el) return;

      const handleTransitionEnd = () => {
        if (!visible) {
          setMounted(false);
        }
      };

      el.addEventListener('transitionend', handleTransitionEnd);
      return () => el.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [visible, prefersReducedMotion]);

  if (!mounted) return null;

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const config = ANIMATION_STYLES[animation];
  const currentStyle = visible ? config.enter : config.exit;

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        ...currentStyle,
        transition: config.transition,
      }}
    >
      {children}
    </div>
  );
}
