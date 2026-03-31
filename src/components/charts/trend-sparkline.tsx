'use client';

import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface TrendSparklineProps {
  /** Array of values to plot */
  data: number[];
  /** Line color */
  color?: string;
  /** Chart height */
  height?: number;
  className?: string;
}

/**
 * Phase 159 — Trend Sparkline
 *
 * Minimal inline line chart for showing trends.
 * No axes, no labels — just the line.
 */
export function TrendSparkline({
  data,
  color = '#4f46e5',
  height = 32,
  className,
}: TrendSparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={[minValue * 0.9, maxValue * 1.1]} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
