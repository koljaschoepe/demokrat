'use client';

import { useCallback, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc/client';
import type { UserPreferences } from '@/lib/auth/types';

interface AccessibilitySettingsProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}

const FONT_SIZES: Array<{
  value: UserPreferences['font_size'];
  label: string;
  description: string;
}> = [
  { value: 'small', label: 'Klein', description: 'Kompakte Darstellung' },
  { value: 'medium', label: 'Mittel', description: 'Standard' },
  { value: 'large', label: 'Groß', description: 'Vergrößerte Schrift' },
];

export function AccessibilitySettings({
  preferences,
  onUpdate,
}: AccessibilitySettingsProps) {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const updatePreferences = trpc.users.updatePreferences.useMutation({
    onSuccess: (data) => {
      onUpdate(data.preferences);
      setFeedback({
        type: 'success',
        message: 'Barrierefreiheit aktualisiert.',
      });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const handleFontSizeChange = useCallback(
    (value: string) => {
      updatePreferences.mutate({
        font_size: value as UserPreferences['font_size'],
      });
    },
    [updatePreferences],
  );

  const handleToggle = useCallback(
    (field: 'high_contrast' | 'reduced_motion', value: boolean) => {
      updatePreferences.mutate({ [field]: value });
    },
    [updatePreferences],
  );

  return (
    <div className="flex flex-col gap-6">
      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div>
        <p className="mb-3 text-sm font-medium">Schriftgröße</p>
        <RadioGroup
          value={preferences.font_size}
          onValueChange={handleFontSizeChange}
          aria-label="Schriftgröße wählen"
        >
          {FONT_SIZES.map((size) => (
            <div key={size.value} className="flex items-center gap-3">
              <RadioGroupItem
                value={size.value}
                id={`font-${size.value}`}
                disabled={updatePreferences.isPending}
              />
              <Label htmlFor={`font-${size.value}`} className="cursor-pointer">
                <span className="font-medium">{size.label}</span>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {size.description}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="high-contrast" className="flex-1 cursor-pointer">
          <div>
            <p className="font-medium">Hoher Kontrast</p>
            <p className="text-xs text-muted-foreground">
              Erhöhter Farbkontrast für bessere Lesbarkeit.
            </p>
          </div>
        </Label>
        <Switch
          id="high-contrast"
          checked={preferences.high_contrast}
          onCheckedChange={(checked: boolean) =>
            handleToggle('high_contrast', checked)
          }
          disabled={updatePreferences.isPending}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Label htmlFor="reduced-motion" className="flex-1 cursor-pointer">
          <div>
            <p className="font-medium">Reduzierte Animationen</p>
            <p className="text-xs text-muted-foreground">
              Deaktiviert oder reduziert Bewegungseffekte.
            </p>
          </div>
        </Label>
        <Switch
          id="reduced-motion"
          checked={preferences.reduced_motion}
          onCheckedChange={(checked: boolean) =>
            handleToggle('reduced_motion', checked)
          }
          disabled={updatePreferences.isPending}
        />
      </div>
    </div>
  );
}
