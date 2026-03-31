'use client';

import { cn } from '@/lib/utils';

const FILTERS = [
  'Alle',
  'Bundestag',
  'B\u00fcrger',
  'Trending',
  'Gesundheit',
  'Wirtschaft',
  'Umwelt',
  'Bildung',
  'Digitalisierung',
] as const;

interface FilterChipsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterChips({ activeFilter, onFilterChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            )}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
