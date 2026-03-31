'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Tag, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CATEGORIES } from '@/lib/data/categories';
import { DAILY_GOALS } from '@/lib/data/daily-goals';
import { getWahlkreis } from '@/lib/data/wahlkreise';

interface StepPreviewProps {
  onComplete: () => void;
  onBack: () => void;
  wahlkreisId: number;
  categories: string[];
  dailyGoal: number;
}

export function StepPreview({
  onComplete,
  onBack,
  wahlkreisId,
  categories,
  dailyGoal,
}: StepPreviewProps) {
  const [wahlkreisName, setWahlkreisName] = useState<string>('');

  useEffect(() => {
    void getWahlkreis(wahlkreisId).then((wk) => {
      if (wk) {
        setWahlkreisName(`${wk.name} (WK ${wk.id})`);
      }
    });
  }, [wahlkreisId]);

  const selectedCategories = CATEGORIES.filter((c) =>
    categories.includes(c.id),
  );
  const selectedGoal = DAILY_GOALS.find((g) => g.value === dailyGoal);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="size-7 text-primary" />
        </div>
        <h2 className="text-xl font-heading font-semibold">
          Fertig! Dein erster Blick auf die Demokratie.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Hier ist eine Zusammenfassung deiner Auswahl.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Dein Wahlkreis
              </p>
              <p className="font-medium">
                {wahlkreisName || 'Wird geladen...'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="mb-1.5 text-sm font-medium text-muted-foreground">
                Deine Interessen
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedCategories.map((cat) => (
                  <Badge key={cat.id} variant="secondary">
                    {cat.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Dein Tagesziel
              </p>
              <p className="font-medium">
                {selectedGoal
                  ? `${selectedGoal.label} (${selectedGoal.description})`
                  : `Stufe ${dailyGoal}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Zurück
        </Button>
        <Button onClick={onComplete} className="flex-1" size="lg">
          Los geht's
        </Button>
      </div>
    </div>
  );
}
