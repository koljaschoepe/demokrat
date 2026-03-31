'use client';

import { BadgeCheck, ShieldCheck, Star, Flame } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Profile } from '@/lib/auth/types';
import { PRIVILEGE_TIERS } from '@/lib/auth/types';

interface ProfileHeaderProps {
  profile: Profile;
  wahlkreisName?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function ProfileHeader({ profile, wahlkreisName }: ProfileHeaderProps) {
  const tier = PRIVILEGE_TIERS[profile.privilege_tier];

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <Avatar size="lg" className="size-20">
        {profile.avatar_url && (
          <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
        )}
        <AvatarFallback className="text-lg">
          {getInitials(profile.display_name)}
        </AvatarFallback>
        {profile.verification_tier !== 'unverified' && (
          <AvatarBadge className="size-5 bg-primary">
            {profile.verification_tier === 'identity_verified' ? (
              <ShieldCheck className="size-3" />
            ) : (
              <BadgeCheck className="size-3" />
            )}
          </AvatarBadge>
        )}
      </Avatar>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-lg font-heading font-semibold">
            {profile.display_name}
          </h1>
          {profile.verification_tier === 'verified' && (
            <BadgeCheck className="size-4 text-primary" aria-label="Verifiziert" />
          )}
          {profile.verification_tier === 'identity_verified' && (
            <ShieldCheck
              className="size-4 text-primary"
              aria-label="Identität verifiziert"
            />
          )}
        </div>

        {wahlkreisName && (
          <p className="text-sm text-muted-foreground">{wahlkreisName}</p>
        )}

        {profile.bio && (
          <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="gap-1">
          <Star className="size-3" />
          {profile.reputation_points} Punkte
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            'gap-1',
            profile.privilege_tier >= 3 && 'border-primary text-primary',
          )}
        >
          {tier.name}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Flame className="size-3" />
          0 Tage Streak
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground">
        Mitglied seit {formatMemberSince(profile.created_at)}
      </p>
    </div>
  );
}
