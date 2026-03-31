'use client';

import Link from 'next/link';
import { MapPin, Search, Users, Vote, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function MapPlaceholder() {
  return (
    <div
      className={cn(
        'relative flex flex-1 flex-col items-center justify-center overflow-hidden',
        'bg-gradient-to-b from-blue-50 to-indigo-50',
        'dark:from-gray-900 dark:to-indigo-950',
      )}
    >
      {/* Search bar */}
      <div className="absolute inset-x-4 top-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Wahlkreis suchen..."
            className="pl-9"
            readOnly
          />
        </div>
      </div>

      {/* Germany outline SVG placeholder */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg
            viewBox="0 0 200 260"
            className="size-48 text-primary/20"
            fill="currentColor"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M95 10 L110 8 L125 15 L130 25 L140 30 L150 28 L160 35 L165 50 L170 65 L175 75 L180 85 L178 95 L172 105 L168 115 L175 125 L180 135 L178 145 L170 155 L165 165 L160 175 L155 185 L145 190 L135 195 L130 205 L125 215 L118 225 L110 230 L100 235 L90 232 L80 225 L72 218 L65 210 L60 200 L55 190 L50 180 L45 170 L40 160 L38 150 L35 140 L30 130 L28 120 L30 110 L35 100 L40 90 L45 80 L50 70 L55 60 L60 50 L65 40 L72 30 L80 22 L88 15 Z" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="size-8 text-primary motion-safe:animate-bounce" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-lg font-bold">Demokratie-Karte</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Die interaktive Wahlkreiskarte wird in einer kommenden Version verfügbar.
          </p>
        </div>

        <Button size="lg" render={<Link href="/profile/settings" />}>
          <MapPin className="size-4" />
          Mein Wahlkreis
        </Button>
      </div>

      {/* Stats bar at bottom */}
      <div className="absolute inset-x-0 bottom-0 border-t bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart3 className="size-3.5" />
            299 Wahlkreise
          </span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            2.847 aktive Bürger
          </span>
          <span className="size-1 rounded-full bg-muted-foreground/40" />
          <span className="flex items-center gap-1">
            <Vote className="size-3.5" />
            1.234 Abstimmungen heute
          </span>
        </div>
      </div>
    </div>
  );
}
