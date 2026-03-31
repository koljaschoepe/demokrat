'use client';

import { BookOpen, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepBriefingProps {
  briefing?: string;
  topicTitle?: string;
  onComplete?: () => void;
}

const MOCK_BRIEFING = {
  topicTitle: 'Digitale Bildung an Schulen',
  briefing:
    'Sollte der Bund mehr in die digitale Ausstattung von Schulen investieren? Ein neuer Gesetzentwurf sieht 5 Milliarden Euro bis 2029 vor.',
  bulletPoints: [
    'Debatte zum Haushaltsentwurf 2027 mit Schwerpunkt Bildung und Digitalisierung',
    'Anhörung im Gesundheitsausschuss zur Krankenhausreform',
    'Abstimmung zum Klimaanpassungsgesetz im Plenum erwartet',
  ],
};

export function StepBriefing({
  briefing,
  topicTitle,
  onComplete,
}: StepBriefingProps) {
  const displayTitle = topicTitle ?? MOCK_BRIEFING.topicTitle;
  const displayBriefing = briefing ?? MOCK_BRIEFING.briefing;

  return (
    <div className="flex flex-1 flex-col gap-4 px-4">
      <div className="flex items-center gap-2">
        <BookOpen className="size-5 text-primary" />
        <h2 className="text-lg font-bold">Tagesbriefing</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" />
            Heute im Bundestag
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {MOCK_BRIEFING.bulletPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {point}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        <Users className="size-4 shrink-0" />
        <span>Seit gestern: <strong className="text-foreground">1.234</strong> neue Stimmen abgegeben</span>
      </div>

      <Card className={cn('border-primary/20 bg-primary/5')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Thema des Tages</CardTitle>
            <Badge variant="secondary">Neu</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium">{displayTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayBriefing}
          </p>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Lesezeit: ca. 1 Minute
      </p>
    </div>
  );
}
