'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  VOTE_CHART_COLORS,
  VOTE_LABELS,
  FACTION_COLORS,
  formatPercent,
  formatCount,
} from '@/lib/charts/theme';

interface FactionEntry {
  fraktion: string;
  ja: number;
  nein: number;
  enthaltung: number;
  nicht_abgegeben: number;
  total: number;
}

interface FactionBreakdownProps {
  factions: FactionEntry[];
  className?: string;
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  dataKey?: string;
  color?: string;
}

interface FactionTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: FactionTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-card-foreground">{label}</p>
      {payload.map((entry) => {
        const key = entry.dataKey ?? '';
        return (
          <div key={key} className="flex items-center gap-2 text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span>
              {VOTE_LABELS[key] ?? key}: {formatPercent(entry.value ?? 0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface LegendPayloadEntry {
  value: string;
  color?: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadEntry[] }) {
  if (!payload) return null;

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Custom Y-axis tick that renders the faction name in its party color.
 */
function FactionTick(props: Record<string, unknown>) {
  const x = typeof props.x === 'number' ? props.x : Number(props.x ?? 0);
  const y = typeof props.y === 'number' ? props.y : Number(props.y ?? 0);
  const payload = props.payload as { value?: string } | undefined;
  const name = payload?.value ?? '';
  const color = FACTION_COLORS[name] ?? '#6b7280';

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-4}
        y={0}
        dy={4}
        textAnchor="end"
        fontSize={12}
        fill={color}
        fontWeight={500}
      >
        {name}
      </text>
    </g>
  );
}

/**
 * Stacked horizontal bar chart showing vote breakdown per faction.
 * Faction names colored with their party color.
 * Bars use indigo shades for vote choices.
 */
export function FactionBreakdown({
  factions,
  className,
}: FactionBreakdownProps) {
  // Convert absolute counts to percentages for stacked chart
  const chartData = factions.map((faction) => {
    const total = faction.total || 1;
    return {
      fraktion: faction.fraktion,
      total: faction.total,
      jaPercent: Math.round((faction.ja / total) * 100),
      neinPercent: Math.round((faction.nein / total) * 100),
      enthaltungPercent: Math.round((faction.enthaltung / total) * 100),
      nichtAbgegebenPercent: Math.round(
        (faction.nicht_abgegeben / total) * 100,
      ),
    };
  });

  const barHeight = 36;
  const chartHeight = Math.max(250, chartData.length * (barHeight + 16) + 60);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 20, bottom: 4, left: 90 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v: number) => formatPercent(v)}
            className="text-xs"
            stroke="currentColor"
            opacity={0.5}
          />
          <YAxis
            type="category"
            dataKey="fraktion"
            width={80}
            tick={(props) => FactionTick(props as Record<string, unknown>)}
            stroke="transparent"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Legend
            content={() => (
              <CustomLegend
                payload={[
                  { value: VOTE_LABELS.ja ?? 'Ja', color: VOTE_CHART_COLORS.ja ?? '#4f46e5' },
                  { value: VOTE_LABELS.nein ?? 'Nein', color: VOTE_CHART_COLORS.nein ?? '#9ca3af' },
                  {
                    value: VOTE_LABELS.enthaltung ?? 'Enthaltung',
                    color: VOTE_CHART_COLORS.enthaltung ?? '#d1d5db',
                  },
                  {
                    value: VOTE_LABELS.nicht_abgegeben ?? 'Nicht abgegeben',
                    color: VOTE_CHART_COLORS.nicht_abgegeben ?? '#e5e7eb',
                  },
                ]}
              />
            )}
          />
          <Bar
            dataKey="jaPercent"
            name={VOTE_LABELS.ja}
            stackId="votes"
            fill={VOTE_CHART_COLORS.ja}
            maxBarSize={barHeight}
          />
          <Bar
            dataKey="neinPercent"
            name={VOTE_LABELS.nein}
            stackId="votes"
            fill={VOTE_CHART_COLORS.nein}
            maxBarSize={barHeight}
          />
          <Bar
            dataKey="enthaltungPercent"
            name={VOTE_LABELS.enthaltung}
            stackId="votes"
            fill={VOTE_CHART_COLORS.enthaltung}
            maxBarSize={barHeight}
          />
          <Bar
            dataKey="nichtAbgegebenPercent"
            name={VOTE_LABELS.nicht_abgegeben}
            stackId="votes"
            fill={VOTE_CHART_COLORS.nicht_abgegeben}
            maxBarSize={barHeight}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Faction member counts as supplementary info */}
      <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
        {factions.map((f) => (
          <span key={f.fraktion}>
            {f.fraktion}: {formatCount(f.total)} MdB
          </span>
        ))}
      </div>
    </div>
  );
}
