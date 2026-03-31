import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PRIVILEGE_TIERS, type Profile } from '@/lib/auth/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{ userId: string }>;
}

/** Dynamische Metadata mit dem Anzeigenamen des Nutzers. */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .eq('is_public', true)
    .single();

  if (!profile) {
    return { title: 'Profil nicht gefunden' };
  }

  return {
    title: `${(profile as Record<string, unknown>).display_name} — Demokrat`,
    description: `Öffentliches Profil von ${(profile as Record<string, unknown>).display_name} auf Demokrat.`,
  };
}

/** Verifizierungsstufe als deutsches Label. */
function getVerificationLabel(tier: string): string {
  switch (tier) {
    case 'identity_verified':
      return 'Identität verifiziert';
    case 'verified':
      return 'Verifiziert';
    default:
      return 'Nicht verifiziert';
  }
}

/** Badge-Variante basierend auf Verifizierungsstufe. */
function getVerificationVariant(
  tier: string,
): 'default' | 'secondary' | 'outline' {
  switch (tier) {
    case 'identity_verified':
      return 'default';
    case 'verified':
      return 'secondary';
    default:
      return 'outline';
  }
}

/** Datum im deutschen Format (z.B. "März 2026"). */
function formatMemberSince(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
}

/** Initialen aus dem Anzeigenamen generieren (max. 2 Buchstaben). */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  // Profil mit optionalem Wahlkreis-Join laden
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .eq('is_public', true)
    .single();

  if (error || !profile) {
    notFound();
  }

  const typedProfile = profile as unknown as Profile;

  // Wahlkreis-Name separat laden, falls vorhanden
  let wahlkreisName: string | null = null;
  if (typedProfile.wahlkreis_id) {
    const { data: wahlkreis } = await supabase
      .from('wahlkreise')
      .select('name')
      .eq('id', typedProfile.wahlkreis_id)
      .single();

    if (wahlkreis) {
      wahlkreisName = (wahlkreis as Record<string, unknown>).name as string;
    }
  }

  const privilegeTier =
    PRIVILEGE_TIERS[typedProfile.privilege_tier as keyof typeof PRIVILEGE_TIERS];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar size="lg">
              {typedProfile.avatar_url ? (
                <AvatarImage
                  src={typedProfile.avatar_url}
                  alt={typedProfile.display_name}
                />
              ) : null}
              <AvatarFallback>
                {getInitials(typedProfile.display_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <CardTitle className="text-xl">
                {typedProfile.display_name}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={getVerificationVariant(
                    typedProfile.verification_tier,
                  )}
                >
                  {getVerificationLabel(typedProfile.verification_tier)}
                </Badge>
                <Badge variant="secondary">{privilegeTier.name}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typedProfile.bio ? (
              <div>
                <h3 className="mb-1 text-sm font-medium text-muted-foreground">
                  Über mich
                </h3>
                <p className="text-sm">{typedProfile.bio}</p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {wahlkreisName ? (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Wahlkreis
                  </h3>
                  <p className="text-sm">{wahlkreisName}</p>
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Reputation
                </h3>
                <p className="text-sm">
                  {typedProfile.reputation_points.toLocaleString('de-DE')}{' '}
                  Punkte
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Mitglied seit
                </h3>
                <p className="text-sm">
                  {formatMemberSince(typedProfile.created_at)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
