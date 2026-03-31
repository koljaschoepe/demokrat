'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  VOTE_CHART_COLORS,
  VOTE_LABELS,
  formatPercent,
  formatCount,
} from '@/lib/charts/theme';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface VoteDonutChartProps {
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

interface LegendEntry {
  value: string;
  color?: string;
}

function CustomLegend({ payload }: { payload?: LegendEntry[] }) {
  if (!payload) return null;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-4">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-sm">
          <span
            className="inline-block h-3 w-3 rounded-sm"
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
 * Donut chart showing vote distribution.
 * Center displays the total vote count with animation.
 */
export function VoteDonutChart({
  breakdown,
  totalVotes,
  className,
}: VoteDonutChartProps) {
  const chartData = breakdown.map((entry) => ({
    ...entry,
    label: VOTE_LABELS[entry.choice] ?? entry.choice,
    name: VOTE_LABELS[entry.choice] ?? entry.choice,
    fill: VOTE_CHART_COLORS[entry.choice] ?? '#6366f1',
  }));

  return (
    <div className={cn('relative w-full', className)}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            dataKey="percentage"
            nameKey="name"
            strokeWidth={2}
            stroke="transparent"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center" style={{ marginBottom: '40px' }}>
        <AnimatedCounter
          value={totalVotes}
          className="text-2xl font-bold text-foreground"
        />
        <span className="text-xs text-muted-foreground">Stimmen</span>
      </div>
    </div>
  );
}
