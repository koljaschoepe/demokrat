'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  VOTE_CHART_COLORS,
  VOTE_LABELS,
  formatPercent,
  formatCount,
} from '@/lib/charts/theme';

interface ComparisonChartProps {
  citizens: { ja: number; nein: number; enthaltung: number; total: number };
  bundestag: {
    ja: number;
    nein: number;
    enthaltung: number;
    nicht_abgegeben: number;
    total: number;
  };
  delta: { ja: number; nein: number; enthaltung: number };
  className?: string;
}

type VoteChoice = 'ja' | 'nein' | 'enthaltung';

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  payload?: {
    choice: string;
    label: string;
    percentage: number;
  };
}

function SideTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-card-foreground">{data.label}</p>
      <p className="text-muted-foreground">{formatPercent(data.percentage)}</p>
    </div>
  );
}

function SideBarChart({
  data,
  label,
  total,
}: {
  data: Array<{ choice: string; label: string; percentage: number }>;
  label: string;
  total: number;
}) {
  return (
    <div className="flex-1">
      <h4 className="mb-2 text-center text-sm font-semibold text-foreground">
        {label}
      </h4>
      <ResponsiveContainer width="100%" height={data.length * 50 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, bottom: 0, left: 70 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="label"
            width={60}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip content={<SideTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={24}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={VOTE_CHART_COLORS[entry.choice] ?? '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Gesamt: {formatCount(total)}
      </p>
    </div>
  );
}

/**
 * Format a delta value as a signed percentage string.
 * Positive = citizens agree more, shown with darker indigo.
 */
function formatDelta(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatPercent(value)}`;
}

/**
 * Returns indigo intensity based on absolute delta.
 * Bigger difference = darker shade.
 */
function deltaColor(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 20) return 'text-indigo-700 dark:text-indigo-300';
  if (abs >= 10) return 'text-indigo-600 dark:text-indigo-400';
  if (abs >= 5) return 'text-indigo-500 dark:text-indigo-400';
  return 'text-gray-500 dark:text-gray-400';
}

const VOTE_CHOICES: VoteChoice[] = ['ja', 'nein', 'enthaltung'];

/**
 * Side-by-side comparison of citizen vs parliament votes.
 * Delta shown in center between columns.
 * Stacks vertically on mobile.
 */
export function ComparisonChart({
  citizens,
  bundestag,
  delta,
  className,
}: ComparisonChartProps) {
  const citizenData = VOTE_CHOICES.map((choice) => {
    const count = citizens[choice];
    const total = citizens.total || 1;
    return {
      choice,
      label: VOTE_LABELS[choice] ?? choice,
      percentage: Math.round((count / total) * 100),
    };
  });

  const bundestagData = VOTE_CHOICES.map((choice) => {
    const count = bundestag[choice];
    const total = bundestag.total || 1;
    return {
      choice,
      label: VOTE_LABELS[choice] ?? choice,
      percentage: Math.round((count / total) * 100),
    };
  });

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: side by side with delta in center */}
      <div className="hidden md:flex md:items-start md:gap-2">
        <SideBarChart
          data={citizenData}
          label="Bürger"
          total={citizens.total}
        />

        {/* Delta column */}
        <div className="flex flex-col items-center justify-center pt-10">
          <span className="mb-2 text-xs font-medium text-muted-foreground">
            Differenz
          </span>
          {VOTE_CHOICES.map((choice) => (
            <div
              key={choice}
              className="flex h-[50px] items-center justify-center"
            >
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums',
                  deltaColor(delta[choice]),
                )}
                aria-label={`Differenz ${VOTE_LABELS[choice]}: ${formatDelta(delta[choice])}`}
              >
                {formatDelta(delta[choice])}
              </span>
            </div>
          ))}
        </div>

        <SideBarChart
          data={bundestagData}
          label="Bundestag"
          total={bundestag.total}
        />
      </div>

      {/* Mobile: stacked vertically */}
      <div className="flex flex-col gap-6 md:hidden">
        <SideBarChart
          data={citizenData}
          label="Bürger"
          total={citizens.total}
        />

        {/* Delta row */}
        <div className="flex items-center justify-center gap-4">
          {VOTE_CHOICES.map((choice) => (
            <div key={choice} className="flex flex-col items-center gap-0.5">
              <span className="text-xs text-muted-foreground">
                {VOTE_LABELS[choice]}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  deltaColor(delta[choice]),
                )}
              >
                {formatDelta(delta[choice])}
              </span>
            </div>
          ))}
        </div>

        <SideBarChart
          data={bundestagData}
          label="Bundestag"
          total={bundestag.total}
        />
      </div>
    </div>
  );
}
