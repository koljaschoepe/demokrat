'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MdbCardProps {
  mdb: {
    id: string;
    name: string;
    fraktion: string | null;
    wahlkreis_name: string | null;
    foto_url: string | null;
  };
  className?: string;
}

/**
 * Fraktionsfarben für die Partei-Badges
 */
const FRAKTION_COLORS: Record<string, string> = {
  SPD: 'bg-red-600 text-white',
  'CDU/CSU': 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900',
  'BÜNDNIS 90/DIE GRÜNEN': 'bg-green-600 text-white',
  FDP: 'bg-yellow-400 text-yellow-900',
  AfD: 'bg-blue-600 text-white',
  'DIE LINKE': 'bg-purple-600 text-white',
  BSW: 'bg-orange-600 text-white',
  Fraktionslos: 'bg-gray-400 text-white',
};

function getFraktionColor(fraktion: string | null): string {
  if (!fraktion) return FRAKTION_COLORS.Fraktionslos ?? 'bg-gray-400 text-white';
  // Exakte Übereinstimmung oder Teilstring-Match
  for (const [key, value] of Object.entries(FRAKTION_COLORS)) {
    if (fraktion.includes(key) || key.includes(fraktion)) return value;
  }
  return 'bg-gray-500 text-white';
}

export function MdbCard({ mdb, className }: MdbCardProps) {
  return (
    <Link href={`/abgeordnete/${mdb.id}`}>
      <Card
        size="sm"
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-md',
          className,
        )}
      >
        <CardContent className="flex items-center gap-3">
          {/* Foto oder Platzhalter-Avatar */}
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {mdb.foto_url ? (
              <img
                src={mdb.foto_url}
                alt={mdb.name}
                className="size-full object-cover"
              />
            ) : (
              <User className="size-6 text-muted-foreground" />
            )}
          </div>

          {/* Name, Fraktion, Wahlkreis */}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{mdb.name}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {mdb.fraktion && (
                <Badge
                  variant="default"
                  className={cn(
                    'border-transparent text-[0.65rem]',
                    getFraktionColor(mdb.fraktion),
                  )}
                >
                  {mdb.fraktion}
                </Badge>
              )}
              {mdb.wahlkreis_name && (
                <span className="truncate text-xs text-muted-foreground">
                  {mdb.wahlkreis_name}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
