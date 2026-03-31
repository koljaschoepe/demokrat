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
import { formatCount } from '@/lib/charts/theme';

interface WahlkreisComparisonProps {
  data: Array<{
    name: string;
    value: number;
    isHighlighted?: boolean;
  }>;
  className?: string;
  valueLabel?: string;
}

interface TooltipPayload {
  payload?: {
    name: string;
    value: number;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.name}</p>
      <p className="text-muted-foreground">{formatCount(data.value)}</p>
    </div>
  );
}

/**
 * Phase 159 — Wahlkreis Comparison Chart
 *
 * Vertical bar chart for comparing values across wahlkreise.
 * Highlighted bar (user's own) uses indigo-600, others use indigo-300.
 */
export function WahlkreisComparison({
  data,
  className,
}: WahlkreisComparisonProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, bottom: 4, left: 100 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isHighlighted ? '#4f46e5' : '#a5b4fc'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
