'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

const LABELS = ['Schwach', 'Mäßig', 'Gut', 'Stark'] as const;

const SEGMENT_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
] as const;

function calculateStrength(password: string): number {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-zA-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return score;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < strength ? SEGMENT_COLORS[strength - 1] : 'bg-muted',
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          'text-xs',
          strength <= 1 && 'text-red-500',
          strength === 2 && 'text-orange-500',
          strength === 3 && 'text-yellow-600',
          strength === 4 && 'text-green-600',
        )}
      >
        Passwortstärke: {LABELS[strength - 1]}
      </p>
    </div>
  );
}
