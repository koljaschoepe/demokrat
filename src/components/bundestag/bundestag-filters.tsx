'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RotateCcw } from 'lucide-react';

export interface BundestagFilters {
  fraktion?: string;
  category?: string;
  vorgangstyp?: string;
  search?: string;
}

interface BundestagFiltersProps {
  filters: BundestagFilters;
  onFilterChange: (filters: BundestagFilters) => void;
}

const FRAKTIONEN = [
  'SPD',
  'CDU/CSU',
  'BÜNDNIS 90/DIE GRÜNEN',
  'FDP',
  'AfD',
  'DIE LINKE',
  'BSW',
  'Fraktionslos',
];

const VORGANGSTYPEN = [
  'Gesetzgebung',
  'Antrag',
  'Kleine Anfrage',
  'Große Anfrage',
  'Verordnung',
  'Bericht',
  'Sonstige',
];

const KATEGORIEN = [
  'Innenpolitik',
  'Außenpolitik',
  'Wirtschaft',
  'Finanzen',
  'Soziales',
  'Gesundheit',
  'Bildung',
  'Umwelt',
  'Verteidigung',
  'Verkehr',
  'Digitales',
  'Justiz',
  'Arbeit',
  'Landwirtschaft',
  'Kultur',
];

function hasActiveFilters(filters: BundestagFilters): boolean {
  return !!(filters.fraktion || filters.category || filters.vorgangstyp);
}

export function BundestagFiltersBar({
  filters,
  onFilterChange,
}: BundestagFiltersProps) {
  const updateFilter = (key: keyof BundestagFilters, value: string | null | undefined) => {
    onFilterChange({ ...filters, [key]: value ?? undefined });
  };

  const resetFilters = () => {
    onFilterChange({
      search: filters.search,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Fraktion Filter */}
      <Select
        value={filters.fraktion ?? ''}
        onValueChange={(val) =>
          updateFilter('fraktion', val === '' ? undefined : val)
        }
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Fraktion" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Fraktionen</SelectItem>
          {FRAKTIONEN.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Vorgangstyp Filter */}
      <Select
        value={filters.vorgangstyp ?? ''}
        onValueChange={(val) =>
          updateFilter('vorgangstyp', val === '' ? undefined : val)
        }
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Vorgangstyp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Vorgangstypen</SelectItem>
          {VORGANGSTYPEN.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Kategorie / Sachgebiet Filter */}
      <Select
        value={filters.category ?? ''}
        onValueChange={(val) =>
          updateFilter('category', val === '' ? undefined : val)
        }
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Themengebiet" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Alle Themengebiete</SelectItem>
          {KATEGORIEN.map((k) => (
            <SelectItem key={k} value={k}>
              {k}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filter zurücksetzen */}
      {hasActiveFilters(filters) && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          <RotateCcw className="size-3.5" />
          Filter zurücksetzen
        </Button>
      )}
    </div>
  );
}
