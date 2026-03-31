'use client';

import { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { Search, MapPin, BarChart3, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth/use-auth';
import { isMapboxConfigured } from '@/lib/map/mapbox-loader';
import { MapPlaceholder } from '@/components/map/map-placeholder';
import { MapBottomSheet } from '@/components/map/map-bottom-sheet';
import { searchWahlkreise } from '@/lib/data/wahlkreise';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';

// Lazy load heavy map components
const BaseMap = lazy(() =>
  import('@/components/map/base-map').then((m) => ({ default: m.BaseMap })),
);
const WahlkreisLayer = lazy(() =>
  import('@/components/map/wahlkreis-layer').then((m) => ({ default: m.WahlkreisLayer })),
);
const WahlkreisTooltip = lazy(() =>
  import('@/components/map/wahlkreis-tooltip').then((m) => ({ default: m.WahlkreisTooltip })),
);

function MapSkeleton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * Phase 164 — Karte Tab (Complete Assembly)
 *
 * Full /karte (mapped to /map) page with:
 * - Search bar
 * - Mapbox map with choropleth layer (lazy loaded)
 * - Bottom sheet wahlkreis dashboard
 * - Keyboard navigation support
 * - Graceful fallback when Mapbox not configured
 */
export default function MapPage() {
  const { profile } = useAuth();
  const [mapInstance, setMapInstance] = useState<unknown>(null);
  const [selectedWahlkreis, setSelectedWahlkreis] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string }>>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const userWahlkreisId = profile?.wahlkreis_id ?? null;

  // Stats for the bottom bar
  const { data: allStats } = trpc.map.allStats.useQuery(undefined, {
    staleTime: 600_000,
  });

  const totalWahlkreise = allStats?.length ?? 299;
  const totalActiveUsers = allStats
    ? allStats.reduce((sum, s) => sum + s.active_users_week, 0)
    : 0;

  const handleMapReady = useCallback((map: unknown) => {
    setMapInstance(map);
  }, []);

  const handleWahlkreisClick = useCallback((_wahlkreisId: number, _name: string) => {
    setSelectedWahlkreis(_wahlkreisId);
    setSheetOpen(true);
  }, []);

  // Debounced async search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const results = await searchWahlkreise(searchQuery);
        if (!cancelled) {
          setSearchResults(results.slice(0, 5));
          setShowSearchResults(true);
        }
      } catch {
        // Silently handle search errors
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearchSelect = useCallback((wahlkreisId: number) => {
    setSelectedWahlkreis(wahlkreisId);
    setSheetOpen(true);
    setShowSearchResults(false);
    setSearchQuery('');
  }, []);

  const showMapbox = isMapboxConfigured();

  return (
    <div className="relative flex h-[calc(100dvh-7rem)] flex-col">
      {/* Search bar */}
      <div className="absolute inset-x-4 top-4 z-20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Wahlkreis suchen..."
            className="bg-background/95 pl-9 shadow-md backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            aria-label="Wahlkreis suchen"
            role="combobox"
            aria-expanded={showSearchResults}
          />

          {/* Search results dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute inset-x-0 top-full mt-1 rounded-lg border bg-card shadow-lg">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearchSelect(result.id);
                  }}
                >
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="flex-1 font-medium">{result.name}</span>
                  <span className="text-xs text-muted-foreground">WK {result.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      {showMapbox ? (
        <Suspense fallback={<MapSkeleton />}>
          <BaseMap onMapReady={handleMapReady} className="flex-1">
            {mapInstance ? (
              <>
                <WahlkreisLayer
                  map={mapInstance}
                  highlightWahlkreisId={userWahlkreisId ?? undefined}
                  onWahlkreisClick={handleWahlkreisClick}
                />
                <WahlkreisTooltip map={mapInstance} />
              </>
            ) : null}
          </BaseMap>
        </Suspense>
      ) : (
        <MapPlaceholder />
      )}

      {/* My Wahlkreis FAB */}
      {userWahlkreisId && (
        <Button
          size="sm"
          className="absolute bottom-20 right-4 z-20 shadow-lg"
          onClick={() => {
            setSelectedWahlkreis(userWahlkreisId);
            setSheetOpen(true);
          }}
        >
          <MapPin className="size-4" />
          Mein Wahlkreis
        </Button>
      )}

      {/* Stats bar at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 border-t bg-background/90 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart3 className="size-3.5" />
            {totalWahlkreise} Wahlkreise
          </span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {totalActiveUsers.toLocaleString('de-DE')} aktive Bürger
          </span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <MapBottomSheet
        wahlkreisId={selectedWahlkreis}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
