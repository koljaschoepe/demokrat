// Verifizierungsstufen
export type VerificationTier = 'unverified' | 'verified' | 'identity_verified';

// Privilegstufen mit Punkteschwellen
export type PrivilegeTier = 0 | 1 | 2 | 3 | 4;

export const PRIVILEGE_TIERS = {
  0: { name: 'Beobachter', minPoints: 0 },
  1: { name: 'Teilnehmer', minPoints: 50 },
  2: { name: 'Mitwirkender', minPoints: 200 },
  3: { name: 'Moderator', minPoints: 1000 },
  4: { name: 'Vertrauensperson', minPoints: 5000 },
} as const;

/** Profil-Typ — entspricht der `profiles`-Tabelle */
export interface Profile {
  id: string;
  display_name: string;
  wahlkreis_id: number | null;
  bio: string | null;
  avatar_url: string | null;
  verification_tier: VerificationTier;
  reputation_points: number;
  privilege_tier: PrivilegeTier;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/** Nutzereinstellungen — entspricht der `user_preferences`-Tabelle */
export interface UserPreferences {
  user_id: string;
  categories: string[];
  notification_votes: boolean;
  notification_comments: boolean;
  notification_results: boolean;
  theme: string;
  language: string;
  daily_goal: number;
  font_size: 'small' | 'medium' | 'large';
  high_contrast: boolean;
  reduced_motion: boolean;
  art9_consent_at: string | null;
  onboarding_completed: boolean;
}

/** Auth-Session mit Profil (verwendet im tRPC-Context) */
export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}
