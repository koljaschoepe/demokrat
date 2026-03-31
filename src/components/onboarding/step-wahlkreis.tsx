'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapPin, Search, Loader2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { searchWahlkreise, type Wahlkreis } from '@/lib/data/wahlkreise';
import { reverseGeocodeWahlkreis } from '@/lib/geo/reverse-geocode-wahlkreis';

interface StepWahlkreisProps {
  onNext: (wahlkreisId: number) => void;
}

export function StepWahlkreis({ onNext }: StepWahlkreisProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Wahlkreis[]>([]);
  const [selected, setSelected] = useState<Wahlkreis | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const data = await searchWahlkreise(searchQuery);
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      void handleSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, handleSearch]);

  const handleGeolocate = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoError('Standortbestimmung wird von deinem Browser nicht unterstützt.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 600000,
          });
        },
      );

      const result = await reverseGeocodeWahlkreis(
        position.coords.latitude,
        position.coords.longitude,
      );

      if (result?.name) {
        setQuery(result.name);
        await handleSearch(result.name);
      } else {
        setGeoError('Dein Standort konnte keinem Wahlkreis zugeordnet werden. Bitte suche manuell.');
      }
    } catch {
      setGeoError('Standortbestimmung fehlgeschlagen. Bitte suche manuell.');
    } finally {
      setIsLocating(false);
    }
  }, [handleSearch]);

  const handleSelect = useCallback((wahlkreis: Wahlkreis) => {
    setSelected(wahlkreis);
    setResults([]);
    setQuery('');
  }, []);

  const handleReset = useCallback(() => {
    setSelected(null);
    setQuery('');
    setResults([]);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-heading font-semibold">
          Wo bist du zuhause?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Wähle deinen Wahlkreis, um relevante Themen zu sehen.
        </p>
      </div>

      {selected ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="size-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium">{selected.name}</p>
              <p className="text-sm text-muted-foreground">
                Wahlkreis {selected.id} &middot; {selected.bundesland}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onNext(selected.id)}>
                Stimmt
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" data-icon="inline-start" />
                Ändern
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Button
            variant="outline"
            size="lg"
            onClick={handleGeolocate}
            disabled={isLocating}
            className="w-full"
          >
            {isLocating ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <MapPin className="size-4" data-icon="inline-start" />
            )}
            {isLocating ? 'Standort wird ermittelt...' : 'Standort verwenden'}
          </Button>

          {geoError && (
            <p className="text-sm text-destructive text-center">{geoError}</p>
          )}

          <div className="relative flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">oder</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Wahlkreis suchen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              aria-label="Wahlkreis suchen"
            />
            {isSearching && (
              <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {results.length > 0 && (
            <ul
              className="flex flex-col gap-1 rounded-lg border bg-card p-1"
              role="listbox"
              aria-label="Wahlkreis-Suchergebnisse"
            >
              {results.map((wk) => (
                <li key={wk.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                    )}
                    onClick={() => handleSelect(wk)}
                  >
                    <span className="flex-1 font-medium">{wk.name}</span>
                    <span className="text-xs text-muted-foreground">
                      WK {wk.id} &middot; {wk.bundesland}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query.length >= 2 && !isSearching && results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Kein Wahlkreis gefunden. Versuche es mit einem anderen Suchbegriff.
            </p>
          )}
        </>
      )}
    </div>
  );
}
