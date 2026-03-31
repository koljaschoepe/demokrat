'use client';

import { useState, useEffect } from 'react';
import { Vote, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type VoteChoice = 'ja' | 'nein' | 'enthaltung' | null;

interface StepVoteProps {
  topicId?: string;
  topicTitle?: string;
  onComplete?: (choice: string) => void;
}

const MOCK_VOTE = {
  topicTitle: 'Digitalpakt 2.0 für Schulen',
  description:
    'Soll der Bund 5 Milliarden Euro in die digitale Ausstattung von Schulen investieren? Der Entwurf sieht vor, dass jede Schule bis 2029 mit modernen Endgeräten und WLAN ausgestattet wird.',
};

export function StepVote({ topicId, topicTitle, onComplete }: StepVoteProps) {
  const [vote, setVote] = useState<VoteChoice>(null);
  const hasVoted = vote !== null;
  const displayTitle = topicTitle ?? MOCK_VOTE.topicTitle;

  useEffect(() => {
    if (vote && onComplete) {
      onComplete(vote);
    }
    // Only fire once when user votes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vote]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4">
      <div className="flex items-center gap-2">
        <Vote className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Deine Stimme</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{displayTitle}</CardTitle>
          <CardDescription>
            {MOCK_VOTE.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Bildung</Badge>
            <Badge variant="outline">Digitalisierung</Badge>
          </div>
        </CardContent>
      </Card>

      {!hasVoted ? (
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="h-12 w-full text-base"
            onClick={() => setVote('ja')}
          >
            Ja, dafür
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-full text-base"
            onClick={() => setVote('nein')}
          >
            Nein, dagegen
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-12 w-full text-base"
            onClick={() => setVote('enthaltung')}
          >
            Enthaltung
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            'flex flex-col items-center gap-3 rounded-lg bg-primary/5 p-6 text-center',
            'motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95',
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" />
          </div>
          <p className="font-medium">
            Du hast mit{' '}
            <strong>
              {vote === 'ja' ? 'Ja' : vote === 'nein' ? 'Nein' : 'Enthaltung'}
            </strong>{' '}
            gestimmt
          </p>
          <p className="text-sm text-muted-foreground">
            Deine Stimme wurde gezählt. Ergebnisse siehst du nach der Abstimmung.
          </p>
          <Badge variant="secondary">+20 Punkte</Badge>
        </div>
      )}
    </div>
  );
}
