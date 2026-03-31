'use client';

import { useFormContext } from 'react-hook-form';
import { Calendar, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CreateTopicInput } from '@/lib/validators/topic';

interface StepPreviewProps {
  isSubmitting: boolean;
}

export function StepPreview({ isSubmitting }: StepPreviewProps) {
  const { watch } = useFormContext<CreateTopicInput>();

  const title = watch('title');
  const description = watch('description');
  const category = watch('category');
  const tags = watch('tags') || [];
  const votingFormat = watch('voting_format');
  const votingOptions = watch('voting_options') || [];
  const maxChoices = watch('max_choices') || 1;
  const durationDays = watch('duration_days') || 14;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vorschau</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">Titel</p>
            <p className="text-sm font-semibold text-foreground">
              {title || '—'}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Beschreibung
            </p>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap">
              {description || '—'}
            </p>
          </div>

          <Separator />

          {/* Category + tags */}
          <div className="flex flex-wrap items-center gap-1.5">
            {category && <Badge variant="secondary">{category}</Badge>}
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Voting format */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Abstimmungsformat
            </p>
            {votingFormat === 'yes_no' ? (
              <p className="text-sm">Ja / Nein / Enthaltung</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm">
                  Multiple Choice (max. {maxChoices} Auswahl)
                </p>
                <ul className="ml-4 list-disc space-y-0.5">
                  {votingOptions
                    .filter((o) => o.trim())
                    .map((option, i) => (
                      <li key={i} className="text-sm text-foreground/80">
                        {option}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            {durationDays} Tage Laufzeit
          </div>
        </CardContent>
      </Card>

      {/* Free tier warning */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
        <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Du hast noch 5 von 5 Themen diesen Monat übrig.
        </p>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          'Wird veröffentlicht...'
        ) : (
          <>
            <CheckCircle className="size-4" />
            Veröffentlichen
          </>
        )}
      </Button>
    </div>
  );
}
