'use client';

import { useState } from 'react';
import { Eye, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ArgumentCardProps {
  type: 'pro' | 'contra';
  author: string;
  text: string;
}

function ArgumentCard({ type, author, text }: ArgumentCardProps) {
  const [reaction, setReaction] = useState<'up' | 'down' | null>(null);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div
            className={cn(
              'flex size-7 items-center justify-center rounded-full',
              type === 'pro'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30',
            )}
          >
            <User className="size-3.5 text-muted-foreground" />
          </div>
          <span>{author}</span>
          <span
            className={cn(
              'ml-auto text-xs font-normal',
              type === 'pro'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            )}
          >
            {type === 'pro' ? 'Dafür' : 'Dagegen'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{text}</p>
        <div className="mt-3 flex gap-1">
          <Button
            variant={reaction === 'up' ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => setReaction(reaction === 'up' ? null : 'up')}
            aria-label="Zustimmen"
          >
            <ThumbsUp className="size-3.5" />
          </Button>
          <Button
            variant={reaction === 'down' ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => setReaction(reaction === 'down' ? null : 'down')}
            aria-label="Ablehnen"
          >
            <ThumbsDown className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const MOCK_ARGUMENTS: ArgumentCardProps[] = [
  {
    type: 'pro',
    author: 'Anna M., Lehrerin',
    text: 'Als Lehrerin sehe ich täglich, wie dringend wir digitale Infrastruktur brauchen. Meine Schüler müssen sich Tablets teilen, während andere Länder längst 1:1-Ausstattung haben.',
  },
  {
    type: 'contra',
    author: 'Thomas K., Elternbeirat',
    text: 'Mehr Geld allein löst das Problem nicht. Wir brauchen zuerst ein pädagogisches Konzept und Lehrerfortbildungen. Der erste Digitalpakt hat gezeigt, dass Technik ohne Strategie verstaubt.',
  },
];

export function StepPerspective() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4">
      <div className="flex items-center gap-2">
        <Eye className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Perspektivenwechsel</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Andere Bürger sehen das so:
      </p>

      <div className="flex flex-col gap-3">
        {MOCK_ARGUMENTS.map((arg, i) => (
          <ArgumentCard key={i} {...arg} />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Es gibt immer mehr als eine Perspektive. Gute Demokratie lebt vom Zuhören.
      </p>
    </div>
  );
}
