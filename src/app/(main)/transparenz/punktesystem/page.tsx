import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Star, Trophy, Flame, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  POINT_VALUES,
  SITZUNGSWOCHE_MULTIPLIER,
} from '@/lib/constants/gamification';
import { PRIVILEGE_TIERS } from '@/lib/auth/types';

export const metadata: Metadata = {
  title: 'Punktesystem -- Transparenz',
  description:
    'So funktioniert das Punktesystem bei Demokrat: Alle Aktionen, Punktwerte, Privilegstufen und Streak-Meilensteine transparent erklärt.',
};

// Human-readable labels for point actions
const ACTION_LABELS: Record<string, { label: string; category: string }> = {
  SESSION_BRIEFING: {
    label: 'Tagesbriefing lesen',
    category: 'Tägliche Sitzung',
  },
  SESSION_QUIZ_CORRECT: {
    label: 'Quiz richtig beantwortet',
    category: 'Tägliche Sitzung',
  },
  SESSION_QUIZ_WRONG: {
    label: 'Quiz falsch (Teilnahme-Bonus)',
    category: 'Tägliche Sitzung',
  },
  SESSION_VOTE: {
    label: 'Abstimmung in Sitzung',
    category: 'Tägliche Sitzung',
  },
  SESSION_PERSPECTIVE: {
    label: 'Perspektiven gelesen',
    category: 'Tägliche Sitzung',
  },
  SESSION_COMPLETE: {
    label: 'Alle 5 Schritte abgeschlossen (Bonus)',
    category: 'Tägliche Sitzung',
  },
  VOTE_CAST: { label: 'Stimme abgeben', category: 'Abstimmungen' },
  VOTE_FIRST_TOPIC: {
    label: 'Erste Stimme in neuer Kategorie',
    category: 'Abstimmungen',
  },
  COMMENT_CREATE: { label: 'Kommentar verfassen', category: 'Diskussionen' },
  COMMENT_HIGH_BRIDGING: {
    label: 'Hoher Bridging-Score (>0.7)',
    category: 'Diskussionen',
  },
  COMMENT_RATE: { label: 'Kommentar bewerten', category: 'Diskussionen' },
  TOPIC_CREATE: {
    label: 'Bürger-Thema erstellen',
    category: 'Community',
  },
  TOPIC_SUPPORT: { label: 'Thema unterstützen', category: 'Community' },
  REPORT_VALID: {
    label: 'Gültige Meldung (bestätigt)',
    category: 'Community',
  },
  STREAK_7: { label: '7-Tage-Streak', category: 'Streak-Meilensteine' },
  STREAK_30: { label: '30-Tage-Streak', category: 'Streak-Meilensteine' },
  STREAK_100: { label: '100-Tage-Streak', category: 'Streak-Meilensteine' },
  STREAK_365: { label: '365-Tage-Streak', category: 'Streak-Meilensteine' },
};

// Group actions by category
function groupByCategory() {
  const groups: Record<string, Array<{ key: string; label: string; points: number }>> = {};
  for (const [key, points] of Object.entries(POINT_VALUES)) {
    const meta = ACTION_LABELS[key];
    if (!meta) continue;
    if (!groups[meta.category]) groups[meta.category] = [];
    groups[meta.category]!.push({ key, label: meta.label, points });
  }
  return groups;
}

const TIER_PERMISSIONS: Record<number, string[]> = {
  0: ['Feed lesen', 'Abstimmen'],
  1: ['Kommentieren', 'Kommentare bewerten'],
  2: ['Bürger-Themen erstellen', 'Themen unterstützen'],
  3: ['Inhalte moderieren', 'Meldungen bearbeiten'],
  4: ['Community-Entscheidungen', 'Erweiterte Moderation'],
};

export default function PunktesystemPage() {
  const grouped = groupByCategory();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/transparenz"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Zurück zur Transparenz-Übersicht
      </Link>

      {/* Header */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-green-100">
          <Star className="size-7 text-green-700" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          So funktioniert das Punktesystem
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Bei Demokrat sammelst du Punkte durch aktive Teilhabe. Je mehr du dich
          einbringst, desto mehr Möglichkeiten stehen dir offen. Hier ist alles
          transparent aufgeschlüsselt.
        </p>
      </section>

      {/* Section 1: Punkte sammeln */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">So sammelst du Punkte</h2>
        <div className="flex flex-col gap-4">
          {Object.entries(grouped).map(([category, actions]) => (
            <Card key={category}>
              <CardContent>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="divide-y">
                  {actions.map((action) => (
                    <div
                      key={action.key}
                      className="flex items-center justify-between py-2.5"
                    >
                      <span className="text-sm">{action.label}</span>
                      <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                        +{action.points} Pkt
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 2: Privilegstufen */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Trophy className="size-5 text-amber-600" />
          Privilegstufen
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Mit steigender Punktzahl erreichst du höhere Stufen. Jede Stufe
          schaltet neue Funktionen frei.
        </p>
        <div className="flex flex-col gap-3">
          {(Object.entries(PRIVILEGE_TIERS) as [string, { name: string; minPoints: number }][]).map(
            ([tier, data]) => {
              const tierNum = Number(tier);
              const permissions = TIER_PERMISSIONS[tierNum] ?? [];
              return (
                <Card key={tier}>
                  <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                        {tierNum}
                      </span>
                      <div>
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ab {data.minPoints.toLocaleString('de-DE')} Punkte
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                      {permissions.map((perm) => (
                        <span
                          key={perm}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      </section>

      {/* Section 3: Sitzungswoche Multiplikator */}
      <section className="mb-10">
        <Card className="border-purple-200/50 bg-purple-50/30">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Calendar className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Sitzungswoche-Multiplikator
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Während einer Sitzungswoche des Bundestags erhalten alle
                Aktionen einen{' '}
                <strong className="text-foreground">
                  {SITZUNGSWOCHE_MULTIPLIER}x Multiplikator
                </strong>
                . Das bedeutet: Jede Aktion bringt doppelt so viele Punkte. So
                belohnen wir besonderes Engagement in Zeiten aktiver
                parlamentarischer Arbeit.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Streak-Meilensteine */}
      <section className="mb-4">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Flame className="size-5 text-orange-500" />
          Streak-Meilensteine
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Besuche Demokrat an aufeinanderfolgenden Tagen, um Streak-Boni zu
          erhalten. Je länger dein Streak, desto größer die Belohnung.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              days: 7,
              points: POINT_VALUES.STREAK_7,
              label: '1 Woche',
              emoji: '7',
            },
            {
              days: 30,
              points: POINT_VALUES.STREAK_30,
              label: '1 Monat',
              emoji: '30',
            },
            {
              days: 100,
              points: POINT_VALUES.STREAK_100,
              label: '100 Tage',
              emoji: '100',
            },
            {
              days: 365,
              points: POINT_VALUES.STREAK_365,
              label: '1 Jahr',
              emoji: '365',
            },
          ].map((streak) => (
            <Card key={streak.days}>
              <CardContent className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-700">
                  {streak.emoji}
                </span>
                <div>
                  <p className="font-semibold">{streak.label} Streak</p>
                  <p className="text-sm text-muted-foreground">
                    +{streak.points.toLocaleString('de-DE')} Punkte
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
