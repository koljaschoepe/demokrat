'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Bell,
  Tag,
  Accessibility,
  ShieldCheck,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/use-auth';
import { trpc } from '@/lib/trpc/client';
import type { UserPreferences, Profile } from '@/lib/auth/types';
import { NotificationSettings } from '@/components/settings/notification-settings';
import { AccessibilitySettings } from '@/components/settings/accessibility-settings';
import { PrivacySettings } from '@/components/settings/privacy-settings';
import { CATEGORIES, type CategoryId } from '@/lib/data/categories';
import {
  Leaf,
  TrendingUp,
  BookOpen,
  Heart,
  Laptop,
  Users,
  Shield,
  Coins,
  Home,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { searchWahlkreise, getWahlkreis, type Wahlkreis } from '@/lib/data/wahlkreise';

const ICON_MAP: Record<string, LucideIcon> = {
  Leaf,
  TrendingUp,
  BookOpen,
  Heart,
  Laptop,
  Users,
  Shield,
  Coins,
  Home,
  Globe,
};

type SettingsSection =
  | 'profil'
  | 'benachrichtigungen'
  | 'interessen'
  | 'barrierefreiheit'
  | 'datenschutz';

const SECTIONS: Array<{
  id: SettingsSection;
  label: string;
  icon: LucideIcon;
}> = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'benachrichtigungen', label: 'Benachrichtigungen', icon: Bell },
  { id: 'interessen', label: 'Interessen', icon: Tag },
  { id: 'barrierefreiheit', label: 'Barrierefreiheit', icon: Accessibility },
  { id: 'datenschutz', label: 'Datenschutz', icon: ShieldCheck },
];

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const { data: sessionData, isLoading } = trpc.auth.session.useQuery(
    undefined,
    { enabled: !!profile },
  );

  const [activeSection, setActiveSection] = useState<SettingsSection>('profil');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    if (sessionData?.preferences) {
      setPreferences(sessionData.preferences);
    }
  }, [sessionData]);

  const handlePreferencesUpdate = useCallback((prefs: UserPreferences) => {
    setPreferences(prefs);
  }, []);

  if (isLoading || !profile || !preferences) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/profile">
          <Button variant="ghost" size="icon" aria-label="Zurück zum Profil">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <h1 className="text-lg font-heading font-semibold">Einstellungen</h1>
      </div>

      {/* Navigation */}
      <nav className="mb-6 flex gap-1 overflow-x-auto" aria-label="Einstellungen-Navigation">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                activeSection === section.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <Separator className="mb-6" />

      {/* Profil-Sektion */}
      {activeSection === 'profil' && (
        <ProfileSection profile={profile} />
      )}

      {/* Benachrichtigungen */}
      {activeSection === 'benachrichtigungen' && (
        <div>
          <h2 className="mb-4 text-base font-heading font-semibold">
            Benachrichtigungen
          </h2>
          <NotificationSettings
            preferences={preferences}
            onUpdate={handlePreferencesUpdate}
          />
        </div>
      )}

      {/* Interessen */}
      {activeSection === 'interessen' && (
        <InterestsSection
          preferences={preferences}
          onUpdate={handlePreferencesUpdate}
        />
      )}

      {/* Barrierefreiheit */}
      {activeSection === 'barrierefreiheit' && (
        <div>
          <h2 className="mb-4 text-base font-heading font-semibold">
            Barrierefreiheit
          </h2>
          <AccessibilitySettings
            preferences={preferences}
            onUpdate={handlePreferencesUpdate}
          />
        </div>
      )}

      {/* Datenschutz */}
      {activeSection === 'datenschutz' && (
        <div>
          <h2 className="mb-4 text-base font-heading font-semibold">
            Datenschutz
          </h2>
          <PrivacySettings
            preferences={preferences}
            onUpdate={handlePreferencesUpdate}
          />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile Section                                                     */
/* ------------------------------------------------------------------ */

function ProfileSection({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [isPublic, setIsPublic] = useState(profile.is_public);
  const [wahlkreisQuery, setWahlkreisQuery] = useState('');
  const [wahlkreisResults, setWahlkreisResults] = useState<Wahlkreis[]>([]);
  const [selectedWahlkreis, setSelectedWahlkreis] = useState<Wahlkreis | null>(
    null,
  );
  const [isSearchingWk, setIsSearchingWk] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Lade aktuellen Wahlkreis-Namen
  useEffect(() => {
    if (profile.wahlkreis_id) {
      void getWahlkreis(profile.wahlkreis_id).then((wk) => {
        if (wk) setSelectedWahlkreis(wk);
      });
    }
  }, [profile.wahlkreis_id]);

  // Wahlkreis-Suche mit Debounce
  useEffect(() => {
    if (wahlkreisQuery.length < 2) {
      setWahlkreisResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingWk(true);
      try {
        const results = await searchWahlkreise(wahlkreisQuery);
        setWahlkreisResults(results);
      } finally {
        setIsSearchingWk(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [wahlkreisQuery]);

  const updateProfile = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Profil gespeichert.' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const handleSave = useCallback(() => {
    const updates: Record<string, unknown> = {};

    if (displayName !== profile.display_name) {
      updates.display_name = displayName;
    }
    if (bio !== (profile.bio ?? '')) {
      updates.bio = bio || undefined;
    }
    if (isPublic !== profile.is_public) {
      updates.is_public = isPublic;
    }
    if (selectedWahlkreis && selectedWahlkreis.id !== profile.wahlkreis_id) {
      updates.wahlkreis_id = selectedWahlkreis.id;
    }

    if (Object.keys(updates).length === 0) {
      setFeedback({ type: 'success', message: 'Keine Änderungen.' });
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    updateProfile.mutate(
      updates as {
        display_name?: string;
        bio?: string;
        wahlkreis_id?: number;
        is_public?: boolean;
      },
    );
  }, [displayName, bio, isPublic, selectedWahlkreis, profile, updateProfile]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-heading font-semibold">Profil</h2>

      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="display-name">Anzeigename</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            minLength={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Erzähle etwas über dich..."
          />
          <p className="text-xs text-muted-foreground">{bio.length}/500</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="wahlkreis-search">Wahlkreis</Label>
          {selectedWahlkreis && (
            <div className="mb-1 flex items-center gap-2 text-sm">
              <Check className="size-4 text-primary" />
              <span className="font-medium">{selectedWahlkreis.name}</span>
              <span className="text-muted-foreground">
                (WK {selectedWahlkreis.id})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedWahlkreis(null);
                  setWahlkreisQuery('');
                }}
                className="text-xs text-primary underline"
              >
                Ändern
              </button>
            </div>
          )}
          {!selectedWahlkreis && (
            <div className="relative">
              <Input
                id="wahlkreis-search"
                value={wahlkreisQuery}
                onChange={(e) => setWahlkreisQuery(e.target.value)}
                placeholder="Wahlkreis suchen..."
              />
              {isSearchingWk && (
                <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {wahlkreisResults.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-card p-1 shadow-md">
                  {wahlkreisResults.map((wk) => (
                    <li key={wk.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setSelectedWahlkreis(wk);
                          setWahlkreisQuery('');
                          setWahlkreisResults([]);
                        }}
                      >
                        <span className="flex-1">{wk.name}</span>
                        <span className="text-xs text-muted-foreground">
                          WK {wk.id}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="is-public" className="flex-1 cursor-pointer">
            <div>
              <p className="font-medium">Öffentliches Profil</p>
              <p className="text-xs text-muted-foreground">
                Andere Nutzer können dein Profil sehen.
              </p>
            </div>
          </Label>
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={(checked: boolean) => setIsPublic(checked)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateProfile.isPending || displayName.length < 2}
          className="self-start"
        >
          {updateProfile.isPending ? (
            <>
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
              Wird gespeichert...
            </>
          ) : (
            'Speichern'
          )}
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interests Section                                                   */
/* ------------------------------------------------------------------ */

function InterestsSection({
  preferences,
  onUpdate,
}: {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(preferences.categories ?? []),
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const updateCategories = trpc.users.updateCategories.useMutation({
    onSuccess: (data) => {
      onUpdate(data.preferences);
      setFeedback({ type: 'success', message: 'Interessen gespeichert.' });
      setTimeout(() => setFeedback(null), 3000);
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.message });
    },
  });

  const toggleCategory = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 5) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(() => {
    updateCategories.mutate({ categories: Array.from(selected) });
  }, [selected, updateCategories]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-heading font-semibold">Interessen</h2>
      <p className="text-sm text-muted-foreground">
        Wähle 3&ndash;5 Themenbereiche, die dich interessieren.
      </p>

      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3"
        role="group"
        aria-label="Interessenkategorien"
      >
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isSelected = selected.has(cat.id);
          const isDisabled = !isSelected && selected.size >= 5;

          return (
            <button
              key={cat.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={cat.label}
              disabled={isDisabled}
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-sm font-medium transition-all',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground',
                isDisabled && 'cursor-not-allowed opacity-40',
              )}
            >
              {Icon && (
                <Icon
                  className={cn(
                    'size-6',
                    isSelected ? 'text-primary' : 'text-muted-foreground',
                  )}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground" aria-live="polite">
        {selected.size}/5 ausgewählt
      </p>

      <Button
        onClick={handleSave}
        disabled={selected.size < 3 || updateCategories.isPending}
        className="self-start"
      >
        {updateCategories.isPending ? 'Wird gespeichert...' : 'Speichern'}
      </Button>
    </div>
  );
}
