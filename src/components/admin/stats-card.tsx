import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            {change && (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  changeType === 'positive' && 'text-emerald-600 dark:text-emerald-400',
                  changeType === 'negative' && 'text-red-600 dark:text-red-400',
                  changeType === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="size-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
