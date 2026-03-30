# DEMOKRAT -- Ultimativer Implementierungsplan

> **Generiert:** 2026-03-30 | **PRD Version:** 1.0 Final | **Phasen:** 280
> **Anwendung:** Jede Phase = 1 Claude-Conversation (Context clearen, Phase referenzieren)

---

## Nutzungsanleitung

1. Context clearen (`/clear`)
2. Sagen: "Lies den MASTERPLAN.md und fuehre Phase [NNN] aus."
3. Claude liest die Phase, implementiert sie, und markiert sie als done
4. Nach Abschluss: Phase in der PROGRESS.md als erledigt markieren

---

## Uebersicht: 12 Domaenen

| Domaene                             | Phasen  | Bereich                                  |
| ----------------------------------- | ------- | ---------------------------------------- |
| A. Projekt-Foundation               | 001-016 | Setup, Tooling, CI/CD, PWA-Basis         |
| B. Datenbank & Schema               | 017-041 | 25+ Tabellen, RLS, Trigger, Indexes      |
| C. Auth & User Management           | 042-049 | Supabase Auth, Onboarding, Profil        |
| D. Bundestag-Datenpipeline          | 050-067 | DIP API, abgeordnetenwatch, KI-Content   |
| E. Voting Engine                    | 068-077 | Event Sourcing, Hash Chain, Vote-Typen   |
| F. Frontend Core & Design           | 078-112 | Design System, alle Screens/Pages        |
| G. Gamification Engine              | 113-124 | Punkte, Streaks, Privilegien, Sessions   |
| H. Deliberation & Diskussion        | 125-142 | Kommentare, Bridging, Topics, Moderation |
| I. Feed, Suche & Benachrichtigungen | 143-155 | Feed-Algo, Meilisearch, Push, Email      |
| J. Karte & Visualisierung           | 156-164 | Mapbox, Charts, Share-Cards, Echtzeit    |
| K. Admin, Legal & Compliance        | 165-180 | Admin-Panel, Rechtstexte, DSGVO, A11y    |
| L. PWA, Testing & Launch            | 181-200 | Service Worker, Tests, Performance, SEO  |

---

## A. Projekt-Foundation (001-016)

### Phase 001 -- Git Repository & Projektstruktur

- **Beschreibung:** Git-Repo initialisieren, `.gitignore` (Next.js, Supabase, .env, IDE), `README.md`, `.editorconfig` (2 Spaces, UTF-8, LF)
- **Dateien:** `.gitignore`, `README.md`, `.editorconfig`
- **Akzeptanzkriterien:** `git status` zeigt keine Dateien, die ignoriert werden sollten
- **Komplexitaet:** S

### Phase 002 -- Next.js 15 + TypeScript Strict

- **Beschreibung:** `create-next-app` mit App Router, React 19, TypeScript strict. `tsconfig.json` mit `strict: true`, `noUncheckedIndexedAccess`, Path-Aliase `@/*` -> `src/*`
- **Dateien:** `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`
- **Akzeptanzkriterien:** `npm run dev` startet, `npm run build` ohne TS-Fehler, Path-Aliase funktionieren
- **Komplexitaet:** S

### Phase 003 -- Tailwind CSS + shadcn/ui + Design Tokens

- **Beschreibung:** Tailwind CSS + shadcn/ui installieren. Design-Tokens: Indigo `#4F46E5`, Warm-White `#FAFAFA`, Text `#1A1A1A`, Border `#E5E7EB`. Inter + Geist Mono Fonts. 8px Grid. 12px Border-Radius. WCAG-AA-Fokuszustaende (2px Indigo Outline)
- **Dateien:** `tailwind.config.ts`, `src/app/globals.css`, `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`
- **Akzeptanzkriterien:** shadcn Button rendert mit Indigo, korrekte Fonts, Fokuszustaende sichtbar
- **Komplexitaet:** M

### Phase 004 -- Umgebungsvariablen & .env-Struktur

- **Beschreibung:** Type-safe Env-Validierung mit `@t3-oss/env-nextjs` + Zod. `.env.example` mit allen Keys. Server/Client-Trennung
- **Dateien:** `.env.example`, `.env.local`, `src/lib/env.ts`
- **Akzeptanzkriterien:** Build schlaegt fehl bei fehlendem Env-Var mit klarer Meldung. Server-only Vars nicht im Client importierbar
- **Komplexitaet:** S

### Phase 005 -- Supabase Projekt-Setup (Lokal)

- **Beschreibung:** Supabase CLI, `supabase init`, lokale Entwicklung. `@supabase/ssr` fuer Next.js App Router. Browser-Client, Server-Client, Admin-Client, Middleware-Helper
- **Dateien:** `supabase/config.toml`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/middleware.ts`, `src/middleware.ts`
- **Akzeptanzkriterien:** `supabase start` laeuft, `supabase gen types` generiert TS-Types, Client kann lokale DB abfragen
- **Komplexitaet:** M

### Phase 006 -- tRPC Setup mit App Router

- **Beschreibung:** tRPC v11 mit Next.js App Router. Context-Factory (Supabase Client + User). `publicProcedure`, `protectedProcedure`. TanStack Query v5. Health-Check-Procedure
- **Dateien:** `src/server/trpc.ts`, `src/server/context.ts`, `src/server/routers/_app.ts`, `src/server/routers/health.ts`, `src/app/api/trpc/[trpc]/route.ts`, `src/lib/trpc/client.ts`, `src/lib/trpc/server.ts`, `src/app/providers.tsx`
- **Akzeptanzkriterien:** `/api/trpc/health.check` gibt `{status: "ok"}`, TypeScript-Autocompletion funktioniert End-to-End
- **Komplexitaet:** M

### Phase 007 -- ESLint + Prettier

- **Beschreibung:** ESLint Flat Config: `next/core-web-vitals`, `@typescript-eslint/strict`, `jsx-a11y/recommended`. Prettier: 2 Spaces, Single Quotes, Trailing Commas
- **Dateien:** `eslint.config.mjs`, `.prettierrc`, `.prettierignore`
- **Akzeptanzkriterien:** `npm run lint` laeuft, `<img>` ohne `alt` = ESLint-Fehler, `any` = Fehler
- **Komplexitaet:** S

### Phase 008 -- Projektordner-Struktur

- **Beschreibung:** Komplette Ordnerstruktur anlegen: `src/app/(auth)`, `(main)`, `(legal)`, `admin/`, `api/cron/`, `api/webhooks/`. `src/server/routers/`, `integrations/dip/`, `integrations/abgeordnetenwatch/`, `services/`. `src/lib/`, `components/ui/`, `components/layout/`, `components/shared/`, `types/`, `config/`
- **Dateien:** Alle Ordner + Placeholder-Pages fuer jede Route
- **Akzeptanzkriterien:** `npm run build` laeuft, Route-Groups funktionieren, kein 404 fuer Platzhalter-Seiten
- **Komplexitaet:** M

### Phase 009 -- Base Layouts, Metadata & Fonts

- **Beschreibung:** Root Layout mit `<html lang="de">`, Inter + Geist Mono via `next/font`, OG-Meta-Tags, `theme-color: #4F46E5`. Main Layout mit Bottom Navigation (5 Tabs: Home/Suche/+/Karte/Profil). Auth Layout (zentriert). Legal Layout (Prose)
- **Dateien:** `src/app/layout.tsx`, `src/app/(main)/layout.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(legal)/layout.tsx`, `src/components/layout/bottom-nav.tsx`, `src/components/layout/header.tsx`, `src/config/site.ts`, `src/config/navigation.ts`
- **Akzeptanzkriterien:** `lang="de"` im Source, Fonts laden korrekt, Bottom Nav zeigt 5 Tabs mit Indigo-Highlight
- **Komplexitaet:** M

### Phase 010 -- Dark Mode (next-themes)

- **Beschreibung:** `next-themes` mit System/Light/Dark. CSS Custom Properties fuer Dark: `#111111` Hintergrund, `#1A1A1A` Cards, `#6366F1` Accent. Theme-Toggle-Komponente. `prefers-reduced-motion` Respektierung
- **Dateien:** `src/app/providers.tsx` (ThemeProvider), `src/app/globals.css` (Dark Vars), `src/components/shared/theme-toggle.tsx`
- **Akzeptanzkriterien:** Theme wechselt ohne FOUC, Dark Mode korrekte Farben, persists in localStorage
- **Komplexitaet:** S

### Phase 011 -- PWA Manifest & Service Worker (Basis)

- **Beschreibung:** Web App Manifest (name: "Demokrat", display: "standalone", theme_color: "#4F46E5"). Serwist/next-pwa fuer Service Worker. App-Icons (192/384/512). Basis-Caching-Strategie
- **Dateien:** `src/app/manifest.ts`, `public/icons/`, `src/sw.ts`, `next.config.ts` (Serwist Plugin)
- **Akzeptanzkriterien:** Lighthouse PWA "Installable", Service Worker registriert, Offline-Fallback-Page
- **Komplexitaet:** M

### Phase 012 -- i18n Setup (next-intl)

- **Beschreibung:** `next-intl` mit Deutsch als einziger Locale. `localePrefix: "as-needed"` (kein `/de/`). Message-Datei `de.json`. Type-Safe Translation Keys
- **Dateien:** `src/i18n/request.ts`, `src/i18n/routing.ts`, `src/messages/de.json`, `src/types/i18n.d.ts`
- **Akzeptanzkriterien:** Alle UI-Strings aus `de.json`, Datumsformat Deutsch (DD.MM.YYYY), Zahlenformat (1.234,56)
- **Komplexitaet:** M

### Phase 013 -- Upstash Redis Client & Rate Limiting

- **Beschreibung:** `@upstash/redis` + `@upstash/ratelimit`. Typed Cache-Helpers. Rate-Limiter-Factory: 100/min unauthentifiziert, 300/min authentifiziert. Sliding Window
- **Dateien:** `src/lib/redis/client.ts`, `src/lib/redis/rate-limit.ts`, `src/lib/redis/cache.ts`
- **Akzeptanzkriterien:** Redis ping = "PONG", Cache set/get funktioniert, Rate Limiter gibt 429 zurueck
- **Komplexitaet:** S

### Phase 014 -- Sentry Error Tracking

- **Beschreibung:** `@sentry/nextjs` fuer Browser + Server + Edge. Source Maps Upload. Global Error Boundary (`global-error.tsx`). Tunnel-Route gegen Ad-Blocker. 10% Performance Sampling
- **Dateien:** `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `src/app/global-error.tsx`, `src/app/error.tsx`
- **Akzeptanzkriterien:** Fehler erscheinen in Sentry Dashboard mit korrekten Zeilennummern, Error Boundary rendert deutschen Fehlertext
- **Komplexitaet:** M

### Phase 015 -- GitHub Actions CI/CD

- **Beschreibung:** CI Pipeline: install -> lint + typecheck + build + test (parallel). Lighthouse CI auf PRs. Dependabot fuer npm + Actions
- **Dateien:** `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`, `.github/dependabot.yml`, `lighthouserc.js`
- **Akzeptanzkriterien:** Push triggert Pipeline, Lint-Fehler = CI-Fail, CI <5 Min
- **Komplexitaet:** M

### Phase 016 -- Vercel Deployment

- **Beschreibung:** `vercel.json` mit Security Headers (CSP, HSTS, X-Frame-Options DENY), Region `fra1` (Frankfurt/EU), Health-Check Endpoint `/api/health`
- **Dateien:** `vercel.json`, `.vercelignore`, `src/app/api/health/route.ts`
- **Akzeptanzkriterien:** Deployment in `fra1`, Security Headers praesentiert, `/api/health` gibt 200
- **Komplexitaet:** S

---

## B. Datenbank & Schema (017-041)

### Phase 017 -- Supabase Migration Workflow & Baseline

- **Beschreibung:** Migration-Workflow etablieren. Baseline-Migration: `pgcrypto`, `pg_trgm` Extensions. CI-Step fuer `supabase db push`
- **Dateien:** `supabase/migrations/00000000000001_baseline.sql`
- **Komplexitaet:** S

### Phase 018 -- Wahlkreise-Tabelle + Seed (299 Wahlkreise)

- **Beschreibung:** `wahlkreise` Tabelle (id INTEGER PK 1-299, name, bundesland, geometry JSONB). Seed-Daten fuer alle 299 Wahlkreise
- **Dateien:** Migration SQL, `supabase/seed.sql`
- **Komplexitaet:** M

### Phase 019 -- Profiles-Tabelle + RLS

- **Beschreibung:** `profiles` (extends auth.users): id, display_name, wahlkreis_id, bio, avatar_url, verification_tier, reputation_points, privilege_tier, is_public, created_at, updated_at. RLS: eigenes Profil editierbar, oeffentliche Profile fuer alle lesbar
- **Dateien:** Migration SQL
- **Komplexitaet:** M

### Phase 020 -- User Preferences Tabelle + RLS

- **Beschreibung:** `user_preferences`: user*id, categories TEXT[], notification*\*, theme, language, daily_goal, font_size, high_contrast, reduced_motion, art9_consent_at, onboarding_completed
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 021 -- Topics-Tabelle + Indexes + RLS

- **Beschreibung:** `topics`: id, title, description, summary, source (bundestag/user), source_id, category, status (draft/pending/active/voting_closed/archived), voting_format, voting_config JSONB, voting_opens_at, voting_closes_at, created_by, supporter_count, vote_count, comment_count. Indexes: feed, source, category. RLS: Drafts nur fuer Ersteller
- **Dateien:** Migration SQL
- **Komplexitaet:** M

### Phase 022 -- Topic Tags & Supporters Tabellen

- **Beschreibung:** `topic_tags` (topic_id, tag, PK composite). `topic_supporters` (topic_id, user_id, created_at, PK composite). RLS + Trigger fuer supporter_count
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 023 -- Topic News Links Tabelle

- **Beschreibung:** `topic_news_links`: id, topic_id, source_name, source_icon, title, url, published_at. Index auf topic_id. RLS: oeffentlich lesbar
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 024 -- Bundestag Vorgaenge Tabelle

- **Beschreibung:** `bundestag_vorgaenge`: id, dip_id (UNIQUE), titel, abstract, sachgebiet[], vorgangstyp, beratungsstand, initiative[], datum, aktualisiert, deskriptor[], raw_data JSONB, topic_id FK, synced_at. Index auf dip_id
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 025 -- Bundestag Abstimmungen Tabelle

- **Beschreibung:** `bundestag_abstimmungen`: id, abgeordnetenwatch_id (UNIQUE), topic_id FK, titel, datum, ergebnis JSONB, field_intro, field_accepted, raw_data JSONB, synced_at
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 026 -- MdB Stammdaten Tabelle

- **Beschreibung:** `bundestag_mdb`: id, dip_person_id, abgeordnetenwatch_id, name, vorname, nachname, fraktion, wahlkreis_id FK, wahlkreis_name, foto_url, raw_data JSONB. Index auf wahlkreis_id
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 027 -- MdB Einzelstimmen Tabelle

- **Beschreibung:** `mdb_votes`: id, mdb_id FK, abstimmung_id FK, vote (ja/nein/enthaltung/nicht_abgegeben), raw_data JSONB. UNIQUE(mdb_id, abstimmung_id)
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 028 -- Vote Events Tabelle (Event Store)

- **Beschreibung:** `vote_events` (append-only!): event_id, stream_id FK topics, event_type CHECK, user_id FK auth.users, payload JSONB, prev_hash, event_hash, metadata JSONB, created_at, sequence_number BIGINT IDENTITY. RULES: no_update, no_delete. Indexes: stream+sequence, user+topic partial unique. RLS: INSERT eigene, SELECT eigene
- **Dateien:** Migration SQL
- **Komplexitaet:** M

### Phase 029 -- Vote Results Tabelle (Projektion)

- **Beschreibung:** `vote_results`: topic_id PK FK topics, total_votes, results JSONB, demographic_breakdown JSONB, last_updated. RLS: oeffentlich lesbar
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 030 -- Comments Tabelle + RLS

- **Beschreibung:** `comments`: id, topic_id, parent_id (self-ref, max 2 Ebenen), author_id, content (max 2000), position (pro/contra/neutral), sources TEXT[], bridging_score FLOAT, upvotes, downvotes, is_flagged, is_hidden. Indexes: bridging, chrono. RLS: hidden nur fuer Autor sichtbar
- **Dateien:** Migration SQL
- **Komplexitaet:** M

### Phase 031 -- Comment Ratings Tabelle

- **Beschreibung:** `comment_ratings`: user_id, comment_id, rating (-1/0/1), voter_position (Stimme des Bewertenden), PK composite. Trigger fuer upvotes/downvotes Zaehler
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 032 -- Reputation Events Tabelle

- **Beschreibung:** `reputation_events`: id, user_id, action, points, reference_type, reference_id, created_at. Partial Unique Index fuer Idempotenz
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 033 -- Badges & User Badges Tabellen

- **Beschreibung:** `badges`: id, name UNIQUE, description, icon, criteria JSONB. `user_badges`: user_id, badge_id, earned_at, PK composite
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 034 -- Groups & Group Members Tabellen

- **Beschreibung:** `groups`: id, name, description, type (party/faction/interest/custom), visibility (public/private), created_by, member_count. `group_members`: group_id, user_id, role, joined_at. RLS: oeffentliche Gruppen fuer alle, private nur Mitglieder
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 035 -- Reports Tabelle + RLS

- **Beschreibung:** `reports`: id, reporter_id, target_type (comment/topic/user), target_id, reason, status (pending/reviewed/confirmed/dismissed), reviewed_by, reviewed_at. RLS: eigene lesbar, Moderatoren (tier>=3) alle. Trigger: comment.is_flagged setzen
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 036 -- Audit Log Tabelle + RLS

- **Beschreibung:** `audit_log`: id, actor_id, action, target_type, target_id, details JSONB, ip_hash, created_at. RLS: nur privilege_tier >= 4
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 037 -- Notifications Tabelle + Index

- **Beschreibung:** `notifications`: id, user_id, type (11 Typen aus PRD), title, body, reference_type, reference_id, is_read, created_at. Index: (user_id, is_read, created_at DESC). RLS: eigene lesen/updaten
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 038 -- Streaks & Daily Activity Tabellen

- **Beschreibung:** `user_streaks`: user_id PK, current_streak, longest_streak, last_active_date (CET/CEST!), streak_shields, updated_at. `daily_activity`: user_id+activity_date PK, voted, read_summary, quiz_passed, commented, rated, points_earned. RLS: eigene
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 039 -- Session Content & Daily Sessions Tabellen

- **Beschreibung:** `session_content`: id, content_date UNIQUE, topic_id, briefing, quiz_question, quiz_options JSONB, quiz_explanation, bridging_comment_id. `daily_sessions`: user_id+session_date PK, step_reached (0-5), completed, points_earned, completed_at
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 040 -- Platform Metrics & Wahlkreis Stats

- **Beschreibung:** `platform_metrics`: metric_date PK, active_users_today, votes_today, avg_bridging_score, active_wahlkreise, diversity_index, mdb_emails_sent, puls_score. `wahlkreis_stats`: wahlkreis_id PK, registered_users, active_users_week, votes_week, avg_bridging_score, category_diversity, mdb_emails_sent, fortschritt_stufe (1-5). RLS: oeffentlich
- **Dateien:** Migration SQL
- **Komplexitaet:** S

### Phase 041 -- Volltextsuche, Trigger & DB-Funktionen

- **Beschreibung:** German tsvector Index auf topics (title + description). Vote-Results-Projektion-Trigger (update_vote_results). Auto-Activate-Topic Trigger (supporter_count >= Schwelle). Updated-At Trigger. Supabase Realtime aktivieren fuer vote_results
- **Dateien:** Migration SQL
- **Komplexitaet:** L

---

## C. Auth & User Management (042-049)

### Phase 042 -- Supabase Auth Foundation & Webhook

- **Beschreibung:** Supabase Auth konfigurieren (Email/PW mit Double Opt-in, Magic Link). Auth-Webhook `/api/webhooks/supabase-auth` der bei `user.created` automatisch profile + user_preferences anlegt. TypeScript Types fuer Profile, VerificationTier, PrivilegeTier
- **Dateien:** `supabase/config.toml` (Auth), `src/app/api/webhooks/supabase-auth/route.ts`, `src/lib/auth/types.ts`
- **Komplexitaet:** M

### Phase 043 -- Auth Middleware & Session Management

- **Beschreibung:** Next.js Middleware: Session-Refresh, Route-Protection (oeffentliche vs geschuetzte Routen). AuthProvider React Context mit `useAuth()` Hook. tRPC Context mit User/Profile. `publicProcedure` und `protectedProcedure`. Anonymous Browsing (AUTH-10)
- **Dateien:** `src/middleware.ts`, `src/lib/auth/auth-context.tsx`, `src/lib/auth/use-auth.ts`, `src/server/context.ts`
- **Komplexitaet:** M

### Phase 044 -- Registrierung, Login & Magic Link UI

- **Beschreibung:** `/registrieren` (Email, Passwort mit Staerke-Indikator, Name, DSGVO-Checkbox). `/anmelden` (Email/PW + Magic Link Toggle). `/passwort-vergessen` + `/passwort-zuruecksetzen`. Auth Callback Handler. React Hook Form + Zod
- **Dateien:** Pages + Form-Komponenten in `src/components/auth/`, Zod Schemas in `src/lib/validations/auth.ts`
- **Komplexitaet:** M-L

### Phase 045 -- tRPC Auth & Users Router

- **Beschreibung:** `auth.session`, `auth.deleteAccount` (DSGVO Art. 17 mit Anonymisierung), `auth.requestDataExport` (JSON, DSGVO Art. 20). `users.getProfile`, `users.updateProfile`, `users.updatePreferences`, `users.getVoteHistory`, `users.updateCategories`
- **Dateien:** `src/server/routers/auth.ts`, `src/server/routers/users.ts`, `src/server/services/data-export.ts`, `src/server/services/account-deletion.ts`
- **Komplexitaet:** L

### Phase 046 -- Onboarding Flow (4 Screens)

- **Beschreibung:** Screen 1: Wahlkreis (GPS Reverse Geocoding + manuelle Suche). Screen 2: 3-5 Interessen aus 10 Kategorien. Screen 3: Tagesziel (Zuschauer/Teilnehmer/Engagiert/Aktivist). Screen 4: Start-Preview. <90 Sekunden, ueberspringbar
- **Dateien:** `src/app/(main)/onboarding/page.tsx`, Step-Komponenten, `src/lib/geo/reverse-geocode-wahlkreis.ts`, `src/lib/data/wahlkreise.ts`, `src/lib/data/categories.ts`
- **Komplexitaet:** M-L

### Phase 047 -- Profil-Seite & Einstellungen

- **Beschreibung:** `/profil` (Name, Wahlkreis, Bio, Reputation, Streak, Vote-Historie). `/einstellungen` mit Sub-Seiten: Profil bearbeiten, Benachrichtigungen, Interessen, Barrierefreiheit (Schriftgroesse, Kontrast, Reduced Motion), Datenexport, Account-Loeschung
- **Dateien:** Pages + Komponenten fuer Profil und alle Einstellungs-Panels
- **Komplexitaet:** L

### Phase 048 -- OAuth (Google/Apple) & Oeffentliches Profil

- **Beschreibung:** Google + Apple OAuth-Buttons auf Login/Registrierung. `/profil/[userId]` oeffentliches Profil (nur wenn is_public=true). Rate Limiting Middleware. Security Headers
- **Dateien:** `src/components/auth/oauth-buttons.tsx`, `src/app/(main)/profil/[userId]/page.tsx`, `src/server/middleware/rate-limit.ts`
- **Komplexitaet:** M

### Phase 049 -- Art. 9 Consent, Cookie Banner & Auth Polish

- **Beschreibung:** Art. 9 DSGVO Consent Bottom Sheet (vor erster Abstimmung). Cookie Banner (Nur notwendige/Alle). Supabase Email-Templates (Verifizierung, Magic Link, Reset) im Demokrat-Design. Deutsche Fehlermeldungen. End-to-End Auth-Flow testen
- **Dateien:** `src/components/legal/art9-consent-sheet.tsx`, `src/components/legal/cookie-banner.tsx`, Email-Templates, Error-Message-Map
- **Komplexitaet:** M

---

## D. Bundestag-Datenpipeline (050-067)

### Phase 050 -- DIP API TypeScript Client

- **Beschreibung:** HTTP Client fuer `https://search.dip.bundestag.de/api/v1`. Auth: ApiKey Header. TypeScript-Interfaces fuer alle DIP-Entitaeten (Vorgang, Drucksache, Person). Cursor-basierte Pagination. Retry mit Exponential Backoff (3x)
- **Dateien:** `src/server/integrations/dip/client.ts`, `src/server/integrations/dip/types.ts`
- **Komplexitaet:** M

### Phase 051 -- DIP API Mapper & Sync-Logik

- **Beschreibung:** Mapping DIP Vorgang -> internes Topic-Modell (Anhang A). Sync-Logik: `GET /vorgang?f.wahlperiode=21&f.aktualisiert.start={last_sync}`. Idempotent ueber dip_id UNIQUE. Upsert in bundestag_vorgaenge + topics
- **Dateien:** `src/server/integrations/dip/mappers.ts`, `src/server/integrations/dip/sync.ts`
- **Komplexitaet:** M

### Phase 052 -- abgeordnetenwatch API Client

- **Beschreibung:** Client fuer `https://www.abgeordnetenwatch.de/api/v2/`. Keine Auth (CC0). TypeScript-Interfaces fuer Polls, Votes, Politicians. Range-basierte Pagination (max 1000/Request)
- **Dateien:** `src/server/integrations/abgeordnetenwatch/client.ts`, `src/server/integrations/abgeordnetenwatch/types.ts`
- **Komplexitaet:** M

### Phase 053 -- abgeordnetenwatch Mapper & Sync

- **Beschreibung:** Mapping AW Poll -> bundestag_abstimmungen (Anhang B). AW Votes -> mdb_votes. AW Politicians -> bundestag_mdb. Automatische Verknuepfung mit DIP-Vorgang ueber Dokumentennummer. field_intro HTML -> Markdown
- **Dateien:** `src/server/integrations/abgeordnetenwatch/mappers.ts`, `src/server/integrations/abgeordnetenwatch/sync.ts`
- **Komplexitaet:** M

### Phase 054 -- MdB-Stammdaten Import

- **Beschreibung:** Alle MdBs der aktuellen Legislaturperiode importieren. Verknuepfung mit Wahlkreisen. Fraktionszuordnung. Kontaktdaten (offizielle Bundestag-Email: vorname.nachname@bundestag.de)
- **Dateien:** `src/server/integrations/abgeordnetenwatch/sync-mdb.ts`
- **Komplexitaet:** M

### Phase 055 -- Bundestag Sync Cron Job

- **Beschreibung:** Vercel Cron `/api/cron/sync-bundestag`. Alle 15 Min waehrend Sitzungswochen, 6h sonst. Orchestriert DIP + AW Sync. Fehlerbehandlung: 3 Retries, Alert, Cache-Daten mit Hinweis. Sync-Run Logging
- **Dateien:** `src/app/api/cron/sync-bundestag/route.ts`, `src/server/services/bundestag-sync.service.ts`
- **Komplexitaet:** M

### Phase 056 -- Sitzungswochen-Management

- **Beschreibung:** `sitzungswochen` Config-Tabelle (start_date, end_date, is_active). Taeglicher Cron prueft aktive Sitzungswoche. Globales Redis-Flag. Admin-Endpoint zum Importieren des Sitzungskalenders
- **Dateien:** Migration SQL, `src/server/services/sitzungswoche.service.ts`, Cron Handler
- **Komplexitaet:** S

### Phase 057 -- KI-Zusammenfassungen (OpenAI GPT-4o)

- **Beschreibung:** Automatische Zusammenfassungen fuer jeden neuen Vorgang. Einfache Sprache (B1), max 200 Woerter, "Worum geht es?" + "Was wuerde sich aendern?". OpenAI API Integration. Automatisch bei Import
- **Dateien:** `src/server/services/ai-summary.service.ts`, `src/lib/prompts/summary.ts`
- **Komplexitaet:** M

### Phase 058 -- Quiz-Fragen-Generierung

- **Beschreibung:** KI-generierte Multiple-Choice-Fragen (4 Optionen, 1 korrekt) pro Topic fuer die taegliche Session. Validierung: exakt 4 Optionen, 1 korrekt. Retry bei Fehler
- **Dateien:** `src/server/services/ai-quiz.service.ts`, `src/lib/prompts/quiz.ts`
- **Komplexitaet:** M

### Phase 059 -- Nachrichtenlink-Kuratierung

- **Beschreibung:** 2-3 Nachrichtenlinks pro Bundestag-Topic (Tagesschau, ZEIT, FAZ, Spiegel). KI-gestuetzte Vorschlaege aus Whitelist. Speicherung in topic_news_links
- **Dateien:** `src/server/services/ai-news-links.service.ts`, `src/lib/prompts/news.ts`
- **Komplexitaet:** M

### Phase 060 -- tRPC Bundestag Router

- **Beschreibung:** `bundestag.vorgaenge` (paginiert, filterbar), `bundestag.mdb` (mit Abstimmungshistorie), `bundestag.mdbByWahlkreis`. Oeffentliche Queries
- **Dateien:** `src/server/routers/bundestag.ts`
- **Komplexitaet:** M

### Phase 061 -- UI: Vorgang-Timeline (Gesetzgebungsprozess)

- **Beschreibung:** Horizontale Punkte-Linie: Eingereicht > 1. Lesung > Ausschuss > 2./3. Lesung > Verkuendet. Auf Topic-Detail-Seite fuer Bundestag-Topics
- **Dateien:** `src/components/bundestag/VorgangTimeline.tsx`
- **Komplexitaet:** M

### Phase 062 -- UI: MdB-Profil-Seite

- **Beschreibung:** `/abgeordnete/[id]` mit Foto, Name, Fraktion, Wahlkreis, Abstimmungshistorie. "Ihr Abgeordneter hat [Ja] gestimmt" Verknuepfung
- **Dateien:** `src/app/(main)/abgeordnete/[id]/page.tsx`, Komponenten
- **Komplexitaet:** M

### Phase 063 -- UI: Bundestag-Filter & Suche

- **Beschreibung:** Filter nach Ausschuss, Fraktion, Themengebiet (BTS-07). Volltextsuche ueber Bundestag-Daten (BTS-08)
- **Dateien:** Filter-Komponenten, Suche-Integration
- **Komplexitaet:** M

### Phase 064 -- Vote-Closing Cron Job

- **Beschreibung:** `/api/cron/close-votes` -- Jede Minute: `UPDATE topics SET status='voting_closed' WHERE status='active' AND voting_closes_at <= now()`
- **Dateien:** `src/app/api/cron/close-votes/route.ts`
- **Komplexitaet:** S

### Phase 065 -- Content Pipeline Orchestrierung

- **Beschreibung:** Zusammenfuehrung: Neuer Vorgang -> Zusammenfassung generieren -> Quiz generieren -> News-Links kuratieren -> Session Content erstellen. Automatisch bei Sync
- **Dateien:** `src/server/services/content-pipeline.service.ts`
- **Komplexitaet:** M

### Phase 066 -- Meilisearch Index-Sync Cron

- **Beschreibung:** `/api/cron/update-search` -- Alle 30 Min Topics + Comments in Meilisearch reindexieren. Inkrementell seit letztem Sync
- **Dateien:** `src/app/api/cron/update-search/route.ts`
- **Komplexitaet:** S

### Phase 067 -- Drucksache-PDF Link & Quellenangaben

- **Beschreibung:** BTS-06: Link zur Original-Drucksache auf bundestag.de. Integration in Topic-Detail-Seite. Metadaten (Drucksachen-Nummer, Datum)
- **Dateien:** Komponente + Topic-Detail Integration
- **Komplexitaet:** S

---

## E. Voting Engine (068-077)

### Phase 068 -- Hash Chain Computation

- **Beschreibung:** SHA-256 Hash-Chain-Logik. `computeEventHash()`: Kanonisches JSON (sortierte Keys, kein Whitespace, UTC). `getPreviousHash()`: Letzter Hash im Stream. `validateChain()`: Integritaetspruefung
- **Dateien:** `src/server/lib/hash-chain.ts`, Unit Tests
- **Komplexitaet:** M

### Phase 069 -- Vote Results Projektion Trigger

- **Beschreibung:** PostgreSQL Trigger `update_vote_results()`: Auf VoteCast -> Zaehler erhoehen, VoteChanged -> Alt dekrementieren/Neu inkrementieren, VoteRevoked -> Dekrementieren. JSONB Manipulation. Auch topics.vote_count aktualisieren
- **Dateien:** Migration SQL (Trigger-Funktion)
- **Komplexitaet:** M

### Phase 070 -- tRPC Votes Router: Cast, Change, Revoke, MyVote

- **Beschreibung:** `votes.cast`: Validierung (Auth, Topic aktiv, Fenster offen, Art.9 Consent, kein Duplikat), Event erstellen, Hash berechnen, INSERT. `votes.change`: VoteChanged Event. `votes.revoke`: VoteRevoked Event. `votes.myVote`: Event-Replay fuer aktuellen Stand
- **Dateien:** `src/server/routers/votes.ts`, `src/lib/validators/vote.ts`
- **Komplexitaet:** L

### Phase 071 -- tRPC Votes: Results & Comparison Queries

- **Beschreibung:** `votes.results` (oeffentlich, liest nur vote_results): total, breakdown, percentages, chartData. `votes.comparison`: Buerger vs. Bundestag nebeneinander, Delta, Fraktions-Aufschluesselung. Redis-Caching 60s
- **Dateien:** `src/server/routers/votes.ts` (Erweiterung)
- **Komplexitaet:** M

### Phase 072 -- Ja/Nein/Enthaltung UI (VOTE-01) + Zeitfenster (VOTE-07)

- **Beschreibung:** Bottom Sheet (50% Hoehe): 3 grosse Buttons (Ja=Indigo, Nein=Hellgrau, Enthaltung=Hellgrau). Bestaetigungsschritt. Post-Vote: Bounce (200ms) + Haptic + Hash + Share. Countdown "Noch X Tage, Y Stunden"
- **Dateien:** `src/components/voting/yes-no-bottom-sheet.tsx`, Integration in Topic-Detail
- **Komplexitaet:** M

### Phase 073 -- Multiple Choice UI (VOTE-02)

- **Beschreibung:** Bottom Sheet (70%): Checkbox-Liste, "Waehle bis zu [X] Optionen". voting_config JSONB fuer Optionen. Trigger-Erweiterung fuer MC-Payloads
- **Dateien:** `src/components/voting/multiple-choice-bottom-sheet.tsx`
- **Komplexitaet:** M

### Phase 074 -- Stimme Aendern & Zurueckziehen (VOTE-08)

- **Beschreibung:** "Aendern" oeffnet Bottom Sheet mit aktueller Wahl vorselektiert. "Stimme zurueckziehen" mit Bestaetigungsdialog. Event-Replay korrekt fuer Revoke-then-Recast
- **Dateien:** `src/components/voting/vote-status.tsx`
- **Komplexitaet:** M

### Phase 075 -- Echtzeit Vote Counter (Supabase Realtime)

- **Beschreibung:** `useVoteResultsRealtime` Hook: Subscribt auf vote_results Aenderungen. Presence Channel fuer "X Buerger stimmen gerade ab". Odometer-Animation fuer Zaehler
- **Dateien:** `src/hooks/use-vote-results-realtime.ts`, `src/hooks/use-presence-counter.ts`, `src/components/ui/animated-counter.tsx`
- **Komplexitaet:** M

### Phase 076 -- Ergebnis-Charts (Balken, Kreis)

- **Beschreibung:** Recharts-basierte Chart-Komponenten. Horizontales Balkendiagramm (Vote Results). Kreisdiagramm (Verteilung). KEIN Gruen/Rot (Barrierefreiheit) -- nur Indigo-Abstufungen + Grau
- **Dateien:** `src/components/charts/VoteBarChart.tsx`, `src/components/charts/VoteDonutChart.tsx`, `src/lib/charts/theme.ts`
- **Komplexitaet:** M

### Phase 077 -- Buerger vs. Bundestag Vergleich (VOTE-12)

- **Beschreibung:** Nebeneinander: Buerger (links) vs. Bundestag (rechts). Prozentuale Abweichung. Indigo-Intensitaet = Uebereinstimmungsgrad. Fraktions-Aufschluesselung. "Ihr Abgeordneter [Name] hat [Ja] gestimmt"
- **Dateien:** `src/components/charts/ComparisonChart.tsx`, `src/components/charts/FactionBreakdown.tsx`, `src/app/(main)/themen/[id]/ergebnis/page.tsx`
- **Komplexitaet:** L

---

## F. Frontend Core & Design (078-112)

### Phase 078 -- Reusable UI-Komponenten Basis

- **Beschreibung:** shadcn/ui Komponenten installieren: Button, Card, Input, Textarea, Select, Checkbox, RadioGroup, Dialog, Drawer/BottomSheet, Badge, Toast, Skeleton, Tooltip. Alle mit Demokrat-Design-Tokens (12px Radius, Indigo Accent)
- **Komplexitaet:** M

### Phase 079 -- Bottom Sheet Komponente

- **Beschreibung:** Wiederverwendbare Bottom Sheet (Vaul/Radix): Snap-Points (40/70/100%), Drag Handle, Backdrop Blur. Desktop: Side Panel statt Bottom Sheet
- **Komplexitaet:** M

### Phase 080 -- Bottom Navigation Bar (PWA-07)

- **Beschreibung:** 5 Tabs: Home | Suche | Erstellen (+, groesserer Indigo-Kreis) | Karte | Profil. Aktiv=Indigo, Inaktiv=Grau. Badge auf Home fuer Benachrichtigungen. Verschwindet beim Scrollen runter, erscheint beim Hoch-Scrollen
- **Komplexitaet:** M

### Phase 081 -- Desktop Sidebar & Responsive Layout

- **Beschreibung:** Linke Sidebar (220px): Navigation, Streak, Wahlkreis-Kurzinfo. Center Column (max 680px). Rechte Sidebar (280px): Mini-Karte, Trending, Demokratie-Puls. Responsive Breakpoints
- **Komplexitaet:** M

### Phase 082 -- Landing Page (/)

- **Beschreibung:** Hero ("Deine Stimme. Zwischen den Wahlen."), So funktioniert's (3 Schritte), Differenzierung (3 Value Props), Live-Content (2 Feed-Karten), Mini-Karte, Testimonials, CTA. SSR fuer SEO. OG-Meta-Tags
- **Komplexitaet:** L

### Phase 083 -- Home Feed Seite (/feed)

- **Beschreibung:** Filter-Leiste (horizontal scrollbar Chips), Streak-Leiste, Sitzungswoche-Banner, Echtzeit-Zaehler, Feed-Karten (Quelle, Titel, Kategorie, Abstimmungen, Kommentare, Zeitbalken, "Abstimmen"-Button). Infinite Scroll + Pull-to-Refresh
- **Komplexitaet:** L

### Phase 084 -- Feed Topic Card Komponente

- **Beschreibung:** Quell-Badge (BUNDESTAG/BUERGER), Titel (max 2 Zeilen), Beschreibung, Kategorie-Chip, Zahlen (Mono), Fortschrittsbalken, "Abstimmen"-Button (Indigo, 48px). Personalisierungs-Label. Nachrichtenartikel-Link
- **Komplexitaet:** M

### Phase 085 -- Topic Detail Seite (/themen/[id])

- **Beschreibung:** Zusammenfassung (hervorgehobene Box), Bundestag-Timeline (wenn BT-Topic), Abstimmungs-Bereich, Ergebnis-Bereich (nach Abstimmung), Kommentar-Bereich. Sticky Bottom Bar "Abstimmen"
- **Komplexitaet:** L

### Phase 086 -- Thema Erstellen Formular (/thema-erstellen)

- **Beschreibung:** 3-Schritt-Formular: Basics (Titel, Beschreibung, Kategorie, Tags), Abstimmungsformat (Ja/Nein, MC, RC), Vorschau + Veroeffentlichen. React Hook Form + Zod. Free-Tier-Limit (5/Monat)
- **Komplexitaet:** M

### Phase 087 -- Suche Seite (/suche)

- **Beschreibung:** Suchfeld mit Debounce + Autocomplete, Meilisearch Integration, Filter (Quelle, Kategorie), Sortierung (Relevanz/Neueste/Meiste Stimmen), Ergebnis-Highlighting, Leer-Zustand mit Trending
- **Komplexitaet:** M

### Phase 088 -- Benachrichtigungen

- **Beschreibung:** Glocken-Icon mit Badge, Dropdown-Liste (letzte 10), Vollstaendige Seite `/benachrichtigungen`. 11 Benachrichtigungstypen mit Icons. Ungelesen-Filter. "Alle als gelesen markieren"
- **Komplexitaet:** M

### Phase 089 -- Einstellungen Sub-Seiten

- **Beschreibung:** Alle Einstellungs-Panels als eigene Routes: `/einstellungen/profil`, `/benachrichtigungen`, `/interessen`, `/barrierefreiheit`, `/daten`, `/datenschutz`
- **Komplexitaet:** M

### Phase 090 -- Empty States

- **Beschreibung:** Leer-Zustaende fuer alle Screens gemaess PRD: Feed, Kommentare, Suchergebnisse, Wahlkreis, Profil, Benachrichtigungen, Streak
- **Komplexitaet:** S

### Phase 091 -- Loading & Skeleton States

- **Beschreibung:** Skeleton-Loading fuer Feed Cards, Topic Detail, Kommentare, Profil, Charts. Konsistentes Pulsieren in Design-System-Grau
- **Komplexitaet:** S

### Phase 092 -- Animationen & Transitionen

- **Beschreibung:** Page Transitions (Fade + Slide), Vote Bounce (200ms ease-out), Streak-Flamme (CSS, Indigo-Ton), Odometer-Zahlen. Alles mit `prefers-reduced-motion` Guard
- **Komplexitaet:** M

### Phase 093 -- Taegliche Session Seite (/session)

- **Beschreibung:** Full-Screen, Stories-Stil (5 Punkte oben). Schritt 1: Briefing (60s). Schritt 2: Quiz (45s). Schritt 3: Abstimmung (60s). Schritt 4: Perspektivenwechsel (90s). Schritt 5: Zusammenfassung (30s). Swipe-Navigation
- **Komplexitaet:** L

### Phase 094 -- Meine Wirkung Seite (/profil/wirkung)

- **Beschreibung:** Civic Character Sheet Hexagon (6 Attribute), Feedback-Loop-Visualisierung, Statistiken-Karten, Wahlkreis-Beitrag
- **Komplexitaet:** M

### Phase 095 -- Demokratie-Karte Seite (/karte)

- **Beschreibung:** Fullscreen Mapbox-Karte, 299 Wahlkreise als Choropleth (Indigo-Intensitaet), Tap -> Bottom Sheet, eigener Wahlkreis hervorgehoben, Dark Mode, Live-Pulse
- **Komplexitaet:** L (siehe auch Domaene J fuer Details)

### Phase 096-112 -- Weitere Seiten & Komponenten

- **096:** Wahlkreis-Dashboard Bottom Sheet
- **097:** Progress Bar & Level-Visualisierung
- **098:** Share Card Modal (3 Formate)
- **099:** Feedback Loop Stepper (4 Schritte)
- **100:** Transparenz-Seiten (/transparenz/\*)
- **101:** Impressum Seite
- **102:** Datenschutz Seite (mehrschichtig)
- **103:** Nutzungsbedingungen Seite
- **104:** Community Regeln Seite
- **105:** Admin Dashboard Seite
- **106:** Admin Moderations-Queue
- **107:** Admin Nutzerverwaltung
- **108:** Admin Sync-Monitoring
- **109:** Admin Audit-Log
- **110:** Admin Feature Flags
- **111:** Cookie Banner Integration
- **112:** Skip Navigation & ARIA Landmarks

---

## G. Gamification Engine (113-124)

### Phase 113 -- Punkte-Service (GAM-01)

- **Beschreibung:** `PointsService.awardPoints(userId, action, referenceId)`. Alle Punktwerte aus PRD. 2x Multiplikator waehrend Sitzungswochen. Transaktional: reputation_events INSERT + profiles.reputation_points UPDATE + daily_activity UPSERT. Idempotenz-Guard
- **Dateien:** `src/server/services/points.service.ts`, `src/lib/constants/gamification.ts`
- **Komplexitaet:** M

### Phase 114 -- Streak-Logik (GAM-02)

- **Beschreibung:** CET/CEST Timezone Handling. Streak-Fortsetzung (gestern aktiv?), Streak-Shield (1x/Woche bei 5/7 aktiven Tagen), Meilensteine (7/30/100/365), Empathischer Reset. Taeglicher Cron + Wochentlicher Shield-Cron
- **Dateien:** `src/server/services/streak.service.ts`, Cron Handler
- **Komplexitaet:** M

### Phase 115 -- Privileg-Stufen (GAM-03)

- **Beschreibung:** 5 Tiers: Beobachter(0), Teilnehmer(50), Mitwirkender(200), Moderator(1000), Vertrauensperson(5000). `computeTier()`, Enforcement Middleware `requireTier(n)`, taegliche Reconciliation. Benachrichtigung bei Tier-Aufstieg
- **Dateien:** `src/server/services/privileges.service.ts`, `src/server/middleware/requireTier.ts`
- **Komplexitaet:** M

### Phase 116 -- Session Content Pipeline (GAM-06 Backend)

- **Beschreibung:** Taeglicher Cron 05:00 CET: Topic-Auswahl, KI-Briefing (3 Saetze), KI-Quiz (4 MC-Optionen), Bridging-Kommentar-Auswahl. UPSERT in session_content
- **Dateien:** `src/server/services/session-content.service.ts`
- **Komplexitaet:** M

### Phase 117 -- Session Flow API (GAM-06 API)

- **Beschreibung:** tRPC session Router: `todayContent`, `startSession`, `completeStep(step, payload)`, `skipToFreeNav`. State Machine: 5 Schritte, pausierbar. Tagesziel-Integration. Punkte pro Schritt (45-65 total)
- **Dateien:** `src/server/routers/session.ts`, `src/server/services/session-flow.service.ts`
- **Komplexitaet:** M

### Phase 118 -- Session Flow UI (GAM-06 Frontend)

- **Beschreibung:** Bereits in Phase 093 beschrieben -- hier Backend-Integration und Feinschliff der 5-Schritt-Flow-Logik
- **Komplexitaet:** M

### Phase 119 -- Wahlkreis-Stats Aggregation (GAM-04)

- **Beschreibung:** Cron alle 6h: Aggregiert registered_users, active_users_week, votes_week, avg_bridging_score, category_diversity. Fortschritts-Stufe berechnen (1-5). Tier-Change-Benachrichtigungen
- **Dateien:** `src/server/services/wahlkreis-stats.service.ts`, tRPC wahlkreis Router
- **Komplexitaet:** M

### Phase 120 -- Sitzungswoche Live-Modus (GAM-07)

- **Beschreibung:** Banner, LIVE-Badge, Push vor Schluesselabstimmungen, 2x Multiplikator, Echtzeit-Zaehler "X Buerger stimmen parallel zum Bundestag ab"
- **Dateien:** `src/components/feed/SitzungswocheBanner.tsx`, Push-Cron
- **Komplexitaet:** M

### Phase 121 -- Demokratie-Puls (GAM-14)

- **Beschreibung:** Zusammengesetzter Score (0-100) aus 5 Metriken. Taeglicher Cron. Pulsierender Indigo-Kreis im UI (groesser bei hohem Score). Expandierbar zu 5 Komponenten-Balken
- **Dateien:** `src/server/services/platform-metrics.service.ts`, `src/components/shared/DemocracyPulse.tsx`
- **Komplexitaet:** M

### Phase 122 -- Gamification UI Integration

- **Beschreibung:** Profil: Punkte, Tier-Badge, Streak-Kalender, Fortschritt zum naechsten Tier. Feed: Streak-Leiste. Session CTA. Benachrichtigungen verdrahten. Transparenz-Seite Abschnitt
- **Komplexitaet:** M

### Phase 123 -- Badges & Civic Character Sheet (Phase 2)

- **Beschreibung:** Badge-Definitionen + Criteria JSONB. `BadgeService.checkAndAward()`. Civic Character Sheet: 6 Attribute (1-20 Skala), Hexagon/Radar-Chart (SVG). Freischaltung ab 10/30 Abstimmungen
- **Komplexitaet:** L

### Phase 124 -- Quests, Saisons & Wrapped (Phase 2)

- **Beschreibung:** Wochentliche Quests + Story-Quests. 90-Tage-Saisons mit 30 Stufen. Demokratie-Wrapped Jahresreport (10 Slides, Stories-Format, OG-Image pro Slide)
- **Komplexitaet:** L

---

## H. Deliberation & Diskussion (125-142)

### Phase 125 -- tRPC Topics CRUD

- **Beschreibung:** `topics.create` (Titel, Beschreibung, Kategorie, Tags, Voting-Format, Dauer). `topics.update` (nur Draft). Free-Tier-Limit (5/Monat). `topics.getById`
- **Komplexitaet:** M

### Phase 126 -- Topics Support & Close

- **Beschreibung:** `topics.support` (Unterstuetzen-Button, DB-Trigger fuer Auto-Aktivierung bei 10). `topics.close` (Moderator-only). Benachrichtigung bei Aktivierung
- **Komplexitaet:** M

### Phase 127 -- tRPC Comments List

- **Beschreibung:** `comments.list`: Sortierung (Bridging/Chrono/Votes), Filter (Pro/Contra/Neutral), Cursor-Pagination. 2-Ebenen-Verschachtelung. JOIN Profil-Daten + has_rated + user_vote_position
- **Komplexitaet:** M

### Phase 128 -- tRPC Comments Create & Update

- **Beschreibung:** `comments.create` (Position, Sources, ParentId, Max 2000 Zeichen, Max 2 Ebenen). `comments.update` (innerhalb 15 Min). Markdown-Sanitisierung. Gamification-Hook (+20/+25 Punkte)
- **Komplexitaet:** M

### Phase 129 -- tRPC Comments Rate (mit Voter Position)

- **Beschreibung:** `comments.rate` (Upvote/Downvote/Toggle). Speichert voter_position (Stimme des Bewertenden auf dem Topic). Keine Selbst-Bewertung. Trigger aktualisiert Zaehler
- **Komplexitaet:** M

### Phase 130 -- tRPC Comments Report

- **Beschreibung:** `comments.report` (Grund: spam/hate_speech/misinformation/...). Privilege Tier >= 1 erforderlich. Trigger setzt is_flagged. Duplikat-Schutz
- **Komplexitaet:** S

### Phase 131 -- Bridging Score Algorithmus & Cron

- **Beschreibung:** Phase-1-Algorithmus: `min(upvotes_from_yes, upvotes_from_no) / max(...)`. SQL-Batch-Update. Cron alle 60 Min. Inline-Neuberechnung bei Rating. Benachrichtigung bei >0.7
- **Dateien:** `src/server/lib/bridging.ts`, Cron Handler
- **Komplexitaet:** M

### Phase 132 -- UI: Comment Card

- **Beschreibung:** Position-Icon (Pro=ThumbsUp, Contra=ThumbsDown, Neutral=Minus), Autor-Info, Markdown-Content, Quellen-Links, Up/Down-Buttons mit Zaehler, Bridging-Badge (>0.7), Antwort-Button, Report-Button. Optimistic Updates
- **Komplexitaet:** M

### Phase 133 -- UI: Comment Form

- **Beschreibung:** Position-Selektor (3 Toggle-Buttons), Textarea (2000 Zeichen + Counter), Markdown-Toolbar (Bold/Italic/Link/Liste), Preview-Toggle, Quellen-URLs (max 5). Reply-Modus. 15-Min-Edit
- **Komplexitaet:** M

### Phase 134 -- UI: Comment Section mit Filter & Sort

- **Beschreibung:** Filter-Tabs (Alle/Pro/Contra/Neutral mit Zaehler), Sort-Dropdown (Bridging/Neueste/Meiste Stimmen), Infinite Scroll, Supabase Realtime fuer neue Kommentare, Leer-Zustand
- **Komplexitaet:** M

### Phase 135 -- UI: Report Dialog

- **Beschreibung:** Modal: Vordefinierte Gruende (Radio), optionale Details (500 Zeichen), Link zu Community Guidelines. Success Toast. Fehler-States
- **Komplexitaet:** S

### Phase 136 -- UI: Topic Lifecycle & Supporter Bar

- **Beschreibung:** Status-Badge (Entwurf/Wartend/Aktiv/Abgeschlossen/Archiviert), Supporter-Fortschrittsbalken, "Unterstuetzen"-Button, Lifecycle-Timeline, Entwurf-Bearbeitung
- **Komplexitaet:** M

### Phase 137 -- Moderations-Queue UI

- **Beschreibung:** Admin-Seite: Gemeldete Inhalte + Wartende Themen Tabs. Aktionen: Bestaetigen/Abweisen/Eskalieren. Reporter +3 Reputation. Audit Log
- **Komplexitaet:** M

### Phase 138 -- Topic Kategorien Konstanten

- **Beschreibung:** 10 Kategorien als geteilte Konstante: Umwelt & Klima, Wirtschaft, Bildung, Gesundheit, Digitales, Soziales, Sicherheit, Finanzen, Wohnen, Europa. Mit Icons (Lucide)
- **Komplexitaet:** S

### Phase 139-142 -- Integration & End-to-End

- **139:** Kommentar-Bereich in Topic Detail verdrahten
- **140:** Benachrichtigungstrigger verdrahten (comment_reply, bridging_achievement, topic_activated)
- **141:** topics.comment_count Konsistenz sicherstellen
- **142:** Bridging-Cron in vercel.json + Accessibility-Check aller Komponenten

---

## I. Feed, Suche & Benachrichtigungen (143-155)

### Phase 143 -- Feed Scoring Funktion

- **Beschreibung:** Regelbasiert (keine KI). Chronologische Basis (48h Halbwertszeit). Boosts: Aktives Fenster +100%, Kategorie-Match +50%, Wahlkreis +30%, Engagement-Velocity +20%, Sitzungswoche +50%. 80/20 Bundestag/Buerger Ratio. Alle Konstanten exportiert fuer Transparenz-Seite
- **Dateien:** `src/server/lib/feed/score.ts`, `src/server/lib/feed/ratio-enforcer.ts`, `src/server/lib/feed/constants.ts`, Unit Tests
- **Komplexitaet:** M

### Phase 144 -- Redis Caching Layer fuer Feed

- **Beschreibung:** Anonymous Feed Cache (60s TTL). Topic-Metadata Cache. Trending Cache. Session-Week Flag. Cache-Invalidierung bei neuen Topics/Votes
- **Komplexitaet:** M

### Phase 145 -- Feed tRPC Router

- **Beschreibung:** `feed.home` (Auth optional, personalisiert wenn eingeloggt), `feed.trending` (Top 5 nach Engagement-Velocity). Cursor-Pagination. Bookmarks: `feed.bookmark`, `feed.bookmarks`, `feed.isBookmarked`
- **Komplexitaet:** M

### Phase 146 -- Meilisearch Setup & Konfiguration

- **Beschreibung:** Meilisearch Client, Topics + Comments Indexes, Deutsche Sprache, Typo-Toleranz, Custom Dictionary (Bundestag-Begriffe). Setup-Script fuer Index-Erstellung
- **Dateien:** `src/server/lib/search/client.ts`, `src/server/lib/search/index-config.ts`, `src/server/lib/search/sync.ts`
- **Komplexitaet:** M

### Phase 147 -- Search tRPC Router

- **Beschreibung:** `search.query` (Proxy zu Meilisearch, Filter, Sort) + `search.suggest` (Autocomplete, 5 Vorschlaege). Matching-Highlighting
- **Komplexitaet:** M

### Phase 148 -- Notification System Core

- **Beschreibung:** tRPC `notifications.list`, `notifications.unreadCount`, `notifications.markAsRead`, `notifications.markAllAsRead`. Notification Creation Service. 11 Typen. User-Preferences respektieren
- **Komplexitaet:** M

### Phase 149 -- Notification Trigger Verdrahtung

- **Beschreibung:** Trigger fuer alle 11 Typen: new_vote, vote_result, bundestag_result, comment_reply, bridging_achievement, streak_milestone, quest_complete, wahlkreis_update, mdb_voted, topic_activated, system. Zentrale Trigger-Registry
- **Komplexitaet:** M

### Phase 150 -- Web Push Notifications

- **Beschreibung:** VAPID Keys, `push_subscriptions` Tabelle, Web Push API, Service Worker Push Handler. Opt-in Flow. Max 3 Push/Tag. Nur: new_vote, bundestag_result, streak_milestone
- **Komplexitaet:** M

### Phase 151 -- Transaktionale Emails (Resend)

- **Beschreibung:** 9 Email-Templates mit @react-email: Willkommen, Verifizierung, Magic Link, Passwort-Reset, Woechentlicher Digest, Abstimmungs-Ergebnis, Bundestag-Vergleich, Account-Loeschung, Datenexport. Design: Minimalistisch + Indigo CTA. Digest-Cron Montag 8:00 CET
- **Komplexitaet:** L

### Phase 152 -- Supabase Realtime Integration

- **Beschreibung:** Live Vote Counter (postgres_changes auf vote_results). Presence Channel (aktive Voter). Notification Badge Updates. Feed New-Topic Broadcasts
- **Komplexitaet:** M

### Phase 153 -- Feed Algorithm Transparenz-Seite

- **Beschreibung:** `/transparenz/algorithmus`: Alle Boost-Faktoren mit Gewichtung (aus `constants.ts`). Erklaerung Bridging. "Was wir NICHT tun". Oeffentlich, SEO-optimiert
- **Komplexitaet:** S

### Phase 154 -- Nachrichtenkontext pro Topic (FEED-09)

- **Beschreibung:** "Hintergrund lesen" Sektion: 2-3 kuratierte Links (Quelle-Icon, Titel, Datum). In-App-Browser (iframe Overlay). Auf Whitelist beschraenkt
- **Komplexitaet:** M

### Phase 155 -- Trending & Gespeicherte Themen

- **Beschreibung:** Trending-Sidebar (Top 5). Bookmarks-Tabelle + Lesezeichen-Button. `/feed/gespeichert` Seite
- **Komplexitaet:** M

---

## J. Karte & Visualisierung (156-164)

### Phase 156 -- Mapbox Setup & GeoJSON Pipeline

- **Beschreibung:** Mapbox Account + Token. Bundeswahlleiter GeoJSON -> TopoJSON (<2MB). Processing Script. react-map-gl Base Component. Light/Dark Styles. Touch-Gesten
- **Komplexitaet:** L

### Phase 157 -- Wahlkreis Choropleth & Styling

- **Beschreibung:** Fill-Layer mit Indigo-Intensitaet (Stufe 1-5). Eigener Wahlkreis hervorgehoben. Tap/Click Interaktivitaet. Hover-Tooltip (Desktop). Live-Pulse bei Votes
- **Komplexitaet:** M

### Phase 158 -- Bottom Sheet Wahlkreis-Dashboard

- **Beschreibung:** Name + Nummer, Stufe (1-5), Fortschrittsbalken, MdB (Foto + Name + Fraktion), Top 3 Themen, Wochen-Stats. Desktop: Side Panel
- **Komplexitaet:** M

### Phase 159 -- Chart Component Library

- **Beschreibung:** Recharts-basiert. Balken-, Kreis/Donut-, Vergleichs-, Fraktions-Charts. Hexagon/Radar (Civic Character Sheet). Fortschrittsbalken. Odometer. Alles WCAG-konform, Dark Mode
- **Komplexitaet:** L

### Phase 160 -- Oeffentliches Ergebnis-Dashboard (ERG-01)

- **Beschreibung:** `/themen/[id]/ergebnis` (kein Login). Balken + Kreisdiagramm. Bundestag-Vergleich wenn zutreffend. OG-Meta-Tags. Share-Link
- **Komplexitaet:** M

### Phase 161 -- OG Image & Share Card Generation (ERG-09)

- **Beschreibung:** `@vercel/og` (Satori). "Ich habe abgestimmt" Share Card in 3 Formaten (Instagram 9:16, WhatsApp 1:1, Twitter 16:9). Ergebnis-OG-Image. Fonts: Inter + Geist Mono als .woff. Share Modal mit Format-Picker + Web Share API
- **Komplexitaet:** M

### Phase 162 -- Echtzeit-Teilnahme-Zaehler (ERG-10)

- **Beschreibung:** Supabase Realtime Presence. Odometer-Animation. Pulsierender Indigo-Punkt. Fallback bei <5 Nutzern. Sitzungswoche-Verstaerkung
- **Komplexitaet:** M

### Phase 163 -- Feedback-Loop Visualisierung (ERG-08)

- **Beschreibung:** "Vom Gedanken zum Gesetz" 4 Schritte: Du hast abgestimmt -> Wahlkreis-Ergebnis -> Email an MdB -> Bundestag hat abgestimmt. Animierte Checkmarks. Integration in Topic Detail + /profil/wirkung
- **Komplexitaet:** M

### Phase 164 -- Karte Tab Zusammenbau & Polish

- **Beschreibung:** `/karte` als vollstaendiger Tab. Lazy Loading (Mapbox Bundle). Performance <2s auf 4G. Realtime-Verdrahtung. Keyboard-Navigation. Accessibility Audit
- **Komplexitaet:** M

---

## K. Admin, Legal & Compliance (165-180)

### Phase 165 -- Admin Layout & Auth Guard

- **Beschreibung:** Route Group `(admin)`. Privilege-Tier-Pruefung (>=3 Moderation, >=4 alles). Admin Sidebar Navigation. Desktop-only Layout. "Zurueck zur App" Link
- **Komplexitaet:** M

### Phase 166 -- Admin Dashboard (ADM-01)

- **Beschreibung:** Stats-Karten: Nutzer, WAV, Votes, offene Reports, Sync-Status. Mini-Trend-Charts. Quick Actions
- **Komplexitaet:** M

### Phase 167 -- Admin Moderation Queue (ADM-02)

- **Beschreibung:** Report-Liste mit Filtern. Detail-Panel. Aktionen: Bestaetigen (Content ausblenden, +3 Rep), Abweisen, Eskalieren. Audit Log
- **Komplexitaet:** M

### Phase 168 -- Admin Nutzerverwaltung (ADM-03)

- **Beschreibung:** Nutzer-Suche/Liste. Detail-Ansicht mit Aktivitaets-Zusammenfassung. Admin-Aktionen (Tier >= 4): Privilege anpassen, Suspendieren, Account loeschen
- **Komplexitaet:** M

### Phase 169 -- Admin Sync Monitoring (ADM-04)

- **Beschreibung:** Sync-Status (DIP + AW), Sync-Historie (letzte 50 Runs), Fehler-Details, Manueller Sync-Trigger. `sync_runs` Tabelle
- **Komplexitaet:** M

### Phase 170 -- Admin Analytics (ADM-05)

- **Beschreibung:** Registrierungs-Trend, DAU/WAU, Votes/Tag, Bridging-Score-Trend, Kohortenanalyse, Funnel, Verteilungen
- **Komplexitaet:** M

### Phase 171 -- Admin System Health (ADM-06)

- **Beschreibung:** Service-Status (Supabase, Redis, Meilisearch, Vercel, externe APIs). `/api/health` Endpoint. Sentry Error-Rate. Performance-Metriken
- **Komplexitaet:** M

### Phase 172 -- Admin Audit Log (ADM-07)

- **Beschreibung:** Durchsuchbare, filterbare Tabelle. Tier >= 4. CSV-Export
- **Komplexitaet:** M

### Phase 173 -- Feature Flags (ADM-08)

- **Beschreibung:** `feature_flags` Tabelle. Admin UI: Toggle + Rollout-%. Client Hook `useFeatureFlag()`. Server Helper `isFeatureEnabled()`. Deterministische User-Zuordnung
- **Komplexitaet:** M

### Phase 174 -- MDX Infrastructure fuer Legal Pages

- **Beschreibung:** MDX Pipeline Setup. Legal Layout (Reading Mode, TOC). Custom MDX Components. Versionierung
- **Komplexitaet:** M

### Phase 175 -- Legal Pages Content (LEGAL-01 bis 04)

- **Beschreibung:** AGB, Datenschutzerklaerung (mehrschichtig), Impressum, Community Guidelines. Alle als MDX, SSG. Entwurfs-Texte (Anwalt-Review ausstehend)
- **Komplexitaet:** M

### Phase 176 -- Cookie Consent (LEGAL-05)

- **Beschreibung:** Bottom Banner (nicht blockierend): "Nur notwendige" (Standard) + "Alle akzeptieren". localStorage. Analytics nur mit Opt-in. Einstellungen aenderbar
- **Komplexitaet:** S

### Phase 177 -- Art. 9 Consent Flow (LEGAL-06)

- **Beschreibung:** Bottom Sheet vor erster Abstimmung. Verstaendliche Erklaerung. Checkbox + Einwilligungs-Button. Widerruf in Einstellungen (loescht alle Votes). Vote-Guard in votes.cast
- **Komplexitaet:** M

### Phase 178 -- Accessibility Audit Infrastructure

- **Beschreibung:** axe-core + Playwright Tests fuer alle kritischen Seiten. WCAG 2.1 AA. GitHub Actions Job. Skip Navigation. ARIA Landmarks. Focus Indicators. `lang="de"`
- **Komplexitaet:** M

### Phase 179 -- Accessibility Settings & Motion

- **Beschreibung:** Font Size Control, High Contrast Toggle, Reduced Motion Toggle. `prefers-reduced-motion` global unterstuetzen. Alle Animationen wrappen
- **Komplexitaet:** M

### Phase 180 -- Transparenz-Seiten

- **Beschreibung:** `/transparenz` Hub. `/transparenz/algorithmus` (Feed-Algo). `/transparenz/punktesystem` (alle Punktwerte). `/transparenz/bridging` (Bridging-Erklaerung). SSG/MDX
- **Komplexitaet:** M

---

## L. PWA, Testing & Launch (181-200)

### Phase 181 -- Service Worker: Caching Strategien

- **Beschreibung:** Serwist Konfiguration: Cache-First fuer statische Assets (JS/CSS/Fonts/Images). Network-First fuer API-Calls. Stale-While-Revalidate fuer Feed. Precache App Shell. Cache-Versioning
- **Komplexitaet:** M

### Phase 182 -- Offline Fallback & Vote Queueing

- **Beschreibung:** Offline-Seite ("Du bist offline. Deine naechste Abstimmung wird gespeichert."). IndexedDB Queue fuer Offline-Votes. Background Sync bei Reconnect (Phase 2: PWA-05)
- **Komplexitaet:** M

### Phase 183 -- Install Prompt & Splash Screen

- **Beschreibung:** beforeinstallprompt Event abfangen. Custom Install Banner. Splash Screen korrekt (Icon + Name + Hintergrundfarbe). iOS Add-to-Homescreen Optimierung
- **Komplexitaet:** S

### Phase 184 -- Native-feel Animationen (PWA-06)

- **Beschreibung:** Smooth Page Transitions, Haptic Feedback (Vibration API), Swipe-Gesten, 60fps Scroll, Bottom Sheet Physik. Kein sichtbarer Browser-Chrome nach Installation
- **Komplexitaet:** M

### Phase 185 -- Pull-to-Refresh (PWA-08)

- **Beschreibung:** Touch-basiert: Pull-down Geste erkennen, Spinner anzeigen, Feed neu laden. Overscroll-Behavior konfigurieren. Custom Animation
- **Komplexitaet:** S

### Phase 186 -- Unit Test Setup (Vitest)

- **Beschreibung:** Vitest Konfiguration. Tests fuer: Bridging-Algorithmus, Vote-Event-Hashing, Feed-Scoring, Punkte-Berechnung, Streak-Logik (CET/CEST), Tier-Berechnung
- **Dateien:** `vitest.config.ts`, Test-Dateien fuer alle Business-Logic-Module
- **Komplexitaet:** L

### Phase 187 -- Integration Tests (tRPC Procedures)

- **Beschreibung:** Tests fuer kritische tRPC-Prozeduren: votes.cast (inkl. Event Store Integritaet), comments.create (inkl. Bridging-Update), topics.create + support + activate, auth.deleteAccount
- **Komplexitaet:** L

### Phase 188 -- E2E Tests (Playwright)

- **Beschreibung:** Kritische Flows: Registrierung -> Verifizierung -> Login -> Onboarding -> Erste Abstimmung -> Art.9 Consent -> Ergebnis. Topic erstellen -> Unterstuetzen -> Aktivierung. Kommentieren -> Bewerten
- **Dateien:** `tests/e2e/`, Playwright Config
- **Komplexitaet:** L

### Phase 189 -- Lighthouse CI Integration

- **Beschreibung:** Lighthouse CI in GitHub Actions auf PRs. Assertions: Performance >90, Accessibility >90, Best Practices >90, SEO >90. LCP <2000ms, CLS <0.1
- **Komplexitaet:** M

### Phase 190 -- Performance Optimierung: Code Splitting

- **Beschreibung:** Analyse des Bundle mit `@next/bundle-analyzer`. Dynamic Imports fuer: Mapbox, Recharts, Markdown-Renderer. Route-basiertes Code Splitting. Tree Shaking pruefen
- **Komplexitaet:** M

### Phase 191 -- Performance: Font & Image Optimierung

- **Beschreibung:** `next/font` Subset-Loading. Font-Display: swap. Image Optimization mit `next/image`. WebP/AVIF. Lazy Loading fuer Below-the-Fold Images. Preload kritischer Fonts
- **Komplexitaet:** S

### Phase 192 -- SEO Optimierung

- **Beschreibung:** `generateMetadata()` auf allen Seiten. OG-Tags. Sitemap (`/sitemap.xml`). robots.txt. Strukturierte Daten (JSON-LD fuer Organization). Canonical URLs. German hreflang
- **Komplexitaet:** M

### Phase 193 -- Barrierefreiheits-Audit (Final)

- **Beschreibung:** Manueller Test mit NVDA/VoiceOver. Tastaturnavigation komplett durchgehen. Farbkontraste verifizieren. axe-core Ergebnisse = 0 Violations. BITV 2.0 Checkliste (Anhang E) abarbeiten
- **Komplexitaet:** M

### Phase 194 -- Security Hardening

- **Beschreibung:** CSP Headers feintunen. Rate Limiting verifizieren. CSRF-Schutz (SameSite Cookies). SQL Injection Check (Supabase RLS). XSS Check. npm audit. Basis-Penetrationstest
- **Komplexitaet:** M

### Phase 195 -- Datenbank-Performance Tuning

- **Beschreibung:** EXPLAIN ANALYZE auf kritischen Queries. Index-Nutzung verifizieren. Connection Pooling pruefen. Slow Query Logging. Query p95 <50ms
- **Komplexitaet:** M

### Phase 196 -- Monitoring & Alerting Setup

- **Beschreibung:** Sentry Alerts konfigurieren. Health-Check Endpoints fuer alle Services. Grafana Cloud Dashboard (wenn Budget). Better Uptime externer Ping
- **Komplexitaet:** M

### Phase 197 -- Bundestag-Daten Pre-Load

- **Beschreibung:** 50+ Bundestag-Topics importieren und verifizieren. Zusammenfassungen generieren. Quiz-Fragen erstellen. News-Links kuratieren. MdB-Daten vollstaendig
- **Komplexitaet:** M

### Phase 198 -- DSFA Dokumentation

- **Beschreibung:** Datenschutz-Folgenabschaetzung (Art. 35 DSGVO) dokumentieren. Anhang D des PRD als Vorlage. Muss vor Launch abgeschlossen sein
- **Komplexitaet:** M

### Phase 199 -- Pre-Launch Checkliste

- **Beschreibung:** Alle Launch-Kriterien pruefen: 50+ Topics, Vote-Typen funktionsfaehig, <2s Load, Lighthouse >90, WCAG AA, DSFA done, Pentest done, Legal Pages online, Cookie Banner, Art.9 Flow, DPMA-Recherche
- **Komplexitaet:** M

### Phase 200 -- Launch & Deployment

- **Beschreibung:** Production Deployment auf Vercel. Supabase Production-Projekt. DNS/Domain konfigurieren. SSL verifizieren. Smoke Tests auf Production. Monitoring aktiv. Erste Nutzer einladen
- **Komplexitaet:** M

---

## Abhaengigkeits-Reihenfolge (Empfohlen)

```
Batch 1: A. Foundation (001-016)
Batch 2: B. Datenbank (017-041)
Batch 3: C. Auth (042-049) + D.050-056 (API Clients)
Batch 4: E. Voting (068-077) + D.057-067 (KI Pipeline, Crons)
Batch 5: F. Frontend Core (078-092) + H. Diskussion (125-138)
Batch 6: G. Gamification (113-124) + I. Feed/Suche (143-155)
Batch 7: J. Karte/Viz (156-164) + K. Admin/Legal (165-180)
Batch 8: F. Restliche Seiten (093-112)
Batch 9: L. PWA/Testing/Launch (181-200)
```

---

_Dieses Dokument ist der vollstaendige Implementierungsplan fuer die Demokrat-Plattform._
_Generiert am 30. Maerz 2026 basierend auf PRD v1.0 Final (2827 Zeilen)._
