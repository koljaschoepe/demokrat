import { Vote, Flame, PlusCircle, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col items-center gap-1 pt-3 text-center">
        <div className="text-muted-foreground">{icon}</div>
        <span className="text-2xl font-bold tabular-nums">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

const STATS: StatCardProps[] = [
  {
    icon: <Vote className="size-5" />,
    value: '127',
    label: 'Stimmen',
  },
  {
    icon: <Flame className="size-5" />,
    value: '14',
    label: 'Tage Streak',
  },
  {
    icon: <PlusCircle className="size-5" />,
    value: '3',
    label: 'Themen',
  },
  {
    icon: <MessageCircle className="size-5" />,
    value: '42',
    label: 'Kommentare',
  },
];

export function ImpactStats() {
  return (
    <div className={cn('grid grid-cols-2 gap-3')}>
      {STATS.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
