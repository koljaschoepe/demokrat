'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrendingTopic {
  id: string;
  title: string;
  source: 'BUNDESTAG' | 'BUERGER';
  voteCount: number;
}

interface TrendingSidebarProps {
  topics?: TrendingTopic[];
  className?: string;
}

const MOCK_TRENDING: TrendingTopic[] = [
  {
    id: 'trending-1',
    title: 'Erneuerbare Energien Ausbau beschleunigen',
    source: 'BUNDESTAG',
    voteCount: 12847,
  },
  {
    id: 'trending-2',
    title: 'Deutschlandticket Preisanpassung 2026',
    source: 'BUNDESTAG',
    voteCount: 9231,
  },
  {
    id: 'trending-3',
    title: 'Digitale Verwaltung für alle Kommunen',
    source: 'BUERGER',
    voteCount: 7654,
  },
  {
    id: 'trending-4',
    title: 'Mietpreisbremse verlängern',
    source: 'BUNDESTAG',
    voteCount: 6102,
  },
  {
    id: 'trending-5',
    title: 'Kostenlose Schulverpflegung bundesweit',
    source: 'BUERGER',
    voteCount: 4890,
  },
];

function formatVoteCount(n: number): string {
  if (n >= 10_000) {
    return `${(n / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return n.toLocaleString('de-DE');
}

export function TrendingSidebar({
  topics,
  className,
}: TrendingSidebarProps) {
  const items = topics ?? MOCK_TRENDING;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <TrendingUp className="size-4 text-indigo-600" />
        <h2 className="text-sm font-semibold">Trending</h2>
      </div>
      <CardContent className="p-0">
        <ul className="divide-y">
          {items.slice(0, 5).map((topic, index) => (
            <li key={topic.id}>
              <Link
                href={`/themen/${topic.id}`}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700"
                  aria-label={`Rang ${index + 1}`}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {topic.title}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant={
                        topic.source === 'BUNDESTAG' ? 'secondary' : 'default'
                      }
                      className="text-[10px] px-1.5 py-0"
                    >
                      {topic.source === 'BUNDESTAG' ? 'BUNDESTAG' : 'B\u00dcRGER'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatVoteCount(topic.voteCount)} Stimmen
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
