import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/routers/_app';
import { createContext } from '@/server/context';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoteBadge } from '@/components/bundestag/vote-badge';
import { User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const createCaller = createCallerFactory(appRouter);

// Fraktionsfarben für den Header-Badge
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
  for (const [key, value] of Object.entries(FRAKTION_COLORS)) {
    if (fraktion.includes(key) || key.includes(fraktion)) return value;
  }
  return 'bg-gray-500 text-white';
}

// Stimmen-Label für das Voting-Highlight
const VOTE_LABELS: Record<string, string> = {
  ja: 'Ja',
  nein: 'Nein',
  enthaltung: 'Enthaltung',
  nicht_abgegeben: 'Nicht abgegeben',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const ctx = await createContext();
    const caller = createCaller(ctx);
    const mdb = await caller.bundestag.mdb({ id });
    return {
      title: `${mdb.name} – Demokrat`,
      description: `Profil und Abstimmungsverhalten von ${mdb.name}${mdb.fraktion ? ` (${mdb.fraktion})` : ''}`,
    };
  } catch {
    return {
      title: 'Abgeordneter – Demokrat',
    };
  }
}

export default async function AbgeordneterPage({ params }: PageProps) {
  const { id } = await params;

  let mdb;
  try {
    const ctx = await createContext();
    const caller = createCaller(ctx);
    mdb = await caller.bundestag.mdb({ id });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
      {/* Profil-Header */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* Foto oder Platzhalter */}
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted sm:size-28">
          {mdb.fotoUrl ? (
            <img
              src={mdb.fotoUrl}
              alt={mdb.name}
              className="size-full object-cover"
            />
          ) : (
            <User className="size-10 text-muted-foreground" />
          )}
        </div>

        {/* Informationen */}
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <h1 className="text-2xl font-bold">{mdb.name}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {mdb.fraktion && (
              <Badge
                variant="default"
                className={cn(
                  'border-transparent text-sm',
                  getFraktionColor(mdb.fraktion),
                )}
              >
                {mdb.fraktion}
              </Badge>
            )}
          </div>
          {mdb.wahlkreisName && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              <span>
                Wahlkreis {mdb.wahlkreisId}: {mdb.wahlkreisName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Abstimmungshistorie */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Abstimmungsverhalten</h2>

        {mdb.votes.length === 0 ? (
          <Card>
            <CardContent>
              <p className="py-4 text-center text-sm text-muted-foreground">
                Noch keine Abstimmungsdaten vorhanden.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {mdb.votes.map((v) => (
              <Card key={v.id} size="sm">
                <CardHeader>
                  <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="line-clamp-2 text-sm">
                      {v.abstimmung?.titel ?? 'Unbekannte Abstimmung'}
                    </span>
                    <VoteBadge vote={v.vote} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Ihr Abgeordneter hat{' '}
                      <span
                        className={cn(
                          'font-semibold',
                          v.vote === 'ja' && 'text-green-600 dark:text-green-400',
                          v.vote === 'nein' && 'text-red-600 dark:text-red-400',
                          v.vote === 'enthaltung' && 'text-amber-600 dark:text-amber-400',
                          v.vote === 'nicht_abgegeben' && 'text-gray-500',
                        )}
                      >
                        {VOTE_LABELS[v.vote]}
                      </span>{' '}
                      gestimmt
                    </p>
                    {v.abstimmung?.datum && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.abstimmung.datum).toLocaleDateString(
                          'de-DE',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
