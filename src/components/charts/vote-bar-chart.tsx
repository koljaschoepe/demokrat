'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  VOTE_CHART_COLORS,
  VOTE_LABELS,
  formatPercent,
  formatCount,
} from '@/lib/charts/theme';

interface VoteBarChartProps {
  breakdown: Array<{ choice: string; count: number; percentage: number }>;
  totalVotes: number;
  className?: string;
}

interface TooltipPayloadEntry {
  name?: string;
  value?: number;
  payload?: {
    choice: string;
    label: string;
    count: number;
    percentage: number;
  };
}

function CustomTooltip({
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
      <p className="text-muted-foreground">
        {formatCount(data.count)} Stimmen ({formatPercent(data.percentage)})
      </p>
    </div>
  );
}

/**
 * Horizontal bar chart showing vote breakdown by choice.
 * Colors use Indigo + gray shades only (accessible).
 */
export function VoteBarChart({
  breakdown,
  totalVotes,
  className,
}: VoteBarChartProps) {
  const chartData = breakdown.map((entry) => ({
    ...entry,
    label: VOTE_LABELS[entry.choice] ?? entry.choice,
    fill: VOTE_CHART_COLORS[entry.choice] ?? '#6366f1',
  }));

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 60)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 60, bottom: 4, left: 80 }}
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
            dataKey="label"
            width={70}
            tick={{ fontSize: 13, fill: 'currentColor' }}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar
            dataKey="percentage"
            radius={[0, 4, 4, 0]}
            maxBarSize={32}
            aria-label="Stimmenverteilung"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
              />
            ))}
            <LabelList
              dataKey="percentage"
              position="insideRight"
              formatter={(v) => (typeof v === 'number' ? formatPercent(v) : String(v ?? ''))}
              className="fill-white text-xs font-medium"
            />
            <LabelList
              dataKey="count"
              position="right"
              formatter={(v) => (typeof v === 'number' ? formatCount(v) : String(v ?? ''))}
              className="fill-current text-xs text-muted-foreground"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Gesamt: {formatCount(totalVotes)} Stimmen
      </p>
    </div>
  );
}
