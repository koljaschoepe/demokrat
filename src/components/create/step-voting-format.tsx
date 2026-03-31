'use client';

import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { CreateTopicInput } from '@/lib/validators/topic';

const DURATION_OPTIONS = [
  { value: 7, label: '7 Tage' },
  { value: 14, label: '14 Tage' },
  { value: 21, label: '21 Tage' },
  { value: 30, label: '30 Tage' },
] as const;

export function StepVotingFormat() {
  const { setValue, watch } = useFormContext<CreateTopicInput>();

  const votingFormat = watch('voting_format') || 'yes_no';
  const votingOptions = watch('voting_options') || ['', ''];
  const maxChoices = watch('max_choices') || 1;
  const durationDays = watch('duration_days') || 14;

  const handleFormatChange = (value: string) => {
    setValue('voting_format', value as 'yes_no' | 'multiple_choice', {
      shouldValidate: true,
    });
    if (value === 'multiple_choice' && votingOptions.length < 2) {
      setValue('voting_options', ['', ''], { shouldValidate: true });
    }
  };

  const addOption = () => {
    if (votingOptions.length < 10) {
      setValue('voting_options', [...votingOptions, ''], {
        shouldValidate: true,
      });
    }
  };

  const removeOption = (index: number) => {
    if (votingOptions.length > 2) {
      const updated = votingOptions.filter((_, i) => i !== index);
      setValue('voting_options', updated, { shouldValidate: true });
      // Adjust max_choices if needed
      if (maxChoices > updated.length) {
        setValue('max_choices', updated.length, { shouldValidate: true });
      }
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...votingOptions];
    updated[index] = value;
    setValue('voting_options', updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      {/* Voting format selection */}
      <div className="space-y-3">
        <Label>Abstimmungsformat</Label>
        <RadioGroup value={votingFormat} onValueChange={handleFormatChange}>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value="yes_no" />
            <div>
              <p className="text-sm font-medium">Ja / Nein / Enthaltung</p>
              <p className="text-xs text-muted-foreground">
                Einfache Abstimmung mit drei Optionen
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-input p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <RadioGroupItem value="multiple_choice" />
            <div>
              <p className="text-sm font-medium">Multiple Choice</p>
              <p className="text-xs text-muted-foreground">
                Mehrere Antwortmöglichkeiten definieren
              </p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Multiple choice options */}
      {votingFormat === 'multiple_choice' && (
        <div className="space-y-3">
          <Label>Antwortmöglichkeiten</Label>
          <div className="space-y-2">
            {votingOptions.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                  {index + 1}.
                </span>
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                {votingOptions.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {votingOptions.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="size-3.5" />
              Option hinzufügen
            </Button>
          )}

          {/* Max choices */}
          <div className="space-y-1.5">
            <Label htmlFor="max-choices">
              Maximale Auswahl{' '}
              <span className="text-muted-foreground">
                (wie viele Optionen darf man wählen?)
              </span>
            </Label>
            <Input
              id="max-choices"
              type="number"
              min={1}
              max={votingOptions.length}
              value={maxChoices}
              onChange={(e) =>
                setValue('max_choices', Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              className="w-24"
            />
          </div>
        </div>
      )}

      {/* Duration */}
      <div className="space-y-3">
        <Label>Abstimmungsdauer</Label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              variant={durationDays === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setValue('duration_days', opt.value, { shouldValidate: true })
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
