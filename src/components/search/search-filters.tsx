'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  source: string;
  sort: string;
  onSourceChange: (source: string) => void;
  onSortChange: (sort: string) => void;
  className?: string;
}

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: 'BUNDESTAG', label: 'Bundestag' },
  { value: 'BUERGER', label: 'Bürger' },
] as const;

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevanz' },
  { value: 'newest', label: 'Neueste' },
  { value: 'most_votes', label: 'Meiste Stimmen' },
] as const;

export function SearchFilters({
  source,
  sort,
  onSourceChange,
  onSortChange,
  className,
}: SearchFiltersProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Source filter */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          Quelle:
        </span>
        {SOURCE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={source === option.value ? 'default' : 'outline'}
            size="xs"
            onClick={() => onSourceChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Sort filter */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          Sortierung:
        </span>
        {SORT_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={sort === option.value ? 'default' : 'outline'}
            size="xs"
            onClick={() => onSortChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
