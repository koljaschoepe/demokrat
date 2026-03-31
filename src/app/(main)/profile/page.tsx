'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings, Star, Flame, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth/use-auth';
import { trpc } from '@/lib/trpc/client';
import { ProfileHeader } from '@/components/profile/profile-header';
import { VoteHistoryList } from '@/components/profile/vote-history-list';
import { PRIVILEGE_TIERS } from '@/lib/auth/types';
import type { PrivilegeTier } from '@/lib/auth/types';
import { getWahlkreis } from '@/lib/data/wahlkreise';

function getNextTierThreshold(
  currentTier: PrivilegeTier,
  currentPoints: number,
): { nextTierName: string; threshold: number; progress: number } | null {
  const nextTier = (currentTier + 1) as PrivilegeTier;
  if (nextTier > 4) return null;

  const tierInfo = PRIVILEGE_TIERS[nextTier];
  const currentTierInfo = PRIVILEGE_TIERS[currentTier];
  const range = tierInfo.minPoints - currentTierInfo.minPoints;
  const pointsInRange = currentPoints - currentTierInfo.minPoints;
  const progress = range > 0 ? Math.min((pointsInRange / range) * 100, 100) : 0;

  return {
    nextTierName: tierInfo.name,
    threshold: tierInfo.minPoints,
    progress,
  };
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="size-20 animate-pulse rounded-full bg-muted" />
      <div className="flex flex-col items-center gap-2">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
      </div>
      <Separator className="my-2" />
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default function ProfilePage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { data: sessionData, isLoading: sessionLoading } =
    trpc.auth.session.useQuery(undefined, {
      enabled: !!profile,
    });
  const [wahlkreisName, setWahlkreisName] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (profile?.wahlkreis_id) {
      void getWahlkreis(profile.wahlkreis_id).then((wk) => {
        if (wk) {
          setWahlkreisName(`${wk.name} (WK ${wk.id})`);
        }
      });
    }
  }, [profile?.wahlkreis_id]);

  const isLoading = authLoading || sessionLoading;

  if (isLoading || !profile) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-6">
        <ProfileSkeleton />
      </div>
    );
  }

  const nextTier = getNextTierThreshold(
    profile.privilege_tier,
    profile.reputation_points,
  );

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Header mit Einstellungen-Link */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="sr-only">Mein Profil</h1>
        <div />
        <Link href="/profile/settings">
          <Button variant="ghost" size="icon" aria-label="Einstellungen">
            <Settings className="size-5" />
          </Button>
        </Link>
      </div>

      <ProfileHeader profile={profile} wahlkreisName={wahlkreisName} />

      <Separator className="my-6" />

      <Tabs defaultValue="uebersicht">
        <TabsList className="w-full">
          <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
          <TabsTrigger value="abstimmungen">Abstimmungen</TabsTrigger>
          <TabsTrigger value="aktivitaet">Aktivität</TabsTrigger>
        </TabsList>

        {/* Uebersicht Tab */}
        <TabsContent value="uebersicht">
          <div className="flex flex-col gap-4 pt-4">
            {/* Reputation & Fortschritt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-4 text-primary" />
                  Reputation
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tabular-nums">
                    {profile.reputation_points}
                  </span>
                  <span className="text-sm text-muted-foreground">Punkte</span>
                </div>

                {nextTier && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Nächste Stufe: {nextTier.nextTierName}
                      </span>
                      <span>
                        {profile.reputation_points}/{nextTier.threshold}
                      </span>
                    </div>
                    <Progress value={nextTier.progress} />
                  </div>
                )}

                {!nextTier && (
                  <p className="text-sm text-muted-foreground">
                    Höchste Stufe erreicht!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Badges (Platzhalter) */}
            <Card>
              <CardHeader>
                <CardTitle>Abzeichen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Noch keine Abzeichen verdient. Stimme ab und nimm teil, um
                  Abzeichen zu erhalten.
                </p>
              </CardContent>
            </Card>

            {/* Kategorien */}
            {sessionData?.preferences?.categories &&
              sessionData.preferences.categories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deine Interessen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {sessionData.preferences.categories.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

        {/* Abstimmungen Tab */}
        <TabsContent value="abstimmungen">
          <div className="pt-4">
            <VoteHistoryList />
          </div>
        </TabsContent>

        {/* Aktivitaet Tab */}
        <TabsContent value="aktivitaet">
          <div className="flex flex-col gap-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="size-4 text-primary" />
                  Tagesstreak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold tabular-nums">0</span>
                  <span className="text-sm text-muted-foreground">Tage</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Komm täglich zurück, um deinen Streak zu erhöhen.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Aktivitätskalender
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Der Aktivitätskalender wird bald verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
