'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

interface CivicHexagonProps {
  data?: Array<{ attribute: string; value: number }>;
  unlocked?: boolean; // false zeigt "Ab 10 Abstimmungen verfügbar" Overlay
  voteCount?: number;
}

// ---------------------------------------------------------------------------
// Mock-Daten
// ---------------------------------------------------------------------------

const MOCK_DATA = [
  { attribute: 'Beteiligung', value: 75 },
  { attribute: 'Wissen', value: 60 },
  { attribute: 'Diskussion', value: 45 },
  { attribute: 'Konsistenz', value: 85 },
  { attribute: 'Vielfalt', value: 55 },
  { attribute: 'Einfluss', value: 30 },
];

// ---------------------------------------------------------------------------
// Attribut-Beschreibungen für Tooltips
// ---------------------------------------------------------------------------

const ATTRIBUTE_DESCRIPTIONS: Record<string, string> = {
  Beteiligung: 'Wie regelmäßig du abstimmst und Sessions abschließt',
  Wissen: 'Dein Ergebnis bei Quiz-Fragen und Lernfortschritt',
  Diskussion: 'Qualität und Häufigkeit deiner Kommentare',
  Konsistenz: 'Wie konsequent du über die Zeit aktiv bleibst',
  Vielfalt: 'In wie vielen verschiedenen Kategorien du aktiv bist',
  Einfluss: 'Wie sehr deine Beiträge andere erreichen',
};

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { attribute: string; value: number } }> }) {
  if (!active || !payload?.[0]) return null;

  const { attribute, value } = payload[0].payload;
  const description = ATTRIBUTE_DESCRIPTIONS[attribute] ?? '';

  return (
    <div className="rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-md">
      <p className="font-medium">{attribute}: {value}/100</p>
      {description && (
        <p className="mt-0.5 text-background/70">{description}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------

export function CivicHexagon({
  data,
  unlocked,
  voteCount,
}: CivicHexagonProps = {}) {
  const chartData = data ?? MOCK_DATA;

  // Unlock-Logik: wenn unlocked nicht gesetzt, auto-detect via voteCount
  const isUnlocked = unlocked ?? (voteCount != null ? voteCount >= 10 : true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Civic Character Sheet</CardTitle>
        <CardDescription>
          Dein demokratisches Profil auf einen Blick
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full">
          {/* Chart */}
          <div
            className={cn(
              'h-full w-full transition-all',
              !isUnlocked && 'blur-sm',
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="attribute"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Werte"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                {isUnlocked && (
                  <RechartsTooltip content={<CustomTooltip />} />
                )}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Lock-Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-card/60">
              <Lock className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">
                Ab 10 Abstimmungen verfügbar
              </p>
              {voteCount != null && (
                <div className="mt-1 space-y-1">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (voteCount / 10) * 100)}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {voteCount}/10 Abstimmungen
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
