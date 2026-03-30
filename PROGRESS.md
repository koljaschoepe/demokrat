# Demokrat -- Implementierungs-Fortschritt

> **Letzte Aktualisierung:** 2026-03-30
> **Aktuelle Phase:** 008
> **Abgeschlossene Phasen:** 7 / 200

## Status-Legende

- [ ] Offen
- [x] Abgeschlossen
- [~] In Bearbeitung

---

## A. Projekt-Foundation (001-016)

- [x] 001 -- Git Repository & Projektstruktur
- [x] 002 -- Next.js 15 + TypeScript Strict
- [x] 003 -- Tailwind CSS + shadcn/ui + Design Tokens
- [x] 004 -- Umgebungsvariablen & .env
- [x] 005 -- Supabase Projekt-Setup (Lokal)
- [x] 006 -- tRPC Setup mit App Router
- [x] 007 -- ESLint + Prettier
- [ ] 008 -- Projektordner-Struktur
- [ ] 009 -- Base Layouts, Metadata & Fonts
- [ ] 010 -- Dark Mode (next-themes)
- [ ] 011 -- PWA Manifest & Service Worker (Basis)
- [ ] 012 -- i18n Setup (next-intl)
- [ ] 013 -- Upstash Redis Client & Rate Limiting
- [ ] 014 -- Sentry Error Tracking
- [ ] 015 -- GitHub Actions CI/CD
- [ ] 016 -- Vercel Deployment

## B. Datenbank & Schema (017-041)

- [ ] 017 -- Supabase Migration Workflow & Baseline
- [ ] 018 -- Wahlkreise-Tabelle + Seed
- [ ] 019 -- Profiles-Tabelle + RLS
- [ ] 020 -- User Preferences + RLS
- [ ] 021 -- Topics-Tabelle + Indexes + RLS
- [ ] 022 -- Topic Tags & Supporters
- [ ] 023 -- Topic News Links
- [ ] 024 -- Bundestag Vorgaenge
- [ ] 025 -- Bundestag Abstimmungen
- [ ] 026 -- MdB Stammdaten
- [ ] 027 -- MdB Einzelstimmen
- [ ] 028 -- Vote Events (Event Store)
- [ ] 029 -- Vote Results (Projektion)
- [ ] 030 -- Comments + RLS
- [ ] 031 -- Comment Ratings
- [ ] 032 -- Reputation Events
- [ ] 033 -- Badges & User Badges
- [ ] 034 -- Groups & Group Members
- [ ] 035 -- Reports + RLS
- [ ] 036 -- Audit Log + RLS
- [ ] 037 -- Notifications + Index
- [ ] 038 -- Streaks & Daily Activity
- [ ] 039 -- Session Content & Daily Sessions
- [ ] 040 -- Platform Metrics & Wahlkreis Stats
- [ ] 041 -- Volltextsuche, Trigger & DB-Funktionen

## C. Auth & User Management (042-049)

- [ ] 042 -- Supabase Auth Foundation & Webhook
- [ ] 043 -- Auth Middleware & Session Management
- [ ] 044 -- Registrierung, Login & Magic Link UI
- [ ] 045 -- tRPC Auth & Users Router
- [ ] 046 -- Onboarding Flow (4 Screens)
- [ ] 047 -- Profil-Seite & Einstellungen
- [ ] 048 -- OAuth (Google/Apple) & Oeffentliches Profil
- [ ] 049 -- Art. 9 Consent, Cookie Banner & Auth Polish

## D. Bundestag-Datenpipeline (050-067)

- [ ] 050 -- DIP API TypeScript Client
- [ ] 051 -- DIP API Mapper & Sync-Logik
- [ ] 052 -- abgeordnetenwatch API Client
- [ ] 053 -- abgeordnetenwatch Mapper & Sync
- [ ] 054 -- MdB-Stammdaten Import
- [ ] 055 -- Bundestag Sync Cron Job
- [ ] 056 -- Sitzungswochen-Management
- [ ] 057 -- KI-Zusammenfassungen (OpenAI GPT-4o)
- [ ] 058 -- Quiz-Fragen-Generierung
- [ ] 059 -- Nachrichtenlink-Kuratierung
- [ ] 060 -- tRPC Bundestag Router
- [ ] 061 -- UI: Vorgang-Timeline
- [ ] 062 -- UI: MdB-Profil-Seite
- [ ] 063 -- UI: Bundestag-Filter & Suche
- [ ] 064 -- Vote-Closing Cron Job
- [ ] 065 -- Content Pipeline Orchestrierung
- [ ] 066 -- Meilisearch Index-Sync Cron
- [ ] 067 -- Drucksache-PDF Link

## E. Voting Engine (068-077)

- [ ] 068 -- Hash Chain Computation
- [ ] 069 -- Vote Results Projektion Trigger
- [ ] 070 -- tRPC Votes: Cast, Change, Revoke, MyVote
- [ ] 071 -- tRPC Votes: Results & Comparison
- [ ] 072 -- Ja/Nein/Enthaltung UI + Zeitfenster
- [ ] 073 -- Multiple Choice UI
- [ ] 074 -- Stimme Aendern & Zurueckziehen
- [ ] 075 -- Echtzeit Vote Counter
- [ ] 076 -- Ergebnis-Charts (Balken, Kreis)
- [ ] 077 -- Buerger vs. Bundestag Vergleich

## F. Frontend Core & Design (078-112)

- [ ] 078 -- Reusable UI-Komponenten Basis
- [ ] 079 -- Bottom Sheet Komponente
- [ ] 080 -- Bottom Navigation Bar
- [ ] 081 -- Desktop Sidebar & Responsive Layout
- [ ] 082 -- Landing Page
- [ ] 083 -- Home Feed Seite
- [ ] 084 -- Feed Topic Card
- [ ] 085 -- Topic Detail Seite
- [ ] 086 -- Thema Erstellen Formular
- [ ] 087 -- Suche Seite
- [ ] 088 -- Benachrichtigungen
- [ ] 089 -- Einstellungen Sub-Seiten
- [ ] 090 -- Empty States
- [ ] 091 -- Loading & Skeleton States
- [ ] 092 -- Animationen & Transitionen
- [ ] 093 -- Taegliche Session Seite
- [ ] 094 -- Meine Wirkung Seite
- [ ] 095 -- Demokratie-Karte Seite
- [ ] 096-112 -- Weitere Seiten & Komponenten

## G. Gamification Engine (113-124)

- [ ] 113 -- Punkte-Service
- [ ] 114 -- Streak-Logik
- [ ] 115 -- Privileg-Stufen
- [ ] 116 -- Session Content Pipeline
- [ ] 117 -- Session Flow API
- [ ] 118 -- Session Flow UI
- [ ] 119 -- Wahlkreis-Stats Aggregation
- [ ] 120 -- Sitzungswoche Live-Modus
- [ ] 121 -- Demokratie-Puls
- [ ] 122 -- Gamification UI Integration
- [ ] 123 -- Badges & Civic Character Sheet (Phase 2)
- [ ] 124 -- Quests, Saisons & Wrapped (Phase 2)

## H. Deliberation & Diskussion (125-142)

- [ ] 125 -- tRPC Topics CRUD
- [ ] 126 -- Topics Support & Close
- [ ] 127 -- tRPC Comments List
- [ ] 128 -- tRPC Comments Create & Update
- [ ] 129 -- tRPC Comments Rate
- [ ] 130 -- tRPC Comments Report
- [ ] 131 -- Bridging Score Algorithmus & Cron
- [ ] 132 -- UI: Comment Card
- [ ] 133 -- UI: Comment Form
- [ ] 134 -- UI: Comment Section
- [ ] 135 -- UI: Report Dialog
- [ ] 136 -- UI: Topic Lifecycle & Supporter Bar
- [ ] 137 -- Moderations-Queue UI
- [ ] 138 -- Topic Kategorien Konstanten
- [ ] 139-142 -- Integration & End-to-End

## I. Feed, Suche & Benachrichtigungen (143-155)

- [ ] 143 -- Feed Scoring Funktion
- [ ] 144 -- Redis Caching Layer
- [ ] 145 -- Feed tRPC Router
- [ ] 146 -- Meilisearch Setup
- [ ] 147 -- Search tRPC Router
- [ ] 148 -- Notification System Core
- [ ] 149 -- Notification Trigger Verdrahtung
- [ ] 150 -- Web Push Notifications
- [ ] 151 -- Transaktionale Emails (Resend)
- [ ] 152 -- Supabase Realtime Integration
- [ ] 153 -- Feed Algorithm Transparenz-Seite
- [ ] 154 -- Nachrichtenkontext pro Topic
- [ ] 155 -- Trending & Gespeicherte Themen

## J. Karte & Visualisierung (156-164)

- [ ] 156 -- Mapbox Setup & GeoJSON Pipeline
- [ ] 157 -- Wahlkreis Choropleth & Styling
- [ ] 158 -- Bottom Sheet Wahlkreis-Dashboard
- [ ] 159 -- Chart Component Library
- [ ] 160 -- Oeffentliches Ergebnis-Dashboard
- [ ] 161 -- OG Image & Share Card Generation
- [ ] 162 -- Echtzeit-Teilnahme-Zaehler
- [ ] 163 -- Feedback-Loop Visualisierung
- [ ] 164 -- Karte Tab Zusammenbau & Polish

## K. Admin, Legal & Compliance (165-180)

- [ ] 165 -- Admin Layout & Auth Guard
- [ ] 166 -- Admin Dashboard
- [ ] 167 -- Admin Moderation Queue
- [ ] 168 -- Admin Nutzerverwaltung
- [ ] 169 -- Admin Sync Monitoring
- [ ] 170 -- Admin Analytics
- [ ] 171 -- Admin System Health
- [ ] 172 -- Admin Audit Log
- [ ] 173 -- Feature Flags
- [ ] 174 -- MDX Infrastructure
- [ ] 175 -- Legal Pages Content
- [ ] 176 -- Cookie Consent
- [ ] 177 -- Art. 9 Consent Flow
- [ ] 178 -- Accessibility Audit Infrastructure
- [ ] 179 -- Accessibility Settings & Motion
- [ ] 180 -- Transparenz-Seiten

## L. PWA, Testing & Launch (181-200)

- [ ] 181 -- Service Worker: Caching Strategien
- [ ] 182 -- Offline Fallback
- [ ] 183 -- Install Prompt & Splash Screen
- [ ] 184 -- Native-feel Animationen
- [ ] 185 -- Pull-to-Refresh
- [ ] 186 -- Unit Test Setup (Vitest)
- [ ] 187 -- Integration Tests
- [ ] 188 -- E2E Tests (Playwright)
- [ ] 189 -- Lighthouse CI Integration
- [ ] 190 -- Performance: Code Splitting
- [ ] 191 -- Performance: Font & Image
- [ ] 192 -- SEO Optimierung
- [ ] 193 -- Barrierefreiheits-Audit (Final)
- [ ] 194 -- Security Hardening
- [ ] 195 -- Datenbank-Performance Tuning
- [ ] 196 -- Monitoring & Alerting Setup
- [ ] 197 -- Bundestag-Daten Pre-Load
- [ ] 198 -- DSFA Dokumentation
- [ ] 199 -- Pre-Launch Checkliste
- [ ] 200 -- Launch & Deployment
