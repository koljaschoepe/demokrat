'use client';

import { useCallback, useState } from 'react';
import {
  Leaf,
  TrendingUp,
  BookOpen,
  Heart,
  Laptop,
  Users,
  Shield,
  Coins,
  Home,
  Globe,
  ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORIES, type CategoryId } from '@/lib/data/categories';

const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  TrendingUp,
  BookOpen,
  Heart,
  Laptop,
  Users,
  Shield,
  Coins,
  Home,
  Globe,
};

const MIN_CATEGORIES = 3;
const MAX_CATEGORIES = 5;

interface StepInterestsProps {
  onNext: (categories: string[]) => void;
  onBack: () => void;
}

export function StepInterests({ onNext, onBack }: StepInterestsProps) {
  const [selected, setSelected] = useState<Set<CategoryId>>(new Set());

  const toggleCategory = useCallback((id: CategoryId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < MAX_CATEGORIES) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const canProceed = selected.size >= MIN_CATEGORIES;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-heading font-semibold">
          Was interessiert dich?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Wähle {MIN_CATEGORIES}&ndash;{MAX_CATEGORIES} Themen, die dir wichtig sind.
        </p>
      </div>

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="group"
        aria-label="Interessenkategorien"
      >
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isSelected = selected.has(cat.id);
          const isDisabled = !isSelected && selected.size >= MAX_CATEGORIES;

          return (
            <button
              key={cat.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={cat.label}
              disabled={isDisabled}
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-all',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground',
                isDisabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'size-6',
                    isSelected ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <p
        className={cn(
          'text-center text-sm',
          canProceed ? 'text-primary' : 'text-muted-foreground',
        )}
        aria-live="polite"
      >
        {selected.size}/{MAX_CATEGORIES} ausgewählt
        {selected.size < MIN_CATEGORIES && (
          <span> (mindestens {MIN_CATEGORIES})</span>
        )}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Zurück
        </Button>
        <Button
          onClick={() => onNext(Array.from(selected))}
          disabled={!canProceed}
          className="flex-1"
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
