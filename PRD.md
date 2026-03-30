# Product Requirements Document

## Demokrat: Digitale Demokratieplattform fur Deutschland

---

| | |
|---|---|
| **Version** | 1.1.0 |
| **Status** | Final |
| **Autor** | [Name einfugen] |
| **Datum** | 30. Marz 2026 |
| **Projektname** | Demokrat (Arbeitstitel) |

### Anderungshistorie

| Version | Datum | Autor | Anderungen |
|---------|-------|-------|------------|
| 0.1.0 | 30.03.2026 | -- | Initiale Erstellung des PRD |
| 0.2.0 | 30.03.2026 | -- | Design System, kooperative Gamification, Demokratie-Wrapped, Sitzungswoche-Live, Civic Quests, Teams |
| 1.0.0 | 30.03.2026 | -- | Finalisierung: Onboarding-Flow, Politischer Charakter, Hybrid-News-Feed, Karten-Tab, kompaktes Wahlkreis-Dashboard, alle offenen Fragen geschlossen |
| 1.1.0 | 30.03.2026 | -- | PRD-Review: 3 Design-Widerspruche behoben, KI-Content-Policy (ADR-004 rev.), 10 fehlende DB-Tabellen, Landing Page, Rechtliche Must-Haves (LEGAL-01-06), Benachrichtigungstypen, Email-Templates, Empty States, Tech-Entscheidungen (Mapbox, Stripe, Satori, Upstash Rate Limit), Premium-Preis (4,99 EUR/Mo), Free-Limit (5 Themen/Mo) |

---

## Inhaltsverzeichnis

- [0a. Design System](#0a-design-system)
- [0b. Glossar](#0b-glossar)
- [1. Executive Summary](#1-executive-summary)
- [2. Zielgruppen & Personas](#2-zielgruppen--personas)
- [3. Funktionale Anforderungen](#3-funktionale-anforderungen)
- [4. Nicht-funktionale Anforderungen](#4-nicht-funktionale-anforderungen)
- [5. Technologie-Stack & Architektur](#5-technologie-stack--architektur)
- [6. Datenmodell](#6-datenmodell)
- [7. API-Struktur](#7-api-struktur)
- [8. Wireframes & Screens](#8-wireframes--screens)
- [9. Phasenplan](#9-phasenplan)
- [10. Risikoanalyse](#10-risikoanalyse)
- [11. Erfolgskennzahlen](#11-erfolgskennzahlen)
- [12. Wettbewerbsanalyse](#12-wettbewerbsanalyse)
- [13. Anhange](#13-anhange)
- [14. Entscheidungsprotokoll](#14-entscheidungsprotokoll)

---

## 0a. Design System

### Designphilosophie

Demokrat folgt dem Prinzip **"Calm Technology"** -- Technologie soll informieren und beruhigen, nicht Unruhe erzeugen. Das Design ist inspiriert von **Notion** (warm, grosszugig, sanfte Rundungen) und **Linear** (straffe Typografie, Struktur wird gefuhlt, nicht gesehen).

**Leitprinzipien:**
1. **Weniger ist alles.** Jedes UI-Element muss seinen Platz rechtfertigen. Im Zweifel weglassen.
2. **Struktur wird gefuhlt, nicht gesehen.** Weiche Trennlinien, grosszugiger Whitespace statt harter Borders.
3. **Ungleiche visuelle Gewichtung.** Navigation und sekundare Elemente treten zuruck; der Inhalt dominiert.
4. **Progressive Disclosure.** Komplexitat existiert, aber sie zeigt sich erst, wenn sie gebraucht wird.
5. **Typografie als Hierarchie.** Schriftgrosse und -gewicht ersetzen Farbe als primare Hierarchie-Werkzeuge.
6. **Die App verschwindet.** Das Ziel: Der Nutzer denkt an Demokratie, nicht an die App.

### Farbsystem

Die App nutzt ausschliesslich **4 Farben**: Schwarz, Weiss, Grau und Indigo. Farbe tritt nur dort auf, wo sie wirklich wichtig ist (~10% der Oberflache).

**60-30-10 Regel:**
- **60%** Dominante Flache (Weiss im Light Mode, Dunkelgrau im Dark Mode)
- **30%** Sekundare Neutrale (Grautone fur Karten, Borders, sekundarer Text)
- **10%** Akzentfarbe Indigo -- ausschliesslich fur CTAs, aktive Zustande, wichtige Interaktionen

#### Light Mode (Standard)

| Element | Farbe | Hex |
|---------|-------|-----|
| Hintergrund | Warm-Weiss | `#FAFAFA` |
| Karten/Flachen | Weiss | `#FFFFFF` |
| Text (primar) | Dunkelgrau | `#1A1A1A` |
| Text (sekundar) | Mittelgrau | `#6B7280` |
| Borders/Trennlinien | Hellgrau | `#E5E7EB` |
| Akzent (CTA, Links, aktiv) | Indigo | `#4F46E5` |
| Akzent Hover | Indigo dunkel | `#4338CA` |
| Erfolg (dezent) | Grun | `#10B981` |
| Warnung (dezent) | Amber | `#F59E0B` |
| Fehler (dezent) | Rot | `#EF4444` |

**Hinweis:** Grun, Amber und Rot werden ausschliesslich fur Systemfeedback verwendet (Erfolg, Warnung, Fehler) -- nie fur politische Inhalte oder Pro/Contra-Markierungen. Pro/Contra wird uber Typografie und Icons gelost, nicht uber Farbe (Barrierefreiheit).

#### Dark Mode (Optional)

| Element | Farbe | Hex |
|---------|-------|-----|
| Hintergrund | Fast-Schwarz | `#111111` |
| Karten/Flachen | Dunkelgrau | `#1A1A1A` |
| Text (primar) | Hellgrau | `#E5E7EB` |
| Text (sekundar) | Mittelgrau | `#9CA3AF` |
| Borders/Trennlinien | Dunkelgrau | `#2D2D2D` |
| Akzent | Indigo (heller) | `#6366F1` |

### Typografie

| Ebene | Schrift | Grosse | Gewicht | Verwendung |
|-------|--------|--------|---------|-----------|
| Display | Inter / Geist Sans | 32px | 700 | Seitentitel, Helden-Texte |
| H1 | Inter | 24px | 600 | Sektionsuberschriften |
| H2 | Inter | 20px | 600 | Kartenuberschriften |
| H3 | Inter | 16px | 600 | Unteruberschriften |
| Body | Inter | 16px | 400 | Fliesstext, Kommentare |
| Body Small | Inter | 14px | 400 | Sekundarer Text, Metadaten |
| Caption | Inter | 12px | 500 | Labels, Timestamps |
| Mono | Geist Mono | 14px | 400 | Hashes, technische Daten, Zahlen |

### Spacing & Grid

- **8px Grid-System** fur alle Abstande
- Basis-Spacing: 4px (xs), 8px (sm), 12px (md), 16px (lg), 24px (xl), 32px (2xl), 48px (3xl)
- **Karten-Padding:** 16px (mobil), 24px (desktop)
- **Seitenrander:** 16px (mobil), 32px (tablet), auto-zentriert max 680px (desktop content)
- **Kartenradius:** 12px (Notion-Stil, sanft gerundet)

### Interaktionsdesign

**Mikro-Interaktionen (Dopamin ohne visuellen Larm):**
- **Stimmabgabe:** Sanfter Bounce der gewahlten Option (200ms ease-out) + Haptic Feedback (Vibration API)
- **Streak-Anzeige:** Dezente Flammen-Animation wenn Streak wachst
- **Fortschrittsbalken:** Smooth fill-Animation (300ms) bei kollektiven Zielen
- **Ergebnis-Reveal:** Zahlen rollen hoch (Odometer-Stil) wenn Ergebnisse angezeigt werden
- **Kommentar geupvoted:** Kurzer "Thumbs-up"-Pulse (nicht ubertrieben)

**Was es NICHT gibt:**
- Kein Konfetti (zu verspielt fur eine Demokratie-Plattform)
- Keine Glow-Effekte oder Neon-Farben
- Keine animierten Emojis oder Sticker
- Keine Sound-Effekte
- Kein Auto-Play Video

**Transitionen:**
- Seitenwechsel: Sanftes Fade + leichter Slide (200ms)
- Bottom Sheet (Abstimmung): Slide-up mit Backdrop-Blur (300ms)
- Modal: Fade-in mit Scale (0.95 -> 1.0, 200ms)

### Komponentenbibliothek

Basis: **shadcn/ui** (Zinc-Farbskala) mit folgenden Anpassungen:
- Border-Radius: 12px (statt Standard 6px) fur warmeres Gefuhl
- Alle Komponenten in beiden Modi (Light/Dark) getestet
- Alle Komponenten WCAG 2.1 AA konform (Kontrast 4.5:1 Normaltext, 3:1 Grosstext)
- Focus-States: 2px Indigo Outline mit 2px Offset

### Icons

- **Lucide Icons** (konsistent mit shadcn/ui)
- Grosse: 20px (Standard), 16px (klein), 24px (gross)
- Strichstarke: 1.5px
- Farbe: Erbt Textfarbe (nie bunt, ausser Indigo fur aktive States)

### Designbeispiel: Feed-Karte

```
+------------------------------------------+
|                                          |
|  BUNDESTAG              Umwelt & Klima   |
|                                          |
|  Klimaanpassungsgesetz 2026              |
|  Massnahmen zur Anpassung an den         |
|  Klimawandel in Kommunen und Landern     |
|                                          |
|  1.204 Stimmen    87 Kommentare          |
|                                          |
|  ████████████░░░░  Noch 3 Tage           |
|                                          |
|  [        Abstimmen        ]  <- Indigo  |
|                                          |
+------------------------------------------+
```

- Karte: Weiss, 12px Radius, 1px hellgrauer Border, 16px Padding
- "BUNDESTAG": Caption, Mittelgrau, uppercase, 12px
- Kategorie-Chip: Hellgrauer Hintergrund, 8px Radius, Caption
- Titel: H2 (20px, 600 weight, Dunkelgrau)
- Beschreibung: Body Small (14px, 400, Mittelgrau), max 2 Zeilen
- Zahlen: Body Small + Mono fur Zahlen
- Fortschrittsbalken: Hellgrau Hintergrund, Indigo Fill
- Button: Indigo Hintergrund, Weiss Text, volle Breite, 12px Radius, 48px Hohe

---

## 0b. Glossar

| Begriff | Definition |
|---------|-----------|
| **Abstimmung** | Ein strukturierter Entscheidungsprozess, bei dem Nutzer ihre Meinung zu einem Thema abgeben |
| **ADR** | Architecture Decision Record -- dokumentierte Architekturentscheidung mit Kontext und Begrundung |
| **Approval Voting** | Abstimmungsformat, bei dem Nutzer alle akzeptablen Optionen ankreuzen konnen |
| **BaaS** | Backend-as-a-Service -- verwaltete Backend-Infrastruktur (Datenbank, Auth, Storage) |
| **BDSG** | Bundesdatenschutzgesetz -- deutsches Datenschutzgesetz, erganzt die DSGVO |
| **BFSG** | Barrierefreiheitsstarkungsgesetz -- seit Juni 2025 geltende Anforderungen an digitale Barrierefreiheit |
| **BITV 2.0** | Barrierefreie-Informationstechnik-Verordnung -- implementiert WCAG 2.1 AA fur deutsche offentliche Stellen |
| **Bridging-Algorithmus** | Mathematisches Verfahren, das Inhalte bevorzugt, die uber politische Lagergrenzen hinweg als hilfreich bewertet werden (inspiriert von X/Twitter Community Notes) |
| **Burgerinitiative** | Von Nutzern erstelltes Thema mit Abstimmung auf der Plattform |
| **CQRS** | Command Query Responsibility Segregation -- Trennung von Schreib- und Lesepfaden in der Architektur |
| **DIP API** | Dokumentations- und Informationssystem fur Parlamentsmaterialien -- offizielle Bundestag-Daten-API |
| **Drucksache** | Offizielles Bundestagsdokument (Gesetzentwurf, Antrag, Beschlussempfehlung etc.) |
| **DSFA** | Datenschutz-Folgenabschatzung -- Risikoanalyse fur Datenverarbeitungen mit hohem Risiko (Art. 35 DSGVO) |
| **DSGVO** | Datenschutz-Grundverordnung -- EU-weites Datenschutzrecht (= GDPR) |
| **eID** | Elektronische Identitat des deutschen Personalausweises (Online-Ausweisfunktion) |
| **eIDAS** | EU-Verordnung uber elektronische Identifizierung und Vertrauensdienste |
| **EUDI Wallet** | European Digital Identity Wallet -- geplante EU-weite digitale Identitat (ab 2027) |
| **Event Sourcing** | Architekturmuster, bei dem Zustandsanderungen als unveranderliche Ereignisse gespeichert werden |
| **Fraktion** | Zusammenschluss von Abgeordneten einer Partei im Bundestag; auf der Plattform auch: Nutzergruppe |
| **Freemium** | Geschaftsmodell mit kostenlosem Basiszugang und kostenpflichtigen Premiumfunktionen |
| **Hash Chain** | Kryptographische Verkettung von Datensatzen, bei der jeder Eintrag den Hash des vorherigen enthalt |
| **Leichte Sprache** | Vereinfachtes Deutsch fur Menschen mit Lernschwierigkeiten oder geringen Deutschkenntnissen |
| **Lighthouse** | Google-Tool zur Messung von Web-Performance, Accessibility und SEO |
| **Liquid Democracy** | Demokratiemodell, bei dem Stimmen an Vertrauenspersonen delegiert werden konnen |
| **MdB** | Mitglied des Bundestages |
| **MoSCoW** | Priorisierungsmethode: Must / Should / Could / Won't |
| **MVP** | Minimum Viable Product -- minimale funktionsfahige Version |
| **Namentliche Abstimmung** | Bundestagsabstimmung, bei der die Stimme jedes MdB offentlich dokumentiert wird |
| **North Star Metric** | Die eine Kennzahl, die den Gesamterfolg des Produkts am besten misst |
| **PWA** | Progressive Web App -- Webanwendung mit nativen App-Fahigkeiten (Offline, Push, Installierbar) |
| **Ranked Choice Voting** | Abstimmung durch Rangfolge der Optionen nach personlicher Praferenz |
| **RLS** | Row Level Security -- PostgreSQL-Funktion zur zeilenbasierten Zugriffskontrolle |
| **Service Worker** | Browser-Hintergrundprozess fur Offline-Caching und Push-Notifications |
| **shadcn/ui** | Sammlung wiederverwendbarer, barrierefreier UI-Komponenten fur React |
| **Supabase** | Open-Source Backend-as-a-Service Plattform auf PostgreSQL-Basis |
| **Tailwind CSS** | Utility-first CSS-Framework fur schnelle UI-Entwicklung |
| **tRPC** | TypeScript-basiertes RPC-Framework fur durchgangige Typsicherheit zwischen Client und Server |
| **Vorgang** | Parlamentarischer Vorgang im Bundestag (z.B. ein Gesetzgebungsverfahren) |
| **Wahlkreis** | Einer der 299 Bundestagswahlkreise, denen Nutzer zugeordnet werden |
| **WCAG** | Web Content Accessibility Guidelines -- internationale Richtlinien fur Barrierefreiheit |

---

## 1. Executive Summary

### 1.1 Vision

Demokrat ist eine digitale Plattform, die eine Brucke zwischen dem Deutschen Bundestag und den Burgerinnen und Burgern schlagt. Die Plattform ermoglicht es jedem Menschen in Deutschland, zu denselben Themen abzustimmen, die im Bundestag verhandelt werden, eigene Themen einzubringen und sich in strukturierten Diskussionen auszutauschen -- ohne dass die Debatte in Polarisierung abgleitet.

Demokrat ist kein Social Network. Es ist ein Instrument der demokratischen Teilhabe.

**Der komplett neue Ansatz:** Demokrat behandelt Demokratie wie ein kooperatives Stadtbauspiel. Burger "bauen" gemeinsam an ihrem Wahlkreis und an Deutschland -- nicht gegeneinander, sondern miteinander. Jede Abstimmung, jeder konstruktive Kommentar, jede Initiative tragt sichtbar zum Fortschritt der eigenen Gemeinschaft bei. Am Ende des Jahres erhalt jeder Nutzer einen personlichen "Demokratie-Report" (wie Spotify Wrapped), der zeigt, was die eigene Beteiligung bewirkt hat. Diesen Ansatz -- kooperative Stadtsimulation + strukturierte Deliberation + Bridging-Algorithmus + Habit-forming Daily Sessions -- gibt es in dieser Kombination weltweit noch nicht.

### 1.2 Problem Statement

Deutschland steht vor einer wachsenden demokratischen Vertrauenskrise:

- **Politische Entfremdung:** Laut Infratest dimap (2025) vertrauen nur noch 25% der Deutschen den politischen Parteien. Die Wahlbeteiligung bei Landtagswahlen sinkt seit Jahren.
- **Informationslucke:** Bundestagsdebatten und Gesetzentwurfe sind fur Laien kaum verstandlich. Die Kluft zwischen politischem Handeln und Burgerverstandnis wachst.
- **Fehlende Feedback-Kanale:** Es gibt keinen skalierbaren, strukturierten Kanal, uber den Burger ihre Meinung zu konkreten Gesetzesvorhaben an ihre Abgeordneten kommunizieren konnen.
- **Polarisierung:** Bestehende Social-Media-Plattformen (X, Facebook, TikTok) verstarken durch Engagement-optimierte Algorithmen die Spaltung zwischen politischen Lagern, statt Brucken zu bauen.

**Was existiert, aber nicht reicht:**

| Plattform | Starke | Lucke |
|-----------|--------|-------|
| DEMOCRACY App | Spiegelt Bundestagsabstimmungen | Keine Community, kein Dialog, keine eigenen Themen |
| Decidim | Umfassendes Beteiligungstool | Institutionell gebunden, nicht fur Einzelburger |
| adhocracy+ | In ~280 Kommunen im Einsatz | An Kommunen gebunden, kein bundesweiter Ansatz |
| abgeordnetenwatch | Transparenz uber Abgeordnete | Nur Frage-Antwort, keine Abstimmungen durch Burger |

**Es fehlt:** Eine bundesweite Plattform, die offizielle Bundestag-Daten mit Burger-Abstimmungen, strukturierter Deliberation und aktiver Ergebniskommunikation an die Politik verbindet.

### 1.3 Losung: Die Drei-Saulen-Architektur

Demokrat basiert auf drei Kernbausteinen:

**Saule 1 -- Spiegel (Bundestag-Mirror)**
Automatischer Import aller Gesetzentwurfe, namentlichen Abstimmungen und Plenarprotokolle aus dem Bundestag. Darstellung in verstandlicher Sprache. Burger stimmen parallel zum Bundestag ab und konnen ihr Ergebnis direkt vergleichen.

**Saule 2 -- Stimme (Burgerinitiative)**
Nutzer erstellen eigene Themen, wahlen ein Abstimmungsformat (Ja/Nein, Multiple Choice, Ranked Choice etc.) und stellen sie der Community zur Abstimmung. Ein Feed zeigt neue Themen an, gefiltert nach Relevanz und Interesse.

**Saule 3 -- Brucke (Ergebniskommunikation)**
Abstimmungsergebnisse werden offentlich dokumentiert, als Dashboards aufbereitet und aktiv an Abgeordnete und Medien kommuniziert. Das Ziel: Die Schleife zwischen Burger-Meinung und politischem Handeln schliessen.

### 1.4 Business Model

Demokrat nutzt ein **Freemium-Modell**:

**Preise:** 4,99 EUR/Monat oder 49,99 EUR/Jahr (~2 Monate gratis). Zahlungsabwicklung uber Stripe.

| | Basis (kostenlos) | Premium (4,99 EUR/Monat) |
|---|---|---|
| Abstimmen | Alle Formate | Alle Formate |
| Kommentieren | Ja | Ja |
| Themen erstellen | 5 pro Monat | Unbegrenzt |
| Ergebnisse sehen | Basis-Ansicht | Detaillierte Analysen, demografische Aufschlusselung, historische Vergleiche |
| Benachrichtigungen | Standard | Erweitert (z.B. Wahlkreis-spezifisch, MdB-Tracking) |
| Datenexport | Eigene Daten (JSON) | Erweiterte Exports (CSV, JSON), Embed-Widgets |
| Gruppen | Beitreten | Erstellen und verwalten |
| Character Sheet | Basis (nach 30 Abstimmungen) | Erweiterte Statistiken und historische Entwicklung |

**Langfristiger Pfad:** B2G SaaS (Business-to-Government) -- Kommunen und Landerparlamente konnen die Plattform als White-Label-Losung fur offizielle Burgerbeteiligung lizenzieren.

**Finanzierungsmoglichkeiten fur die Startphase:**
- Sovereign Tech Fund (bis zu 1 Mio. EUR fur Open-Source-Infrastruktur)
- EU Horizon Europe Cluster 2 (Demokratie & Governance)
- Civitates (europaischer Demokratie-Fonds, bis zu 160.000 EUR)
- Prototype Fund (bis zu 158.000 EUR, allerdings Civic Tech seit 2025 kein Forderbereich mehr)
- Eigenfinanzierung / Bootstrapping

### 1.5 Scope & Rahmenbedingungen

- **Team:** Solo-Grunder, kleines Budget
- **Prioritat:** Qualitat vor Geschwindigkeit, kein fester Launch-Termin
- **Markt:** Ausschliesslich Deutschland (Phase 1)
- **KI-Einsatz:** KI fur Content-Pipeline (Zusammenfassungen, Quiz, Nachrichtenlinks); Algorithmen (Bridging, Feed, Reputation) bleiben regelbasiert und auditierbar
- **Sprache:** Deutsch (technische Fachbegriffe auf Englisch)
- **Open Source:** Nein -- proprietar, aber mit offentlicher Algorithmus-Dokumentation und regelmassigen Audits

---

## 2. Zielgruppen & Personas

### 2.1 Marktgrosse

| Ebene | Grosse | Definition |
|-------|--------|-----------|
| **TAM** (Total Addressable Market) | 61,2 Mio. | Alle Wahlberechtigten in Deutschland |
| **SAM** (Serviceable Addressable Market) | ~30 Mio. | Internet-affine, politisch interessierte Burger (Basis: Allensbach/Forsa-Erhebungen zum politischen Interesse) |
| **SOM** (Serviceable Obtainable Market) | 50.000 (Jahr 1), 500.000 (Jahr 3) | Realistische Nutzerziele basierend auf Vergleichsplattformen |

### 2.2 Primare Personas

---

#### Persona 1: Anna die Aktive

| | |
|---|---|
| **Alter** | 34 |
| **Wohnort** | Berlin-Kreuzberg |
| **Beruf** | Lehrerin (Gesellschaftskunde) |
| **Tech-Affinitat** | 4/5 |
| **Polit. Engagement** | 5/5 |
| **Aktuelle Tools** | DEMOCRACY App, abgeordnetenwatch, Twitter/X |
| **Frustrationen** | "Ich stimme in der DEMOCRACY App ab, aber es fuhlt sich sinnlos an -- es passiert ja nichts damit. Und auf Twitter wird jede Diskussion sofort toxisch." |
| **Ziele** | Ihre Meinung qualifiziert einbringen und sehen, dass sie Wirkung hat. Sich mit Gleichgesinnten UND Andersdenkenden konstruktiv austauschen. |
| **Szenario** | Anna sieht morgens die Push-Notification "Neuer Gesetzentwurf: Digitale Bildungsstrategie 2030". Sie liest die Zusammenfassung, stimmt ab, schreibt einen Kommentar mit Quellenangabe aus ihrer Berufserfahrung und sieht am Abend, wie der Bundestag anders abgestimmt hat als die Burger. |

> *"Ich will nicht nur alle vier Jahre ein Kreuz machen. Ich will, dass meine Stimme zwischen den Wahlen gehort wird."*

---

#### Persona 2: Markus der Mitdenker

| | |
|---|---|
| **Alter** | 52 |
| **Wohnort** | Munchen-Schwabing |
| **Beruf** | Maschinenbau-Ingenieur |
| **Tech-Affinitat** | 3/5 |
| **Polit. Engagement** | 3/5 |
| **Aktuelle Tools** | Tagesschau-App, gelegentlich ZEIT Online |
| **Frustrationen** | "Ich lese die Nachrichten und denke mir oft: Das ware doch ganz anders besser zu losen. Aber ich weiss nicht, wohin damit." |
| **Ziele** | Einfach und schnell seine Meinung zu konkreten politischen Themen abgeben. Verstehen, was im Bundestag passiert, ohne Juristendeutsch. |
| **Szenario** | Markus offnet in der Mittagspause die App, sieht drei aktuelle Abstimmungen im Feed, stimmt bei zwei ab (dauert 30 Sekunden) und liest bei der dritten die Pro/Contra-Argumente, weil er sich unsicher ist. |

> *"Politik ist zu wichtig, um sie nur den Politikern zu uberlassen. Aber ich habe nicht den ganzen Tag Zeit dafur."*

---

#### Persona 3: Lena die Lernende

| | |
|---|---|
| **Alter** | 22 |
| **Wohnort** | Hamburg-Altona |
| **Beruf** | Studentin (Kommunikationsdesign) |
| **Tech-Affinitat** | 5/5 |
| **Polit. Engagement** | 2/5 |
| **Aktuelle Tools** | Instagram, TikTok, Spotify |
| **Frustrationen** | "Politik ist so trocken und kompliziert. Wenn ich Nachrichten lese, verstehe ich die Halfte nicht. Und ich habe das Gefuhl, dass sowieso niemand auf meine Generation hort." |
| **Ziele** | Politik verstehen, ohne sich dumm zu fuhlen. Sehen, was andere in ihrem Alter denken. |
| **Szenario** | Lena installiert die App als PWA, weil eine Freundin sie geteilt hat. Sie scrollt durch den Feed, findet ein Thema uber Mietpreise in Hamburg, stimmt ab und sieht uberrascht, dass 73% der Burger anders gestimmt haben als der Bundestag. Sie teilt das Ergebnis in ihrer Instagram-Story. |

> *"Wenn mir jemand in 30 Sekunden erklaren kann, worum es geht, bin ich dabei."*

---

#### Persona 4: Jurgen der Journalistische

| | |
|---|---|
| **Alter** | 45 |
| **Wohnort** | Koln |
| **Beruf** | Datenjournalist (Regionalzeitung) |
| **Tech-Affinitat** | 4/5 |
| **Polit. Engagement** | 4/5 (beruflich) |
| **Aktuelle Tools** | abgeordnetenwatch, Bundestag Open Data, Statista |
| **Frustrationen** | "Es gibt keine guten Datenquellen dafur, was die Bevolkerung wirklich zu einzelnen Gesetzen denkt. Infratest macht das nur fur die grossen Themen." |
| **Ziele** | Belastbare Daten uber Burger-Meinungen zu konkreten Gesetzentwurfen. Eine offene API fur eigene Auswertungen. |
| **Szenario** | Jurgen nutzt die Open Data API, um fur einen Artikel uber die Klimapolitik die Burger-Abstimmungsergebnisse aller klimabezogenen Gesetzentwurfe der aktuellen Legislaturperiode auszuwerten und mit den Bundestag-Ergebnissen zu vergleichen. |

> *"Gib mir eine API und ich mache daraus Geschichten, die die Leute verstehen."*

---

#### Persona 5: Petra die Politikerin

| | |
|---|---|
| **Alter** | 38 |
| **Wohnort** | Berlin / Wahlkreis Freiburg |
| **Beruf** | MdB (Bundestag) |
| **Tech-Affinitat** | 3/5 |
| **Polit. Engagement** | 5/5 (beruflich) |
| **Aktuelle Tools** | Bundestag-App, abgeordnetenwatch (antwortet dort), Wahlkreis-Buros |
| **Frustrationen** | "Ich bekomme 200 E-Mails am Tag, aber weiss trotzdem nicht, was mein Wahlkreis wirklich zu meinem Abstimmungsverhalten denkt." |
| **Ziele** | Strukturiertes Feedback aus dem Wahlkreis zu konkreten Abstimmungen. Verstehen, wo sie anders liegt als ihre Wahler. |
| **Szenario** | Petra erhalt nach einer namentlichen Abstimmung eine automatische Email von Demokrat: "82% der Nutzer aus Ihrem Wahlkreis Freiburg haben anders abgestimmt als Sie. Hier sind die Top-3-Argumente der Gegenseite." |

> *"Ich will zuhorenbar sein -- nicht nur alle vier Jahre, sondern bei jedem Gesetz."*

---

### 2.3 Anti-Personas (Fur wen Demokrat NICHT gebaut wird)

| Anti-Persona | Beschreibung | Wie die Plattform sie adressiert |
|---|---|---|
| **Der Troll** | Will Diskussionen storen, provozieren und spalten | Bridging-Algorithmus deprioritisiert spalterische Inhalte; Reputation-System begrenzt Rechte; Community-Moderation |
| **Der Social-Media-Suchtige** | Sucht Unterhaltung, Likes, Follower | Kein Like-System, kein Follower-Mechanismus, kein Engagement-maximierender Algorithmus |
| **Der verdeckte Lobbyist** | Will unerkannt politische Stimmung manipulieren | Transparente Algorithmen; Verifikationsstufen; Bridging-Score verhindert einseitige Stimmungsmache |

### 2.4 User Journey Maps

#### Anna die Aktive -- Journey Map

| Phase | Touchpoint | Aktion | Emotion | Drop-off-Risiko | Retention-Intervention |
|-------|-----------|--------|---------|-----------------|----------------------|
| **Awareness** | Empfehlung von Kollegin | Besucht Landing Page | Neugierig | Mittel -- "Noch eine App?" | Klare Differenzierung zu DEMOCRACY App auf Landing Page |
| **Registration** | Landing Page -> Registrierung | Email-Registrierung, Wahlkreis wahlen | Motiviert | Niedrig | Registrierung in <30 Sekunden, kein Passwort-Zwang (Magic Link) |
| **First Vote** | Home Feed | Erste Abstimmung zu aktuellem Bundestag-Thema | Befriedigung | Niedrig | Sofort Ergebnis-Vergleich mit Bundestag zeigen |
| **First Comment** | Topic Detail | Schreibt Kommentar mit Quellenangabe | Engagiert | Mittel -- "Schreibe ich ins Leere?" | Benachrichtigung wenn Kommentar hohen Bridging-Score erhalt |
| **Regular Use** | Push Notification | Tagliche 2-3 Abstimmungen | Gewohnheit | Hoch -- "Andert ja doch nichts" | Wochentliche Email: "Deine Stimme hat X bewirkt" + Streak-Anzeige |
| **Premium** | Ergebnis-Dashboard | Detaillierte Wahlkreis-Analyse | Power-User | Mittel | Premium-Features als naturliche Erweiterung, nicht als Paywall |
| **Advocacy** | Social Sharing | Teilt Ergebnis-Grafik | Stolz | Niedrig | Einfache Share-Cards mit Ergebnis-Visualisierung |

#### Markus der Mitdenker -- Journey Map

| Phase | Touchpoint | Aktion | Emotion | Drop-off-Risiko | Retention-Intervention |
|-------|-----------|--------|---------|-----------------|----------------------|
| **Awareness** | Artikel in Tagesschau-App | Klickt auf eingebettetes Ergebnis-Widget | Uberrascht | Hoch -- "Was ist das?" | Widget enthalt klaren CTA: "Stimme auch ab" |
| **Registration** | Widget -> Landing Page | Email-Registrierung | Skeptisch | Hoch | Keine Daten ausser Email erforderlich; sofort abstimmen nach Registrierung |
| **First Vote** | Home Feed | Stimmt uber Mittagspause ab (30 Sek.) | "Das war einfach" | Mittel | Sofort-Feedback: "73% stimmen dir zu" |
| **Regular Use** | Wochentliche Email-Digest | Offnet App fur 3-5 Min. | Routine | Hoch -- kurze Aufmerksamkeit | Digest: Nur 3 relevanteste Themen, ein Klick zum Abstimmen |

---

## 3. Funktionale Anforderungen

Jede Anforderung wird beschrieben mit:
- **Beschreibung** des Features
- **User Stories** im Format "Als [Rolle] mochte ich [Aktion], damit [Nutzen]"
- **Akzeptanzkriterien** (testbar)
- **Prioritat** (Must / Should / Could)
- **Phase** (1 / 2 / 3)
- **Technische Notizen** (Implementierungshinweise)

---

### 3.1 Authentication & Identity

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| AUTH-01 | Email + Passwort Registrierung | 1 | Must |
| AUTH-02 | Email-Verifizierung (Double Opt-in) | 1 | Must |
| AUTH-03 | Passwort-Reset | 1 | Must |
| AUTH-04 | Magic Link Login | 1 | Should |
| AUTH-05 | OAuth (Google, Apple) | 2 | Should |
| AUTH-06 | eID/Personalausweis Verifizierung | 3 | Could |
| AUTH-07 | Zwei-Faktor-Authentifizierung (TOTP) | 2 | Should |
| AUTH-08 | Account-Loschung (DSGVO Art. 17) | 1 | Must |
| AUTH-09 | Session-Management (Multi-Device) | 1 | Must |
| AUTH-10 | Anonymes Browsen (Read-only) | 1 | Must |

#### User Stories

**AUTH-01: Email + Passwort Registrierung**

> Als Burger mochte ich mich mit meiner E-Mail-Adresse und einem Passwort registrieren konnen, damit ich schnell und ohne Hurden Zugang zur Plattform bekomme.

Akzeptanzkriterien:
- Registrierungsformular: E-Mail (Pflicht), Passwort (min. 8 Zeichen, Pflicht), Anzeigename (Pflicht), Wahlkreis (Optional)
- Passwort-Starke wird visuell angezeigt
- DSGVO-Einwilligung (Checkbox, Pflicht) mit Link zur Datenschutzerklarung
- Bei erfolgreicher Registrierung: Bestatigungsmail wird gesendet (AUTH-02)
- Fehlermeldung wenn E-Mail bereits vergeben
- Registrierung dauert <30 Sekunden

**AUTH-04: Magic Link Login**

> Als registrierter Nutzer mochte ich mich per Magic Link einloggen konnen, damit ich mir kein Passwort merken muss.

Akzeptanzkriterien:
- Nutzer gibt E-Mail ein und erhalt einen Login-Link per Mail
- Link ist 15 Minuten gultig, danach ablaufend
- Nach Klick auf den Link: automatischer Login und Weiterleitung zum Feed
- Kein Passwort erforderlich

**AUTH-06: eID/Personalausweis Verifizierung**

> Als verifizierter Nutzer (eID) mochte ich ein Verifikationsabzeichen erhalten, damit meine Stimme in deliberativen Prozessen als vertrauenswurdiger erkennbar ist.

Akzeptanzkriterien:
- Integration uber AusweisApp SDK (kostenlos, Open Source, v2.4.1)
- Nutzer wird zur AusweisApp weitergeleitet, scannt Personalausweis per NFC
- Nur die Service-spezifische pseudonyme ID wird gespeichert (keine personlichen Daten)
- Nach Verifizierung: Profil zeigt Verifikationsabzeichen
- Verification-Tier wird auf `identity_verified` gesetzt
- Personliche Daten werden nach Verifizierung sofort geloscht ("Verify-then-Forget")

**AUTH-08: Account-Loschung**

> Als Nutzer mochte ich meinen Account jederzeit vollstandig loschen konnen, damit meine Daten gemaass DSGVO Art. 17 entfernt werden.

Akzeptanzkriterien:
- Losch-Funktion in den Einstellungen erreichbar
- Bestatigungsdialog mit Passwort/Magic-Link-Verifizierung
- Personenbezogene Daten werden innerhalb von 30 Tagen geloscht
- Abstimmungen werden anonymisiert (Nutzer-Referenz entfernt), Aggregate bleiben erhalten
- Kommentare werden auf "[geloschter Nutzer]" umgeschrieben
- Bestatigungsmail nach Loschung

#### Onboarding-Flow (AUTH-11) -- NEU

> Als neuer Nutzer mochte ich beim ersten Login einen kurzen Onboarding-Flow durchlaufen, der mir sofort einen personalisierten Feed und einen politischen Charakter gibt.

**Ablauf (4 Screens, <90 Sekunden):**

**Screen 1: Wahlkreis**
"Wo bist du zuhause?"
- GPS-basierte Vorschlag-Erkennung ODER manuelle Suche/Auswahl
- Mini-Karte zeigt den erkannten Wahlkreis an
- "Dein Wahlkreis: Freiburg (Wahlkreis 281)"
- Button: "Stimmt" / "Andern"

**Screen 2: Themen-Interessen (3-5 auswahlen)**
"Was interessiert dich?"
- 10 Themen-Chips als Grid: Umwelt & Klima | Wirtschaft | Bildung | Gesundheit | Digitales | Soziales | Sicherheit | Finanzen | Wohnen | Europa
- Mindestens 3 auswahlen, maximal 5
- Chips: Hellgrauer Hintergrund, bei Auswahl Indigo-Umrandung

**Screen 3: Tagesziel**
"Wie viel Zeit hast du fur Demokratie?"
- 4 Optionen: Zuschauer (2 Min/Tag) | Teilnehmer (5 Min) | Engagiert (10 Min) | Aktivist (20 Min)
- Vorauswahl: "Teilnehmer" (empfohlen)

**Screen 4: Dein Start**
"Fertig! Hier ist dein erster Blick auf die Demokratie."
- Kleine Vorschau: Wahlkreis auf der Karte (leuchtet auf), 2 vorgeschlagene Themen
- Button: "Los geht's" -> weiter zum Home Feed

**Danach organisch wachsend:**
- Der politische Charakter (Civic Character Sheet mit 6 Attributen) entwickelt sich durch Nutzung weiter
- Nach 10 Abstimmungen: Erste Character-Sheet-Visualisierung freigeschaltet
- Nach 30 Abstimmungen: Vollstandiges Hexagon-Chart verfugbar
- Themen-Interessen konnen jederzeit in den Einstellungen angepasst werden

Akzeptanzkriterien:
- Onboarding wird nur beim ersten Login gezeigt (danach uberspringbar)
- GPS-Wahlkreis-Erkennung funktioniert uber Reverse Geocoding gegen die 299 Wahlkreis-Geometrien
- Ausgewahlte Interessen fliessen sofort in den Feed-Algorithmus ein (+50% Boost fur ausgewahlte Kategorien)
- Onboarding-Daten werden in `user_preferences` gespeichert
- Gesamtdauer: <90 Sekunden

#### Technische Notizen

- **Supabase Auth** als Foundation: Unterstutzt nativ Email, OAuth, Magic Link, Phone
- RLS Policies gebunden an `auth.uid()`
- Verifikationsstufen im `profiles`-Tabelle:
  - `unverified`: Nur E-Mail bestatigt
  - `verified`: E-Mail + Telefon (Phase 2)
  - `identity_verified`: eID verifiziert (Phase 3)
- eID-Integration: AusweisApp SDK (GitHub: `Governikus/AusweisApp`), Desktop nutzt WebSocket-Verbindung, Mobile nutzt native SDK -- PWA-Limitation bedeutet, dass eID-Verifizierung uber einen Companion-Flow oder Redirect zur AusweisApp laufen muss

---

### 3.2 Bundestag-Spiegel (Parliamentary Mirror)

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| BTS-01 | Auto-Import Gesetzentwurfe aus DIP API | 1 | Must |
| BTS-02 | Auto-Import namentliche Abstimmungen aus abgeordnetenwatch | 1 | Must |
| BTS-03 | Vorgang-Timeline (Gesetzgebungsprozess) | 1 | Must |
| BTS-04 | MdB-Abstimmungsverhalten pro Vorgang | 1 | Must |
| BTS-05 | Burgerverstandliche Zusammenfassung pro Gesetzentwurf | 1 | Must |
| BTS-06 | Link zum Original-Drucksache-PDF | 1 | Must |
| BTS-07 | Filter nach Ausschuss, Fraktion, Themengebiet | 1 | Must |
| BTS-08 | Volltextsuche uber alle Bundestag-Daten | 1 | Should |
| BTS-09 | Push-Benachrichtigungen fur neue Abstimmungen | 2 | Should |
| BTS-10 | Lobbyregister-Kontext pro Vorgang | 2 | Could |
| BTS-11 | Plenarprotokoll-Auszuge pro Vorgang | 2 | Should |
| BTS-12 | Historisches Abstimmungsarchiv | 2 | Should |
| BTS-13 | Wahlkreis-spezifische Ansicht | 2 | Should |

#### User Stories

**BTS-01: Auto-Import Gesetzentwurfe**

> Als Burger mochte ich sehen, welche Gesetzentwurfe aktuell im Bundestag behandelt werden, dargestellt in verstandlicher Sprache, damit ich informiert abstimmen kann.

Akzeptanzkriterien:
- Alle Vorgange vom Typ "Gesetzgebung" der aktuellen Wahlperiode (21) werden automatisch importiert
- Sync-Intervall: Alle 15 Minuten wahrend Sitzungswochen, alle 6 Stunden sonst
- Pro importiertem Vorgang wird ein internes `Topic` (source='bundestag') erstellt
- Angezeigte Felder: Titel, Abstract, Sachgebiet, Initiative (wer hat eingereicht), Beratungsstand, Datum
- Import ist idempotent (keine Duplikate)

**BTS-02: Auto-Import namentliche Abstimmungen**

> Als Burgerin mochte ich sehen, wie der Bundestag bei namentlichen Abstimmungen gestimmt hat, damit ich das Ergebnis mit meiner eigenen Stimme vergleichen kann.

Akzeptanzkriterien:
- Alle Polls der aktuellen Legislaturperiode (ID 161) werden aus der abgeordnetenwatch API importiert
- Pro Abstimmung: Titel, Datum, Ergebnis (Ja/Nein/Enthaltung/Nicht abgegeben), redaktionelle Zusammenfassung (`field_intro`)
- Einzelstimmen der MdBs werden importiert und verknupft
- Automatische Verknupfung mit dem entsprechenden DIP-Vorgang uber Dokumentennummer

**BTS-04: MdB-Abstimmungsverhalten**

> Als Burgerin mochte ich sehen, wie mein Wahlkreis-Abgeordneter bei namentlichen Abstimmungen gestimmt hat, damit ich seine Arbeit bewerten kann.

Akzeptanzkriterien:
- Auf der Topic-Detail-Seite: Aufschlusselung nach Fraktionen (Balkendiagramm)
- Suchbar nach einzelnem MdB
- Verknupfung mit dem Wahlkreis des Nutzers: "Ihr Abgeordneter [Name] hat [Ja/Nein] gestimmt"

**BTS-05: Burgerverstandliche Zusammenfassungen**

> Als Burger ohne juristischen Hintergrund mochte ich eine verstandliche Zusammenfassung jedes Gesetzentwurfs lesen konnen, damit ich informiert abstimmen kann.

Akzeptanzkriterien:
- Jedes Bundestag-Topic hat ein Zusammenfassungs-Feld
- Zusammenfassungen werden KI-generiert auf Basis der Drucksachen-Texte und abgeordnetenwatch `field_intro`
- Zielformat: Einfache Sprache (Leseniveau B1), max. 200 Worter, strukturiert in "Worum geht es?" + "Was wurde sich andern?"
- KI-Pipeline: Automatisch bei Import eines neuen Vorgangs, sofort verfugbar
- Zusammenfassungen konnen von der Community verbessert werden (ab Privilege-Tier 2)

#### Technische Notizen

**DIP API (Bundestag):**
- Base URL: `https://search.dip.bundestag.de/api/v1`
- Auth: `Authorization: ApiKey {key}` Header
- Endpunkte: `/vorgang`, `/drucksache`, `/drucksache-text/{id}`, `/plenarprotokoll`, `/person`, `/aktivitaet`
- Filter: `f.wahlperiode=21`, `f.vorgangstyp=Gesetzgebung`, `f.aktualisiert.start={timestamp}`
- Format: JSON
- Pagination: Cursor-basiert (`cursor=*` fur erste Seite)

**abgeordnetenwatch API:**
- Base URL: `https://www.abgeordnetenwatch.de/api/v2/`
- Auth: Keine (offen)
- Lizenz: CC0 1.0 (Public Domain)
- Endpunkte: `/parliaments`, `/parliament-periods`, `/politicians`, `/polls`, `/votes`
- Filter: `field_legislature[entity.id]=161` fur aktuelle Periode
- `field_intro` enthalt bereits redaktionelle Zusammenfassungen in HTML
- Pagination: `range_start`, `range_end` (max 1000)

**Sync-Strategie:**
- Cron-Job alle 15 Minuten: `GET /vorgang?f.wahlperiode=21&f.aktualisiert.start={last_sync}`
- Idempotent uber `dip_id` (UNIQUE constraint)
- DIP-/abgeordnetenwatch-Daten sind autoritativ; interne Anreicherungen (Zusammenfassungen, Kategorien) werden als separate Felder gespeichert
- Fehlerbehandlung: 3 Retries mit exponential Backoff, danach Alert; veraltete Daten werden mit Hinweis angezeigt

---

### 3.3 Abstimmungssystem (Voting System)

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| VOTE-01 | Ja/Nein/Enthaltung Abstimmung (Bundestag-Spiegel) | 1 | Must |
| VOTE-02 | Multiple Choice Abstimmung | 1 | Must |
| VOTE-03 | Ranked Choice Voting | 2 | Must |
| VOTE-04 | Approval Voting | 2 | Should |
| VOTE-05 | Liquid Democracy Delegation | 3 | Could |
| VOTE-06 | Partizipatives Budget | 3 | Could |
| VOTE-07 | Zeitfenster fur Abstimmungen | 1 | Must |
| VOTE-08 | Stimmabgabe andern (innerhalb Zeitfenster) | 1 | Should |
| VOTE-09 | Abstimmungsbeleg / Verifikations-Hash | 1 | Must |
| VOTE-10 | Ergebnis-Anzeige (Diagramme) | 1 | Must |
| VOTE-11 | Demografische Aufschlusselung | 2 | Should |
| VOTE-12 | Vergleich: Burger vs. Bundestag | 1 | Must |

#### User Stories

**VOTE-01: Ja/Nein/Enthaltung**

> Als Burger mochte ich uber denselben Gesetzentwurf abstimmen wie der Bundestag, damit ich meine Meinung direkt vergleichen kann.

Akzeptanzkriterien:
- Drei grosse, tippbare Buttons: Ja (Indigo-Hintergrund, weisser Text), Nein (Hellgrauer Hintergrund, dunkler Text), Enthaltung (Hellgrauer Hintergrund, Mittelgrau-Text)
- Bestatigungsschritt: "Deine Stimme: [Ja]. Abstimmen?" mit Hinweis, dass die Stimme bis zum Ende des Zeitfensters geandert werden kann
- Nach Abstimmung: Sanfter Bounce der gewahlten Option (200ms ease-out) + Haptic Feedback, Verifikations-Hash angezeigt, Share-Option
- Sofortiger Ergebnis-Vergleich mit Bundestag-Ergebnis

**VOTE-03: Ranked Choice Voting**

> Als Nutzerin mochte ich Optionen nach meiner Praferenz ordnen konnen, damit auch bei komplexen Themen ein differenziertes Meinungsbild entsteht.

Akzeptanzkriterien:
- Drag-and-Drop Liste (mobil-optimiert mit Touch-Support)
- Mindestens 3, maximal 10 Optionen
- Nutzer muss nicht alle Optionen ordnen (partielle Rangfolge erlaubt)
- Auswertung nach Instant-Runoff-Verfahren
- Ergebnis-Darstellung: Rundenweise Elimination visualisiert

**VOTE-05: Liquid Democracy**

> Als Nutzerin mochte ich meine Stimme an einen Delegierten ubertragen konnen, falls ich mich bei einem Thema nicht kompetent genug fuhle.

Akzeptanzkriterien:
- Delegation pro Thema oder pro Kategorie moglich
- Delegation ist jederzeit widerrufbar
- Delegierter sieht, wie viele Stimmen er tragt (nicht von wem)
- Transitive Delegation: Wenn mein Delegierter an jemand weiterdelegiert, folgt meine Stimme (Kettenmax: 5)
- Nutzer wird benachrichtigt, wenn der Delegierte abstimmt
- Nutzer kann eigene Stimme jederzeit ubersteuern (bricht Delegation fur dieses Thema)

**VOTE-09: Verifikations-Hash**

> Als Burger mochte ich einen kryptographischen Beleg fur meine Stimmabgabe erhalten, damit ich nachprufen kann, dass meine Stimme gezahlt wurde.

Akzeptanzkriterien:
- Nach Stimmabgabe: SHA-256 Hash wird angezeigt (z.B. `a3f2b8...`)
- Hash wird aus Event-ID, Topic-ID, User-ID und Payload berechnet
- Nutzer kann den Hash spater auf einer Verifikationsseite eingeben und bestatigt bekommen, dass die Stimme im Event Store existiert
- Der Hash offenbart NICHT, wie der Nutzer gestimmt hat

**VOTE-12: Burger vs. Bundestag Vergleich**

> Als Burger mochte ich auf einen Blick sehen, wie mein Abstimmungsergebnis vom Bundestag-Ergebnis abweicht, damit die Diskrepanz sichtbar wird.

Akzeptanzkriterien:
- Nebeneinander-Darstellung: Burger-Ergebnis (links) vs. Bundestag-Ergebnis (rechts)
- Prozentuale Abweichung hervorgehoben
- Abweichung visuell hervorgehoben: Indigo-Intensitat zeigt Ubereinstimmungsgrad (gesattigt = hohe Ubereinstimmung, blass = starke Abweichung). Keine Grun/Rot-Kodierung (Barrierefreiheit + Design System)
- Aufschlusselung nach Fraktionen: "CDU/CSU hat Ja gestimmt, 67% der Burger auch"

#### Technische Notizen -- Event Sourcing fur Votes

Das Abstimmungssystem basiert auf **Event Sourcing** -- einem Architekturmuster, bei dem jede Stimmabgabe als unveranderliches Ereignis gespeichert wird. Dies ist keine optionale Designentscheidung, sondern eine Grundvoraussetzung fur demokratische Legitimitat.

**Warum Event Sourcing:**
- **Unveranderlichkeit:** Einmal abgegebene Stimmen konnen nicht still und leise geandert oder geloscht werden
- **Auditierbarkeit:** Jede Aktion ist nachvollziehbar, der gesamte Verlauf rekonstruierbar
- **Hash Chain:** Jedes Event referenziert den Hash des vorherigen Events -- Manipulation wird erkannt
- **Temporale Abfragen:** "Wie war der Stand um 15:00?" ist jederzeit beantwortbar
- **CQRS:** Schreibpfad (Event append) und Lesepfad (Projektion) sind getrennt skalierbar

**Event Store Schema:**
```sql
vote_events (
  event_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id     UUID NOT NULL,  -- verweist auf topic.id
  event_type    TEXT NOT NULL,   -- 'VoteCast', 'VoteChanged', 'VoteRevoked'
  user_id       UUID NOT NULL,
  payload       JSONB NOT NULL,  -- {choice: 'yes'|'no'|'abstain', ranked: [...]}
  prev_hash     TEXT,
  event_hash    TEXT,            -- SHA-256 der Event-Daten
  metadata      JSONB,           -- {ip_hash, user_agent_hash, client_timestamp}
  created_at    TIMESTAMPTZ DEFAULT now(),
  sequence_number BIGINT GENERATED ALWAYS AS IDENTITY
)
```

**Projektion (Read Model):**
- Materialized View oder separate Tabelle `vote_results`
- Wird bei jedem neuen Event uber einen PostgreSQL-Trigger aktualisiert
- Snapshot-Strategie: Ab >10.000 Stimmen pro Topic wird ein laufendes Aggregat vorgehalten
- Ergebnis-Abfragen lesen nur aus der Projektion (nicht aus dem Event Store)

---

### 3.4 Burgerinitiative (User-Generated Content)

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| UGC-01 | Thema erstellen (Titel, Beschreibung, Kategorie) | 1 | Must |
| UGC-02 | Abstimmungsformat an Thema anhangen | 1 | Must |
| UGC-03 | Themenkategorien (Bildung, Gesundheit, Umwelt etc.) | 1 | Must |
| UGC-04 | Themen-Lifecycle (Entwurf > Wartend > Aktiv > Abgeschlossen > Archiviert) | 1 | Must |
| UGC-05 | Moderations-Queue fur neue Themen | 1 | Must |
| UGC-06 | Minimum Unterstutzerschwelle fur Aktivierung | 1 | Should |
| UGC-07 | Themen-Templates | 2 | Should |
| UGC-08 | Kollaborative Themenbearbeitung (Wiki-Stil) | 3 | Could |
| UGC-09 | Petitions-artige Unterschriftensammlung | 2 | Should |
| UGC-10 | Themen verknupfen / zusammenfuhren | 2 | Could |

#### User Stories

**UGC-01: Thema erstellen**

> Als Burgerin mochte ich ein eigenes Thema erstellen und zur Abstimmung stellen konnen, damit auch Themen behandelt werden, die nicht im Bundestag diskutiert werden.

Akzeptanzkriterien:
- Formular: Titel (Pflicht, max 200 Zeichen), Beschreibung (Pflicht, Markdown erlaubt, max 5000 Zeichen), Kategorie (Pflicht, aus vordefinierter Liste), Tags (Optional, max 5)
- Vorschau vor Veroffentlichung
- Thema startet im Status "Entwurf" (nur fur Ersteller sichtbar)
- Nach Veroffentlichung: Status "Wartend" (sichtbar, aber noch nicht abstimmbar)

**UGC-02: Abstimmungsformat wahlen**

> Als Themenersteller mochte ich ein Abstimmungsformat wahlen konnen (Ja/Nein, Multiple Choice, Ranked Choice), damit das Format zur Fragestellung passt.

Akzeptanzkriterien:
- Bei Themen-Erstellung: Auswahl des Formats
- Ja/Nein: Keine weitere Konfiguration
- Multiple Choice: 2-10 Optionen definieren, optionale Mehrfachauswahl (max. Anzahl konfigurierbar)
- Ranked Choice: 3-10 Optionen definieren
- Abstimmungszeitraum festlegen (Standard: 7 Tage, min. 1 Tag, max. 30 Tage)

**UGC-06: Unterstutzerschwelle**

> Als Community-Mitglied mochte ich, dass neue Themen erst ab einer gewissen Unterstutzerzahl zur Abstimmung freigeschaltet werden, damit nur relevante Themen die Feed-Qualitat gewahrleisten.

Akzeptanzkriterien:
- Themen im Status "Wartend" zeigen einen "Unterstutzen"-Button
- Ab [X] Unterstutzern (konfigurierbar, Vorschlag: 10 in der Startphase) wird das Thema "Aktiv" und die Abstimmung beginnt
- Unterstutzung ist nicht gleich Abstimmung -- man kann unterstutzen und spater anders abstimmen

---

### 3.5 Deliberation & Diskussion

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| DIS-01 | Kommentare auf Themen (Thread, max. 2 Ebenen) | 1 | Must |
| DIS-02 | Pro/Contra/Neutral-Tagging auf Kommentaren | 1 | Must |
| DIS-03 | Upvote/Downvote mit Bridging-Score-Gewichtung | 1 | Must |
| DIS-04 | Argument-Map-Ansicht (Kialo-inspiriert) | 2 | Should |
| DIS-05 | Pol.is-Style Meinungsclustering | 3 | Could |
| DIS-06 | No-Reply-Modus (Topic-Ersteller kann aktivieren) | 2 | Should |
| DIS-07 | Quellen/Belege in Kommentaren verlinken | 1 | Should |
| DIS-08 | Kommentar-Qualitats-Score | 2 | Should |
| DIS-09 | Melden/Flaggen-System | 1 | Must |
| DIS-10 | Community-Moderation (stufenweise Privilegien) | 2 | Should |

#### User Stories

**DIS-01: Kommentare**

> Als Nutzer mochte ich Kommentare zu Themen schreiben konnen, damit ich meine Argumente teilen und die Debatte bereichern kann.

Akzeptanzkriterien:
- Kommentare max. 2000 Zeichen
- Maximal 2 Ebenen Verschachtelung (Antwort auf Antwort, keine tiefere Verschachtelung)
- Bearbeitung innerhalb von 15 Minuten moglich
- Markdown-Basis-Formatierung (fett, kursiv, Links, Listen)

**DIS-02: Pro/Contra/Neutral-Tagging**

> Als Nutzer mochte ich meinen Kommentar als Pro, Contra oder Neutral markieren konnen, damit die Argumentstruktur auf einen Blick erkennbar ist.

Akzeptanzkriterien:
- Bei Kommentar-Erstellung: Auswahl Pro / Contra / Neutral (visuell unterschieden durch Icons: Daumen-hoch / Daumen-runter / Minus, nicht durch Farbe)
- Filter-Tabs uber Kommentar-Bereich: Alle | Pro | Contra | Neutral
- Visueller Indikator (Icon + typografische Gewichtung links am Kommentar, keine Farbkodierung -- Barrierefreiheit)

**DIS-03: Bridging-Score**

> Als Nutzer mochte ich, dass die hilfreichsten und verbindendsten Kommentare oben stehen, damit die Diskussion konstruktiv bleibt und nicht von Extrempositionen dominiert wird.

Akzeptanzkriterien:
- Standard-Sortierung: Nach Bridging-Score (hochster zuerst)
- Alternative Sortierung verfugbar: Chronologisch, Meiste Upvotes
- Ein Kommentar hat einen hohen Bridging-Score, wenn er von Nutzern beider Seiten (Pro UND Contra) als hilfreich bewertet wird
- Kommentare, die nur von einer Seite geliked werden, ranken niedriger

**Technische Notizen -- Bridging-Algorithmus:**

Der Bridging-Algorithmus ist inspiriert von X/Twitter Community Notes, aber vereinfacht fur Phase 1:

**Phase-1-Implementierung (vereinfacht):**
- Jeder Nutzer, der auf ein Topic abgestimmt hat, hat eine "Position" (Ja/Nein/Enthaltung)
- Wenn ein Nutzer einen Kommentar upvoted, wird sowohl sein Vote als auch seine Position gespeichert
- Bridging-Score = Anteil der Upvotes, die von Nutzern mit GEGENTEILIGER Abstimmungsposition kommen
- Formel: `bridging_score = min(upvotes_von_ja, upvotes_von_nein) / max(upvotes_von_ja, upvotes_von_nein)`
- Score von 1.0 = perfekte Balance; Score von 0.0 = nur eine Seite findet es hilfreich

**Phase-2-Implementierung (Matrix-Faktorisierung):**
- Vollstandige Implementation nach dem Community-Notes-Paper
- `predicted_rating = user_polarity * comment_polarity + user_intercept + comment_intercept`
- `comment_intercept` = Hilfreichkeit unabhangig von politischer Ausrichtung
- Recalculation alle 60 Minuten via Cron-Job

**Wichtig:** Dies ist ein mathematischer Algorithmus, KEINE KI. Er ist deterministisch, erklarbar und auditierbar.

---

### 3.6 Gamification: "Demokratie als kooperative Stadtsimulation"

Dies ist das Herzstuck von Demokrat und der Grund, warum die Plattform sich fundamental von allem unterscheidet, was es bisher gibt. Demokrat behandelt demokratische Beteiligung wie ein **kooperatives Stadtbauspiel** -- Burger bauen gemeinsam an ihrem Wahlkreis und an Deutschland.

**Das Grundprinzip:** Jede Aktion auf der Plattform tragt sichtbar zum kollektiven Fortschritt bei. Nicht der Einzelne "gewinnt" -- die Gemeinschaft wachst.

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| GAM-01 | Demokratie-Punkte (XP-System) | 1 | Must |
| GAM-02 | Demokratie-Streak (tagliche Gewohnheit) | 1 | Must |
| GAM-03 | Gestufte Privilegien (Stack-Overflow-Modell) | 1 | Must |
| GAM-04 | Wahlkreis-Fortschritt (kooperative Stadtsimulation) | 1 | Must |
| GAM-05 | Themen-Teams (bundesweite Kooperation) | 2 | Should |
| GAM-06 | Tagliche Demokratie-Session (5 Min.) | 1 | Must |
| GAM-07 | Sitzungswoche-Live-Modus | 1 | Must |
| GAM-08 | Civic Quests (wochentliche Missionen) | 2 | Should |
| GAM-09 | Demokratie-Saisons (90-Tage-Zyklen) | 2 | Should |
| GAM-10 | Demokratie-Wrapped (Jahresreport) | 2 | Must |
| GAM-11 | Badges fur qualitative Aktionen | 2 | Should |
| GAM-12 | Civic Character Sheet (6 Attribute) | 2 | Should |
| GAM-13 | Personliche Demokratie-Geschichte (Narrative) | 3 | Could |
| GAM-14 | Demokratie-Puls (Plattform-Gesundheits-Score) | 1 | Should |

---

#### GAM-01: Demokratie-Punkte (XP)

| Aktion | Punkte | Begrundung |
|--------|--------|-----------|
| Tageszusammenfassung lesen | +5 | Baut Bewusstsein auf |
| Verstandnisquiz bestanden | +10 | Aktives Lernen |
| Stimme abgeben | +15 | Kernpartizipation |
| Kommentar schreiben | +20 | Tragt zum Diskurs bei |
| Kommentar mit Quellenangabe | +25 | Evidenzbasiert |
| Kommentar erhalt hohen Bridging-Score (>0.7) | **+50 Bonus** | Bruckenbau uber Lagergrenzen -- die wertvollste Aktion |
| Thema erstellen (wird "Aktiv") | +30 | Initiative |
| Report wird von Moderator bestatigt | +5 | Moderationshilfe |
| Taglicher Streak (7 Tage) | +10 | Gewohnheitsbildung |
| Taglicher Streak (30 Tage) | +50 | Langfristiges Engagement |
| Sitzungswoche-Abstimmung (2x Multiplikator) | x2 | Alignment mit echtem Parlamentsrhythmus |

**Design-Prinzip:** Punkte belohnen ausschliesslich *Qualitat und Breite* des Engagements, NIE die politische Richtung. Bridging-Kommentare bringen am meisten Punkte, weil Bruckenbau die wertvollste demokratische Handlung ist.

---

#### GAM-02: Demokratie-Streak

> Als Nutzer mochte ich sehen, wie viele Tage in Folge ich an der Demokratie teilgenommen habe, damit ich motiviert bleibe, eine tagliche Gewohnheit aufzubauen.

**Was als "Tag" zahlt** (mindestens eine Aktion):
- Abstimmen (Spiegel oder Stimme)
- Tageszusammenfassung lesen + Quiz beantworten
- Konstruktiven Kommentar schreiben
- Kommentar einer anderen Person bewerten

Akzeptanzkriterien:
- Streak-Zahler im Profil und auf dem Home Screen sichtbar
- Dezente Flammen-Animation bei wachsendem Streak (minimalistisch, Indigo-Ton)
- **Streak-Schutz:** 1x pro Woche darf ein Tag verpasst werden ohne Streak-Verlust (verdient durch hohe Aktivitat in der Vorwoche)
- Milestone-Benachrichtigungen: 7, 30, 100, 365 Tage
- Streak-Verlust wird mit Empathie kommuniziert: "Dein Streak wurde zuruckgesetzt. Kein Problem -- starte heute neu."
- Streak beeinflusst NIE, wie eine Stimme gewichtet wird

---

#### GAM-03: Gestufte Privilegien

| Stufe | Name | Punkte | Narrative | Freigeschaltete Fahigkeiten |
|-------|------|--------|-----------|----------------------------|
| 0 | Beobachter | 0 | "Du bist angekommen." | Abstimmen, Kommentieren |
| 1 | Teilnehmer | 50 | "Du hast deine Stimme gefunden." | Themen erstellen, Inhalte melden |
| 2 | Mitwirkender | 200 | "Du baust mit." | Zusammenfassungen bearbeiten, Moderationsqueue einsehen |
| 3 | Moderator | 1.000 | "Die Community vertraut dir." | Themen schliessen/offnen, Kommentare ausblenden |
| 4 | Vertrauensperson | 5.000 | "Du gestaltest die Regeln." | Admin-Nominierung, Algorithmus-Transparenzrat |

---

#### GAM-04: Wahlkreis-Fortschritt (Kooperative Stadtsimulation)

Dies ist das **einzigartige Kernfeature** von Demokrat.

> Als Burger mochte ich sehen, wie die Beteiligung meines Wahlkreises wachst und welchen Fortschritt wir als Gemeinschaft machen, damit ich mich als Teil von etwas Grosserem fuhle.

**Konzept:** Jeder der 299 Wahlkreise hat ein **kollektives Fortschritts-Dashboard**, das durch die Aktivitaten aller Nutzer im Wahlkreis wachst -- wie eine Stadtsimulation, in der die "Gebaude" reale demokratische Errungenschaften darstellen.

**Wahlkreis-Metriken:**
- **Beteiligungsrate:** % der registrierten Wahlkreis-Nutzer, die diese Woche abgestimmt haben
- **Bridging-Qualitat:** Durchschnittlicher Bridging-Score der Wahlkreis-Diskussionen
- **Themen-Vielfalt:** Wie viele verschiedene Kategorien der Wahlkreis abdeckt
- **Feedback-Schleife:** Wie viele Ergebnisse an den Wahlkreis-MdB gesendet wurden

**Fortschritts-Stufen:**

| Stufe | Name | Bedingung | Visuelles Element |
|-------|------|-----------|------------------|
| 1 | Grundstein | 50 registrierte Nutzer | Einfaches Wahlkreis-Icon auf der Karte |
| 2 | Fundament | 200 Nutzer, 100 Abstimmungen/Woche | Wahlkreis leuchtet auf der Karte schwach |
| 3 | Wachstum | 500 Nutzer, Bridging-Score >0.5 | Wahlkreis leuchtet starker |
| 4 | Blute | 1.000 Nutzer, regelmassige MdB-Kommunikation | Wahlkreis hervorgehoben auf der Karte |
| 5 | Vorbild | Top 10% aller Wahlkreise | Wahlkreis-Badge fur alle Mitglieder |

**Deutschland-Karte:**
- Interaktive Choropleth-Karte von Deutschland, geteilt in 299 Wahlkreise
- Wahlkreise leuchten in Indigo-Abstufungen basierend auf Aktivitat (heller = aktiver)
- Live-Animation: Wenn Nutzer abstimmen, pulst der Wahlkreis kurz auf
- Erreichbar uber den Home Screen als prominentes visuelles Element

Akzeptanzkriterien:
- Jeder Nutzer sieht seinen Wahlkreis-Fortschritt im Profil und auf der Karte
- Fortschritt ist kooperativ: Alle Nutzer im Wahlkreis tragen bei
- Kein Ranking einzelner Nutzer innerhalb des Wahlkreises
- Wahlkreis-zu-Wahlkreis-Vergleich ist sichtbar, aber als Inspiration, nicht als Wettkampf

---

#### GAM-05: Themen-Teams

> Als Nutzer mochte ich einem Themen-Team beitreten konnen (z.B. Klima, Bildung, Gesundheit), um gemeinsam mit anderen an Losungen zu arbeiten.

Akzeptanzkriterien:
- Vordefinierte Themen-Teams basierend auf Bundestag-Sachgebieten (Umwelt, Bildung, Gesundheit, Wirtschaft, Digitales, Soziales, Sicherheit, Finanzen)
- Beitritt mit einem Klick, Austritt jederzeit
- Team hat ein kollektives Dashboard: Anzahl Mitglieder, abgegebene Stimmen, durchschnittlicher Bridging-Score
- Team-spezifische Challenges (z.B. "Klima-Team: 5.000 Stimmen zu Klimathemen diesen Monat")
- Teams kooperieren -- kein Team-gegen-Team-Wettkampf

---

#### GAM-06: Tagliche Demokratie-Session (5 Minuten)

Das "Duolingo fur Demokratie" -- eine strukturierte tagliche Session, die demokratische Beteiligung zur Gewohnheit macht.

> Als Nutzer mochte ich in 5 Minuten mein tagliches Demokratie-Pensum erledigen konnen, damit Beteiligung in meinen Alltag passt.

**Ablauf einer taglichen Session:**

**Schritt 1 -- Tages-Briefing (60 Sek.)**
"Heute im Bundestag: [Zusammenfassung des wichtigsten Themas in 3 Satzen]"
Personalisiert nach Wahlkreis und Themen-Interessen.

**Schritt 2 -- Verstandnischeck (45 Sek.)**
Eine Quiz-Frage zum Tages-Briefing (Multiple Choice).
Sofortiges Feedback mit Erklarung. +10 Punkte bei richtiger Antwort.

**Schritt 3 -- Deine Stimme (60 Sek.)**
Abstimmung zum Tageshauptthema.
Ergebnis sofort: "68% der Nutzer stimmen zu. Im Bundestag stimmten 52% dafur."
+15 Punkte.

**Schritt 4 -- Perspektivenwechsel (90 Sek.)**
Ein Bridging-Kommentar von der "anderen Seite" wird gezeigt.
"Findest du diesen Beitrag hilfreich?" [Ja/Nein]
+10 Punkte, +20 Bonus wenn der Kommentar auch von der anderen Seite hoch bewertet wird.

**Schritt 5 -- Tages-Ergebnis (30 Sek.)**
"Dein Demokratie-Streak: 23 Tage. Dein Wahlkreis: Platz 42/299."

**Gesamt:** ~5 Minuten, 45-65 Punkte.

Akzeptanzkriterien:
- Session ist optional -- Nutzer konnen auch frei navigieren
- Session passt sich dem gesetzten Tagesziel an (siehe unten)
- Quiz-Fragen werden KI-generiert auf Basis der Tages-Zusammenfassung (Multiple Choice, 4 Optionen, 1 korrekt)
- Session speichert Fortschritt -- kann unterbrochen und fortgesetzt werden

**Tagesziele (vom Nutzer wahlbar):**

| Stufe | Name | Dauer | Umfang |
|-------|------|-------|--------|
| Leicht | Zuschauer | 2-3 Min. | 1 Zusammenfassung + 1 Quiz |
| Mittel | Teilnehmer | 5 Min. | Zusammenfassung + Quiz + 1 Abstimmung + Perspektivenwechsel |
| Intensiv | Engagiert | 10 Min. | 2 Zusammenfassungen + 2 Abstimmungen + 1 Kommentar |
| Maximal | Aktivist | 15-20 Min. | Volle Beteiligung uber alle Saulen |

---

#### GAM-07: Sitzungswoche-Live-Modus

> Als Nutzer mochte ich wahrend Bundestags-Sitzungswochen ein besonderes Live-Erlebnis haben, damit ich den Puls der Demokratie in Echtzeit spure.

Akzeptanzkriterien:
- Banner auf dem Home Screen: "Sitzungswoche -- Der Bundestag tagt"
- Bundestag-Themen werden mit "LIVE"-Indikator markiert
- Push-Notification vor Schlusselabstimmungen: "In 2 Stunden stimmt der Bundestag uber [X] ab"
- Nach Bundestag-Abstimmung: Sofortiger Vergleich Burger vs. Bundestag
- **2x Punkte-Multiplikator** fur Abstimmungen wahrend Sitzungswochen
- Echtzeit-Zahler: "347 Burger stimmen gerade parallel zum Bundestag ab"

---

#### GAM-08: Civic Quests (Wochentliche Missionen)

> Als Nutzer mochte ich wochentliche Missionen erhalten, die mich motivieren, verschiedene Bereiche der Plattform zu erkunden.

**Wochentliche Quests (Beispiele):**

| Quest | Beschreibung | Belohnung |
|-------|-------------|-----------|
| Informierter Wahler | 3 Zusammenfassungen lesen und abstimmen | +30 Punkte |
| Bruckenbauer | Einen Kommentar schreiben, der Bridging-Score >0.7 erreicht | +50 Punkte + Badge |
| Weiter Horizont | In 3 verschiedenen Kategorien abstimmen | +25 Punkte |
| Wahlkreis-Helfer | 5 Abstimmungen im Wahlkreis-Kontext | +30 Punkte |
| Quellenforscher | 2 Kommentare mit verifizierten Quellen schreiben | +40 Punkte |

**Story-Quests (einmalige Progressions-Meilensteine):**

| Quest-Reihe | Schritte | Narrative |
|-------------|----------|----------|
| Erste Schritte | Profil vervollstandigen, 5x abstimmen, 1 Kommentar | "Du hast deine ersten Schritte in der digitalen Demokratie gemacht." |
| Mein Wahlkreis | Wahlkreis wahlen, MdB-Profil ansehen, 3 lokale Abstimmungen | "Du kennst jetzt deinen demokratischen Heimatort." |
| Die andere Seite | 3 Bridging-Kommentare, 5x Perspektivenwechsel gemacht | "Du hast gelernt, Brucken zu bauen." |

---

#### GAM-09: Demokratie-Saisons (90 Tage)

> Als Nutzer mochte ich in thematischen 90-Tage-Saisons teilnehmen, die der Plattform einen Rhythmus geben.

**Saison-Struktur:**
- Jede Saison hat ein Schwerpunktthema (z.B. "Klimasaison", "Bildungssaison")
- Freier Fortschritts-Track mit 30 Stufen
- Stufen werden durch Beteiligung freigeschaltet
- Saison-exklusive Badges (nur wahrend der Saison verdienbar)
- Am Ende der Saison: Saison-Zusammenfassung fur jeden Nutzer

**Beispiel-Track (Stufen-Auszug):**

| Stufe | Meilenstein | Belohnung |
|-------|-----------|-----------|
| 1 | Erste Abstimmung der Saison | Saison-Badge (Bronze) |
| 5 | 10 Abstimmungen | Profil-Rahmen der Saison |
| 10 | Erster Kommentar mit Quellenangabe | "Quellenforscher"-Badge |
| 15 | Bridging-Score >0.7 | "Bruckenbauer der Saison"-Badge |
| 20 | An einem Burgergipfel teilgenommen | Saison-Badge (Silber) |
| 25 | Thema erstellt mit 100+ Stimmen | "Initiator"-Badge |
| 30 | 30-Tage-Streak | Saison-Badge (Gold) |

**Wichtig:** Kein bezahlter Premium-Track. Alle Saison-Belohnungen sind fur jeden erreichbar.

---

#### GAM-10: Demokratie-Wrapped (Jahresreport) -- MUST HAVE

> Als Nutzer mochte ich Ende des Jahres einen personlichen, teilbaren Demokratie-Report erhalten, der mir zeigt, was meine Beteiligung bewirkt hat.

**Inhalt des Jahresreports:**

| Slide | Inhalt | Beispiel |
|-------|--------|---------|
| 1 | Gesamte Abstimmungen | "Du hast 2026 zu 147 Themen abgestimmt" |
| 2 | Aktivster Monat | "Dein aktivster Monat war Marz" (Balkendiagramm) |
| 3 | Bundestag-Ubereinstimmung | "Du stimmst zu 68% mit dem Bundestag uberein" |
| 4 | Wahlkreis-Ranking | "Dein Wahlkreis Freiburg: Platz 23 von 299 mit 12.340 Stimmen" |
| 5 | Bruckenbau-Score | "Dein Bridging-Score: 7.2/10 -- besser als 82% der Nutzer" |
| 6 | Top-Kategorie | "Dein Thema #1: Umwelt & Klima" |
| 7 | Streak-Rekord | "Dein langster Streak: 45 Tage" |
| 8 | Demokratie-Typ | "Du bist ein Bruckenbauer" (basierend auf Civic Character Sheet) |
| 9 | Kollektive Wirkung | "Gemeinsam haben wir 89 Ergebnisse an MdBs gesendet" |
| 10 | Share-Card | Optimiert fur Instagram Stories / WhatsApp |

Akzeptanzkriterien:
- Verfugbar ab Dezember fur alle Nutzer mit >10 Abstimmungen im Jahr
- Jede Slide ist einzeln als Bild teilbar (OG-Image-Generierung serverseitig)
- Plattform-weiter "Demokratie-Jahresbericht" wird ebenfalls veroffentlicht (aggregierte Statistiken)
- Design: Minimalistisch, Schwarz/Weiss/Indigo, grosse Zahlen, Inter-Schrift
- Strikt Opt-in fur das Teilen -- kein automatisches Posting

**Plattform-Jahresbericht (offentlich):**
- Meistdiskutierte Themen des Jahres
- Grosste Abweichungen zwischen Burgern und Bundestag
- Aktivste Wahlkreise
- Gesamtzahl Abstimmungen, Kommentare, gesendete MdB-Mails
- Wird an Medien und Politik aktiv kommuniziert (Pressearbeit)

---

#### GAM-12: Civic Character Sheet (6 Attribute)

> Als Nutzer mochte ich ein "Demokratie-Profil" mit 6 Attributen sehen, das meine demokratische Personlichkeit widerspiegelt.

**Die 6 Civic-Attribute:**

| Attribut | Wie es wachst | Was es darstellt |
|----------|--------------|-----------------|
| **Wissen** | Zusammenfassungen lesen, Quizfragen beantworten, verschiedene Kategorien erkunden | Verstandnis politischer Themen |
| **Stimme** | Abstimmungen, Bundestag-Parallelabstimmungen, Streaks | Konstante demokratische Teilnahme |
| **Diskurs** | Kommentare mit Quellen, hohe Bridging-Scores | Qualitat der argumentativen Beitrage |
| **Initiative** | Themen erstellen, Burgerinitiativen starten | Agenda-Setting und Mobilisierung |
| **Empathie** | Bridging-Achievements, Perspektivenwechsel, Engagement mit Gegenpositionen | Fahigkeit zum parteiubergreifenden Verstandnis |
| **Vertrauen** | Moderationsgenauigkeit, Report-Qualitat, Community-Anerkennung | Verdientes Vertrauen der Gemeinschaft |

- Darstellung: Hexagon/Radar-Chart im Profil
- Jedes Attribut: Skala 1-20
- Wird Teil des Demokratie-Wrapped ("Du bist ein Bruckenbauer" wenn Empathie am hochsten)
- Optional offentlich sichtbar

---

#### GAM-14: Demokratie-Puls (Plattform-Health-Score)

> Als Nutzer mochte ich auf einen Blick sehen, wie es um die demokratische Beteiligung auf der Plattform steht.

**Zusammengesetzter Score aus:**
- Beteiligungsrate (% aktive Nutzer diese Woche)
- Bridging-Qualitat (Durchschnitt uber Diskussionen)
- Geografische Abdeckung (aktive Wahlkreise)
- Diversitatsindex (werden beide Seiten vertreten?)
- Feedback-Schleife (gesendete und beantwortete MdB-Mails)

Darstellung: Ein pulsierender Indigo-Kreis auf dem Home Screen, grosser bei hoher Aktivitat.

---

#### Ethische Gamification-Prinzipien

Diese Prinzipien gelten fur alle Gamification-Features:

1. **Gewohnheit gamifizieren, nie die politische Wahl.** Punkte gibt es fur *dass* man teilnimmt, nie fur *wie* man abstimmt.
2. **Kooperation vor Wettbewerb.** Wahlkreis-Fortschritt und Themen-Teams sind kooperativ. Ranglisten nur als sekundare, opt-in Layer.
3. **Qualitat vor Quantitat.** Bridging-Kommentare bringen 50 Punkte, ein Like nur 0. Die Gewichtung ist bewusst extrem.
4. **Keine Dark Patterns.** Streaks werden empathisch kommuniziert. Kein "Letzte Chance!"-FOMO. Keine Sunk-Cost-Ausnutzung.
5. **Keine Pay-to-Win.** Alle Gamification-Features sind fur kostenlose Nutzer zuganglich. Premium = erweiterte Analysen, nie Vorteile.
6. **Transparenz.** Alle Algorithmen, Punktewertungen und Mechanismen sind auf `/transparenz` dokumentiert.
7. **Inklusivitat.** Verschiedene Tages-Stufen (2 Min. bis 20 Min.) fur verschiedene Lebensrealitaten.

---

### 3.7 Feed & Discovery

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| FEED-01 | Home Feed (Bundestag + Nutzer-Themen gemischt) | 1 | Must |
| FEED-02 | Kategorie-Filter | 1 | Must |
| FEED-03 | Trending-Themen | 1 | Should |
| FEED-04 | Volltextsuche uber Themen und Kommentare | 1 | Must |
| FEED-05 | Wahlkreis-personalisierter Feed | 2 | Should |
| FEED-06 | Push-Benachrichtigungen "Neue Abstimmung" | 1 | Must |
| FEED-07 | Gespeicherte/Gemerkte Themen | 1 | Should |
| FEED-08 | Feed-Algorithmus-Transparenzseite | 1 | Must |
| FEED-09 | Nachrichtenkontext pro Bundestag-Thema | 1 | Must |
| FEED-10 | Personalisierung nach Onboarding-Interessen | 1 | Must |

#### User Stories

**FEED-01: Home Feed**

> Als Nutzer mochte ich auf dem Startbildschirm die relevantesten aktuellen Themen sehen, damit ich schnell abstimmen und mich informieren kann.

Akzeptanzkriterien:
- Feed zeigt Mix aus Bundestag-Themen (80%) und Nutzer-Themen (20%)
- Feed-Karten zeigen: Titel, Quell-Badge (Bundestag/Burger), Kategorie, Abstimmungszahler, Kommentarzahler, verbleibende Abstimmungszeit, "Abstimmen"-Button
- Infinite Scroll mit Skeleton-Loading
- Pull-to-Refresh auf mobilen Geraten

**FEED-08: Transparenzseite**

> Als Nutzer mochte ich verstehen, nach welchen Regeln der Feed sortiert wird, damit ich der Plattform vertrauen kann.

Akzeptanzkriterien:
- Offentlich zugangliche Seite unter `/transparenz/algorithmus`
- Beschreibt den Feed-Algorithmus in verstandlicher Sprache
- Listet alle Boost-Faktoren mit Gewichtung auf
- Erklart den Bridging-Algorithmus
- Wird bei jeder Anderung aktualisiert

**FEED-09: Nachrichtenkontext**

> Als Nutzer mochte ich bei jedem Bundestag-Thema 2-3 relevante Nachrichtenlinks als Hintergrund sehen, damit ich mich vor der Abstimmung informieren kann.

Akzeptanzkriterien:
- Pro Bundestag-Thema: 2-3 kuratierte Links zu Nachrichtenartikeln (Tagesschau, ZEIT, FAZ, Spiegel etc.)
- Links werden KI-unterstutzt kuratiert: Automatische Vorschlage aus konfigurierten Quellen (Tagesschau, ZEIT, FAZ, Spiegel), manuell erganzbar
- Darstellung: Unterhalb der Zusammenfassung als "Hintergrund lesen"-Sektion
- Jeder Link: Quelle (Icon + Name), Uberschrift, Erscheinungsdatum
- Links offnen sich im In-App-Browser (kein Verlassen der App)
- Nachrichtenquellen sind auf eine kuratierte Whitelist beschrankt (seriose Medien), um Filterblasen und Desinformation zu vermeiden

**FEED-10: Personalisierung nach Interessen**

> Als Nutzer mochte ich Inhalte sehen, die zu meinen im Onboarding gewahlten Interessen passen, damit der Feed sofort relevant ist.

Akzeptanzkriterien:
- Onboarding-Interessen erhohen den Feed-Score fur passende Kategorien um +50%
- Nutzer kann Interessen jederzeit in Einstellungen andern
- Feed zeigt trotzdem auch andere Kategorien (Diversitat), nur mit niedrigerem Score
- "Weil du dich fur [Umwelt] interessierst"-Label bei personalisierten Empfehlungen

#### Feed-Algorithmus (regelbasiert, keine KI)

Chronologische Basis mit Boosting-Faktoren:
- **Aktualitat:** Exponentielle Abnahme, Halbwertszeit 48 Stunden
- **Aktives Abstimmungsfenster:** +100% Boost
- **Kategorien-Match** (aus Onboarding + organisches Verhalten): +50% Boost
- **Wahlkreis-Relevanz:** +30% Boost
- **Engagement-Geschwindigkeit** (Stimmen/Stunde): +20% Boost
- **Bundestag/Burger-Ratio:** 80/20 wird erzwungen
- **Sitzungswoche-Boost:** Wahrend Bundestag-Sitzungswochen +50% fur Bundestag-Themen
- Alle Gewichtungen sind auf `/transparenz/algorithmus` dokumentiert

---

### 3.8 Profil & Einstellungen

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| PROF-01 | Nutzerprofil (Name, Wahlkreis, Bio) | 1 | Must |
| PROF-02 | Abstimmungshistorie (nur eigene, Standard: privat) | 1 | Must |
| PROF-03 | Offentliches Profil (opt-in) | 1 | Should |
| PROF-04 | Benachrichtigungs-Einstellungen | 1 | Must |
| PROF-05 | Kategorie-Interessen auswahlen | 1 | Should |
| PROF-06 | Datenexport (DSGVO Art. 20) | 1 | Must |
| PROF-07 | Account-Loschung mit Daten-Purge | 1 | Must |
| PROF-08 | Barrierefreiheits-Einstellungen (Schriftgrosse, Kontrast, Reduzierte Bewegung) | 1 | Must |
| PROF-09 | Sprache (Deutsch Phase 1, Leichte Sprache Phase 2) | 1/2 | Must/Should |

#### User Stories

**PROF-06: Datenexport**

> Als Nutzer mochte ich alle meine personenbezogenen Daten als JSON-Datei herunterladen konnen, damit ich mein Recht auf Datenubertragbarkeit (DSGVO Art. 20) ausuben kann.

Akzeptanzkriterien:
- Button in den Einstellungen: "Meine Daten exportieren"
- Export enthalt: Profil-Daten, Abstimmungshistorie, Kommentare, Reputation, Einstellungen
- Format: JSON
- Download-Link per Email (gultig 24 Stunden)
- Export-Generierung innerhalb von 5 Minuten

#### Benachrichtigungstypen (PROF-04 Detail)

**In-App (Badge + Dropdown vom Home-Tab):**

| Typ | Trigger | Text-Muster | Phase |
|-----|---------|-------------|-------|
| `new_vote` | Neue Bundestag-Abstimmung in eigener Kategorie | "Neues Thema: [Titel] -- Stimme jetzt ab" | 1 |
| `vote_result` | Abstimmung endet | "Ergebnis: [Titel] -- 68% sagten Ja" | 1 |
| `bundestag_result` | Bundestag stimmt uber gespiegeltes Thema ab | "Der Bundestag hat uber [Titel] abgestimmt -- vergleiche!" | 1 |
| `comment_reply` | Antwort auf eigenen Kommentar | "[Name] hat auf deinen Kommentar geantwortet" | 1 |
| `bridging_achievement` | Eigener Kommentar erreicht Bridging >0.7 | "Dein Kommentar baut Brucken! Bridging-Score: 0.82" | 1 |
| `streak_milestone` | 7, 30, 100, 365 Tage Streak | "Streak-Meilenstein: 30 Tage! Weiter so." | 1 |
| `quest_complete` | Quest abgeschlossen | "Quest erledigt: Bruckenbauer -- +50 Punkte" | 2 |
| `wahlkreis_update` | Wahlkreis erreicht neue Stufe | "Dein Wahlkreis [Name] ist auf Stufe 3!" | 1 |
| `mdb_voted` | Wahlkreis-MdB hat abgestimmt | "[MdB-Name] hat bei [Thema] [Ja] gestimmt" | 2 |
| `topic_activated` | Eigenes Thema erreicht Unterstutzerschwelle | "Dein Thema [Titel] ist jetzt aktiv!" | 1 |
| `system` | Plattform-Updates, Wartung | Frei formuliert | 1 |

**Push-Notifications (Web Push API):**
- Opt-in bei Installation/Onboarding
- Nur fur: `new_vote`, `bundestag_result`, `streak_milestone` (reduziert, kein Spam)
- Max. 3 Push-Notifications pro Tag

#### Transaktionale Emails

| Email | Trigger | Inhalt | Phase |
|-------|---------|--------|-------|
| Willkommen | Registrierung | Bestatigung + Quick-Start-Guide | 1 |
| Email-Verifizierung | Registrierung | Double-Opt-in Link (24h gultig) | 1 |
| Magic Link | Login-Anfrage | Login-Link (15 Min. gultig) | 1 |
| Passwort-Reset | Reset-Anfrage | Reset-Link (1h gultig) | 1 |
| Wochentlicher Digest | Montag 8:00 CET | Top 3 Themen der Woche, abgeschlossene Ergebnisse, Streak-Status | 1 |
| Abstimmungs-Ergebnis | Abstimmung endet | "Du hast bei [Thema] abgestimmt -- hier ist das Ergebnis" | 1 |
| Bundestag-Vergleich | BT stimmt ab | "Der Bundestag hat anders gestimmt als du bei [Thema]" | 1 |
| Re-Engagement | 7 Tage inaktiv | "Du hast seit einer Woche nicht abgestimmt -- hier sind 3 aktuelle Themen" | 2 |
| Account-Loschung | Loschungs-Bestatigung | Bestatigung + 30-Tage-Frist-Info | 1 |
| Datenexport | Export fertig | Download-Link (24h gultig) | 1 |
| MdB-Ergebnis-Email | Abstimmung endet (>50 WK-Stimmen) | An MdB: Wahlkreis-Ergebnis + Top-3-Argumente | 2 |

**Email-Design:** Minimalistisch, Schwarz/Weiss + Indigo CTA-Button, responsive, Resend als Provider.

#### Empty States

| Screen | Empty State | Aktion |
|--------|------------|--------|
| Home Feed (keine Themen) | "Gerade ist es ruhig. Neue Bundestag-Themen werden automatisch importiert." | Button: "Eigenes Thema erstellen" |
| Kommentare (0) | "Noch keine Kommentare. Sei der Erste!" | Kommentar-Eingabefeld direkt sichtbar |
| Suchergebnisse (0) | "Keine Ergebnisse fur '[Suche]'. Versuche andere Begriffe." | Vorschlage: Trending-Themen |
| Wahlkreis (0 Nutzer) | "Dein Wahlkreis wartet auf dich! Du bist der Erste hier." | CTA: "Lade Nachbarn ein" |
| Profil (0 Abstimmungen) | "Du hast noch nicht abgestimmt. Starte mit deiner ersten Stimme." | Button: "Zum Feed" |
| Benachrichtigungen (0) | "Keine neuen Benachrichtigungen." | Keine Aktion |
| Streak (0) | "Starte deinen ersten Demokratie-Streak heute!" | Button: "Tagliche Session starten" |

---

### 3.9 Gruppen & Fraktionen

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| GRP-01 | Gruppe erstellen (Partei/Fraktion/Interessengruppe/Custom) | 2 | Should |
| GRP-02 | Gruppen-interne Themen und Abstimmungen | 2 | Should |
| GRP-03 | Mitgliederverwaltung (Rollen: Mitglied/Moderator/Admin) | 2 | Should |
| GRP-04 | Sichtbarkeit (offentlich/privat) | 2 | Should |
| GRP-05 | Gruppenstatistiken (Mitglieder, Abstimmungsverhalten) | 3 | Could |

#### User Stories

**GRP-01: Gruppe erstellen**

> Als Nutzer mochte ich eine Gruppe grunden konnen, um mich mit Gleichgesinnten zu organisieren und gemeinsam Positionen zu erarbeiten.

Akzeptanzkriterien:
- Gruppentypen: Partei, Fraktion, Interessengruppe, Custom
- Pflichtfelder: Name, Beschreibung, Typ
- Optionale Felder: Logo, Satzung/Regeln, Website
- Ersteller wird automatisch Admin
- Offentliche Gruppen sind fur alle sichtbar und beitrittsoffen
- Private Gruppen nur auf Einladung

---

### 3.10 Ergebniskommunikation

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| ERG-01 | Offentliches Ergebnis-Dashboard pro Thema | 1 | Must |
| ERG-02 | Einbettbare Ergebnis-Widgets | 2 | Should |
| ERG-03 | Auto-generierte Pressemitteilungen | 3 | Could |
| ERG-04 | Direkte Email an Wahlkreis-MdB mit Ergebnis | 2 | Should |
| ERG-05 | Social-Media-Sharing der Ergebnisse | 2 | Should |
| ERG-06 | Open Data API fur Ergebnisse | 2 | Should |
| ERG-07 | Quartalsweiser Demokratiereport | 3 | Could |
| ERG-08 | Feedback-Loop-Visualisierung ("Vom Gedanken zum Gesetz") | 1 | Must |
| ERG-09 | "Ich habe abgestimmt"-Share-Card | 1 | Must |
| ERG-10 | Echtzeit-Teilnahme-Zahler | 1 | Should |

#### User Stories

**ERG-01: Offentliches Dashboard**

> Als Besucher (auch ohne Account) mochte ich die Ergebnisse abgeschlossener Abstimmungen einsehen konnen, damit die Transparenz der Plattform gewahrleistet ist.

Akzeptanzkriterien:
- Ergebnis-Seite ist offentlich zuganglich (kein Login erforderlich)
- Darstellung: Kreisdiagramm + Balkendiagramm
- Angezeigt: Gesamtstimmen, prozentuale Verteilung, Vergleich mit Bundestag (wenn zutreffend)
- Direktlink teilbar

**ERG-08: Feedback-Loop-Visualisierung**

> Als Burger mochte ich sehen, was mit meiner Stimme passiert ist -- vom Gedanken bis zum Gesetz -- damit ich weiss, dass meine Beteiligung Wirkung hat.

Akzeptanzkriterien:
- Pro Topic: Schritt-fur-Schritt-Visualisierung:
  1. Du hast abgestimmt (Haken, Datum)
  2. Wahlkreis-Ergebnis erstellt (Haken, Anzahl)
  3. Email an MdB gesendet (Haken, Datum)
  4. Bundestag hat abgestimmt (Haken/Ausstehend, mit Vergleich)
- Jeder Schritt animiert sanft beim Abschluss
- Sichtbar auf der Topic-Detail-Seite und im Profil unter "Meine Wirkung"
- Adressiert direkt das "Perceived Efficacy"-Problem (Forschung zeigt: Burger die sehen, dass ihre Beteiligung Wirkung hat, sind 2x eher aktiv)

**ERG-09: "Ich habe abgestimmt"-Share-Card**

> Als Nutzer mochte ich nach einer Abstimmung eine ansprechende Grafik teilen konnen, damit ich andere zur Teilnahme motiviere.

Akzeptanzkriterien:
- Nach Stimmabgabe: "Teilen"-Button generiert eine Bild-Karte
- Karte zeigt: Thema-Titel, "Ich habe abgestimmt", Anzahl Teilnehmer, Demokrat-Branding
- Design: Minimalistisch, Schwarz/Weiss/Indigo, grosse Typografie
- Optimiert fur: Instagram Stories (9:16), WhatsApp (1:1), Twitter/X (16:9)
- Enthalt NICHT, wie der Nutzer abgestimmt hat (Wahlgeheimnis)
- Enthalt CTA: "Stimme auch ab auf demokrat.de"
- Serverseitige Bildgenerierung (OG Image)

**ERG-10: Echtzeit-Teilnahme-Zahler**

> Als Nutzer mochte ich sehen, wie viele Menschen gerade gleichzeitig an der Demokratie teilnehmen, damit ich mich als Teil einer Bewegung fuhle.

Akzeptanzkriterien:
- Home Screen: "X Burger stimmen gerade ab" (Live-Zahler via Supabase Realtime)
- Topic Detail: "X Menschen diskutieren dieses Gesetz"
- Zahlen-Transition: Odometer-Stil (rollende Ziffern)
- Wahrend Sitzungswochen: Erhohte Sichtbarkeit des Zahlers

**ERG-04: Email an Wahlkreis-MdB**

> Als Burger mochte ich, dass mein Abgeordneter automatisch uber Abstimmungsergebnisse aus seinem Wahlkreis informiert wird, damit die Ergebnisse politische Wirkung entfalten.

Akzeptanzkriterien:
- Nach Abschluss einer Bundestag-Spiegel-Abstimmung: Automatische Email an den MdB des Wahlkreises
- Inhalt: Abstimmungsergebnis der Wahlkreis-Nutzer, Top-3-Argumente (nach Bridging-Score), Link zum Dashboard
- MdB kann sich von Emails abmelden (Opt-out)
- Emails nur versenden wenn mindestens 50 Wahlkreis-Nutzer abgestimmt haben

---

### 3.11 Administration & Moderation

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| ADM-01 | Admin-Dashboard | 1 | Must |
| ADM-02 | Content-Moderations-Queue | 1 | Must |
| ADM-03 | Nutzerverwaltung | 1 | Must |
| ADM-04 | Bundestag-Sync-Monitoring | 1 | Must |
| ADM-05 | Analytics-Dashboard | 1 | Should |
| ADM-06 | System-Health-Monitoring | 1 | Must |
| ADM-07 | Audit-Log | 1 | Must |
| ADM-08 | Feature Flags | 1 | Should |

#### User Stories

**ADM-02: Moderations-Queue**

> Als Moderator mochte ich gemeldete Inhalte in einer Queue sehen und bearbeiten konnen, damit die Diskussionsqualitat gewahrt bleibt.

Akzeptanzkriterien:
- Queue zeigt: Gemeldeter Inhalt, Meldungsgrund, Melder, Zeitstempel
- Aktionen: Bestatigen (Inhalt ausblenden), Abweisen (Meldung verwerfen), Eskalieren (an Admin)
- Filter: Nach Typ (Kommentar/Thema/Nutzer), nach Status (Offen/Bearbeitet)
- Bei Bestatigung: Melder erhalt +3 Reputation; Gemeldeter erhalt Verwarnung

---

### 3.12 PWA & Mobile Experience

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| PWA-01 | Service Worker fur Offline-Caching | 1 | Must |
| PWA-02 | Web App Manifest | 1 | Must |
| PWA-03 | Push-Benachrichtigungen (Web Push API) | 1 | Must |
| PWA-04 | Install-Prompt / Add to Homescreen | 1 | Must |
| PWA-05 | Offline-Vote-Queueing (Sync bei Reconnect) | 2 | Should |
| PWA-06 | Native-feel Animationen und Transitionen | 1 | Must |
| PWA-07 | Bottom Navigation Bar (mobil) | 1 | Must |
| PWA-08 | Pull-to-Refresh | 1 | Must |
| PWA-09 | Splash Screen | 1 | Must |

#### User Stories

**PWA-06: Native-feel**

> Als Nutzer auf dem Smartphone mochte ich, dass sich die App wie eine native App anfuhlt, damit die Bedienung intuitiv und angenehm ist.

Akzeptanzkriterien:
- Smooth Page Transitions (kein harter Seitenwechsel)
- Haptic Feedback bei Stimmabgabe (vibrate API)
- Swipe-Gesten fur Navigation
- 60fps Scroll-Performance
- Bottom Sheet fur Vote-Interface (statt Modal)
- Kein sichtbarer Browser-Chrome nach Installation

**PWA-07: Bottom Navigation**

> Als mobiler Nutzer mochte ich eine Bottom Navigation Bar haben, damit ich mit dem Daumen alle Hauptbereiche erreichen kann.

Akzeptanzkriterien:
- **5 Tabs: Home (Feed) | Suche | Erstellen (+) | Karte | Profil**
- Aktiver Tab ist farblich hervorgehoben (Indigo)
- Inaktive Tabs: Mittelgrau
- Badge auf Home-Tab zeigt ungelesene Benachrichtigungen (rote Zahl)
- Benachrichtigungen sind als Dropdown vom Home-Tab erreichbar (kein eigener Tab)
- Karte als eigener prominenter Tab -- die kooperative Stadtsimulation ist ein Kern-Feature
- Verschwindet beim Scrollen nach unten, erscheint beim Scrollen nach oben
- Erstellen-Button (+) ist leicht grosser und zentriert (Indigo-Kreis)

---

### 3.13 Rechtliche Dokumente & Compliance-Seiten

#### Feature-Ubersicht

| ID | Feature | Phase | Prioritat |
|----|---------|-------|-----------|
| LEGAL-01 | Allgemeine Geschaftsbedingungen (AGB / Nutzungsbedingungen) | 1 | Must |
| LEGAL-02 | Datenschutzerklarung (mehrschichtig) | 1 | Must |
| LEGAL-03 | Impressum | 1 | Must |
| LEGAL-04 | Community Guidelines / Plattformregeln | 1 | Must |
| LEGAL-05 | Cookie-Banner (nur essenzielle Cookies, Opt-in fur Analytics) | 1 | Must |
| LEGAL-06 | Einwilligung Art. 9 DSGVO (separate Einwilligung vor erster Stimmabgabe) | 1 | Must |

#### User Stories

**LEGAL-01: AGB / Nutzungsbedingungen**

> Als Nutzer mochte ich vor der Registrierung die Nutzungsbedingungen lesen konnen, damit ich weiss, welche Regeln auf der Plattform gelten.

Akzeptanzkriterien:
- Zuganglich uber Footer-Link und Registrierungsseite
- Abdeckt: Nutzungsrechte, Account-Regeln, Haftungsausschluss, Kundigung
- Checkbox bei Registrierung: "Ich akzeptiere die Nutzungsbedingungen" (Pflicht)
- Route: `/nutzungsbedingungen`

**LEGAL-04: Community Guidelines**

> Als Nutzer mochte ich klare Regeln fur das Miteinander auf der Plattform kennen, damit ich weiss, was erlaubt ist und was nicht.

Akzeptanzkriterien:
- Zuganglich uber Footer-Link, Profil-Einstellungen und Moderations-Hinweise
- Abdeckt: Konstruktiver Diskurs, verbotene Inhalte (Hassrede, Spam, Desinformation), Konsequenzen (Verwarnungen, Sperre)
- Verlinkt im Melde-Dialog ("Verstoesst gegen unsere Community Guidelines")
- Route: `/community-regeln`
- Ton: Einladend, nicht drohend ("Wir wollen gemeinsam eine respektvolle Diskussionskultur aufbauen")

**LEGAL-05: Cookie-Banner**

> Als Besucher mochte ich uber den Einsatz von Cookies informiert werden und selbst entscheiden, welche ich akzeptiere.

Akzeptanzkriterien:
- Wird beim ersten Besuch angezeigt (nicht bei jedem Seitenaufruf)
- Zwei Optionen: "Nur notwendige" (Standard) und "Alle akzeptieren"
- Essenzielle Cookies (Auth-Session, CSRF) brauchen keine Einwilligung
- Analytics-Cookies nur mit explizitem Opt-in
- Einstellung jederzeit in `/einstellungen/datenschutz` anderbar
- Design: Minimalistisch, am unteren Rand, nicht die Seite blockierend

**LEGAL-06: Art. 9 Einwilligung**

> Als Nutzer mochte ich vor meiner ersten Abstimmung explizit einwilligen, dass meine politischen Meinungsdaten verarbeitet werden.

Akzeptanzkriterien:
- Einmalig vor der ersten Stimmabgabe: Bottom Sheet mit verstandlicher Erklarung
- Text: "Deine Abstimmungen sind politische Meinungen (Art. 9 DSGVO). Wir speichern sie pseudonym und sicher. Du kannst sie jederzeit loschen."
- Checkbox: "Ich willige ein" (Pflicht)
- Einwilligung wird mit Zeitstempel in `user_preferences` gespeichert
- Widerruf jederzeit moglich (in Einstellungen), loscht alle Abstimmungsdaten

#### Technische Notizen

- Alle rechtlichen Seiten sind statische MDX-Seiten (SSG, kein dynamischer Content)
- Rechtliche Dokumente werden versioniert (Datum im Footer der Seite)
- Bei AGB-Anderung: Nutzer mussen beim nachsten Login erneut zustimmen

---

## 4. Nicht-funktionale Anforderungen

### 4.1 Performance

| Metrik | Zielwert | Messmethode |
|--------|----------|-------------|
| Largest Contentful Paint (LCP) | <2s auf 3G, <1s auf 4G | Lighthouse CI |
| Time to Interactive (TTI) | <3s | Lighthouse CI |
| First Input Delay (FID) | <100ms | Web Vitals |
| Cumulative Layout Shift (CLS) | <0.1 | Web Vitals |
| API Response Time (p95) | <200ms (Reads), <500ms (Writes) | Application Metrics |
| Stimmabgabe End-to-End | <1s | Application Metrics |
| Real-time Updates Latenz | <500ms | Supabase Realtime Monitoring |
| Datenbank-Query (p95) | <50ms | PostgreSQL Monitoring |
| Lighthouse Score | >90 (alle Kategorien) | Lighthouse CI |

### 4.2 Skalierbarkeit

| Phase | Ziel | Strategie |
|-------|------|-----------|
| Phase 1 | 10.000 gleichzeitige Nutzer | Supabase Managed, Vercel Edge, Redis Caching |
| Phase 2 | 100.000 gleichzeitige Nutzer | Read Replicas, CDN fur Statik, horizontale App-Skalierung |
| Phase 3 | 1.000.000 gleichzeitige Nutzer | Sharding, dedizierte Voting-Microservices, Event Streaming |

- CDN fur statische Assets (Vercel Edge Network, EU PoPs)
- Redis Caching fur Hot Data (Feed, Abstimmungszahler)
- Supabase Edge Caching fur Auth-Tokens
- Database Read Replicas fur Ergebnis-Abfragen

### 4.3 Security

- **OWASP Top 10 Compliance** -- alle bekannten Angriffsvektoren adressiert
- **TLS 1.3** fur alle Verbindungen (Transport-Verschlusselung)
- **AES-256** fur ruhende Daten (Disk Encryption)
- **Row Level Security** auf allen nutzerbezogenen Tabellen
- **Rate Limiting:** 100 Req/Min unauthentifiziert, 300 Req/Min authentifiziert
- **CSRF-Schutz** uber SameSite Cookies + CSRF Tokens
- **Content Security Policy** Headers
- **Subresource Integrity** fur externe Skripte
- **Dependency Audits** (npm audit, Snyk) -- regelmassig und in CI
- **Penetration Testing** vor offentlichem Launch
- **Abstimmungsintegritat:** Append-only Event Store + Hash Chain + Audit Log

### 4.4 Datenschutz & DSGVO/BDSG Compliance

**Besondere Herausforderung:** Abstimmungsdaten sind **politische Meinungen** und fallen unter Art. 9 DSGVO (besondere Kategorien personenbezogener Daten). Dies erfordert erhohte Schutzmaßnahmen.

| Artikel | Anforderung | Umsetzung |
|---------|-------------|-----------|
| Art. 6(1)(a) | Rechtsgrundlage Einwilligung | Explizite Einwilligung bei Registrierung |
| Art. 9(2)(a) | Einwilligung fur besondere Kategorien | Explizite, separate Einwilligung vor erster Stimmabgabe: "Ich bin damit einverstanden, dass meine Abstimmungsdaten verarbeitet werden" |
| Art. 9(2)(e) | Offenkundig offentlich gemacht | Gilt fur Nutzer mit offentlichem Profil |
| Art. 13/14 | Informationspflichten | Mehrschichtige Datenschutzerklarung bei Registrierung |
| Art. 15 | Auskunftsrecht | Self-Service via Profil-Einstellungen |
| Art. 17 | Recht auf Loschung | Account-Loschung anonymisiert Votes, loscht PII innerhalb 30 Tagen |
| Art. 20 | Datenubertragbarkeit | JSON-Export aller personlichen Daten |
| Art. 25 | Privacy by Design | Datenminimierung, Pseudonymisierung der Vote-Analysen |
| Art. 30 | Verarbeitungsverzeichnis | Dokumentiert in Anhang C |
| Art. 35 | DSFA | Pflicht bei Art.-9-Daten -- Outline in Anhang D, muss vor Launch abgeschlossen sein |
| BDSG §22 | Zusatzliche Schutzmaßnahmen | Verschlusselung, Zugriffskontrolle, Protokollierung |

**Cookie-Policy:** Nur essenzielle Cookies im MVP. Analytics nur mit Opt-in-Einwilligung.

**Daten-Aufbewahrung:**
- Aktive Accounts: Daten bleiben erhalten
- Geloschte Accounts: PII innerhalb 30 Tagen geloscht; anonymisierte Aggregate bleiben dauerhaft
- Server-Logs: 90 Tage
- Datenstandort: Ausschliesslich EU (Deutschland bevorzugt)

### 4.5 Barrierefreiheit (BITV 2.0 / WCAG 2.1 AA / BFSG)

Seit Juni 2025 gilt das BFSG auch fur private digitale Produkte und Dienstleistungen.

**Verpflichtende Anforderungen:**
- Farbkontrast mindestens 4.5:1 (Normaltext), 3:1 (Grosstext)
- Vollstandige Tastaturnavigation fur alle interaktiven Elemente
- Screenreader-Kompatibilitat (ARIA Landmarks, Roles, Labels)
- Sichtbare Fokus-Indikatoren auf allen interaktiven Elementen
- Keine Information basiert allein auf Farbe
- Alle Bilder haben Alt-Text
- Formularfelder haben zugeordnete Labels
- Fehlermeldungen sind beschreibend und programmatisch verknupft
- `prefers-reduced-motion` wird respektiert
- Text auf 200% vergrosserbar ohne Inhaltsverlust
- Skip-Navigation-Links
- Semantisches HTML durchgangig
- `lang="de"` auf dem HTML-Element
- Leichte Sprache fur Hauptseiten (Phase 2)

**Testing:**
- axe-core automatisiert in CI/CD-Pipeline
- Manuelle Tests mit Screenreadern (NVDA, VoiceOver)
- Accessibility Audit vor Launch

### 4.6 Internationalisierung

- Phase 1: Nur Deutsch
- Architektur: i18n-ready von Tag 1 (next-intl oder vergleichbar)
- Datumsformate: Deutsch (DD.MM.YYYY)
- Zahlenformate: Deutsch (1.234,56)
- Phase 2: Leichte Sprache
- Phase 3: Englisch, ggf. Turkisch

### 4.7 Zuverlassigkeit & Verfugbarkeit

| Metrik | Phase 1 | Phase 3 |
|--------|---------|---------|
| Uptime | 99,5% | 99,9% |
| Wartungsfenster | Sonntag 02:00-06:00 CET | Gleich |
| Backup | Taglich + PITR, 7 Tage Retention | Taglich + PITR, 30 Tage |
| RTO (Recovery Time Objective) | 4 Stunden | 1 Stunde |
| RPO (Recovery Point Objective) | 1 Stunde | 15 Minuten |

- Health-Check-Endpoints fur Monitoring
- Graceful Degradation: Wenn Bundestag-API offline, werden gecachte Daten mit Hinweis angezeigt

### 4.8 Observability

- **Error Tracking:** Sentry (Client + Server)
- **Application Metrics:** Prometheus + Grafana Cloud
- **Log-Aggregation:** Strukturierte JSON-Logs, zentralisiert
- **Uptime Monitoring:** Externer Ping-Service (z.B. Better Uptime)
- **Custom Dashboards:** User-Registration-Funnel, Vote-Completion-Rate, API-Sync-Health
- **Alerting:** Grafana Alerting fur kritische Issues

---

## 5. Technologie-Stack & Architektur

### 5.1 Stack-Entscheidungen

| Layer | Wahl | Alternativen erwogen | Begrundung |
|-------|------|---------------------|------------|
| **Frontend** | Next.js 15+ (App Router), React 19, TypeScript | Nuxt/Vue, SvelteKit, Rails+Hotwire | SSR fur SEO, React Server Components fur Performance, grosstes Okosystem, ein Framework fur Frontend+API |
| **UI-Bibliothek** | Tailwind CSS + shadcn/ui | Material UI, Chakra UI, Ant Design | Utility-first fur Geschwindigkeit; shadcn gibt barrierefreie, anpassbare Komponenten die keine Abhangigkeit sind sondern in den Code kopiert werden |
| **Type System** | TypeScript (strict mode) | JavaScript, Flow | Fangt Bugs zur Compile-Zeit, selbstdokumentierend, essentiell fur Solo-Entwicklung |
| **API Layer** | tRPC | REST, GraphQL | End-to-End Typsicherheit mit TypeScript, keine Code-Generierung, schlanker als GraphQL fur Solo-Dev |
| **Datenbank** | PostgreSQL 16+ (via Supabase) | MySQL, MongoDB, CockroachDB | JSONB fur Event-Payloads, RLS fur Sicherheit, ACID-konform, exzellent fur Event Sourcing, Standard in Civic Tech |
| **BaaS** | Supabase (Managed) | Firebase, Custom Backend | Auth, Realtime, Storage, Edge Functions in einer Plattform; PostgreSQL darunter; EU-Hosting verfugbar; Open Source |
| **Real-time** | Supabase Realtime | Socket.IO, Pusher, Ably | Broadcast + Presence + Postgres Changes; kein separater WebSocket-Server notig |
| **Cache** | Redis (Upstash) | Memcached, Supabase Edge | Serverless Redis mit EU-Region, Pay-per-Request, ideal fur Solo-Budget |
| **Suche** | Meilisearch Cloud | Elasticsearch, Typesense, Algolia | Tippfehler-tolerant, schnell, deutsche Sprachunterstutzung, EU-Hosting |
| **Hosting** | Vercel (Frontend) + Supabase (Backend) | Fly.io, Railway, Hetzner, AWS | Vercel hat erstklassigen Next.js-Support; beide bieten EU-Regionen; berechenbares Pricing |
| **CI/CD** | GitHub Actions | GitLab CI, CircleCI | Kostenlos fur Public Repos, exzellentes Next.js-Okosystem |
| **Monitoring** | Sentry + Grafana Cloud | Datadog, New Relic | Sentry Free Tier reicht fur Solo; Grafana Cloud Free Tier fur Metriken |
| **Email** | Resend | SendGrid, Postmark, Mailgun | Moderne transaktionale Email-API, DSGVO-konform, gute DX |
| **Datei-Storage** | Supabase Storage | AWS S3, Cloudflare R2 | Integriert mit Auth, RLS auf Buckets, S3-kompatibel |
| **Karten** | react-map-gl + Mapbox GL JS | Leaflet, D3, MapLibre | Best-in-class Touch-Gesten, Choropleth out-of-the-box, Free Tier 50k Map Loads/Monat |
| **GeoJSON** | Bundeswahlleiter Open Data + Mapbox Tileset | Nur statisch, nur Tileset | Statisches TopoJSON als Fallback + Mapbox Tileset fur performante Kartenansicht |
| **OG-Image** | @vercel/og (Satori) | Puppeteer, Sharp | Serverseitige Bildgenerierung fur Share-Cards und Wrapped, Edge-kompatibel, kein Browser notig |
| **Payment** | Stripe | LemonSqueezy, Paddle | Standard fur SaaS in DE, niedrige Fees (1,5% + 0,25EUR), exzellente API, Stripe Tax fur EU-USt |
| **Rate Limiting** | @upstash/ratelimit | Custom Redis, express-rate-limit | Serverless-kompatibel, Sliding Window, integriert mit Upstash Redis |
| **KI Content** | OpenAI API (GPT-4o) | Anthropic Claude, Gemini | Fur Content-Pipeline: Zusammenfassungen, Quiz, Nachrichtenlinks. Kein Endnutzer-Facing KI-Feature |

### 5.2 Architektur-Ubersicht

```
[Client: Next.js PWA (Vercel)]
    |
    |-- tRPC Calls --> [Next.js API Routes / tRPC Router]
    |                       |
    |                       |-- Supabase Client --> [Supabase]
    |                       |       |-- Auth (JWT)
    |                       |       |-- PostgreSQL (RLS)
    |                       |       |-- Realtime (WebSocket)
    |                       |       |-- Storage (S3)
    |                       |
    |                       |-- Redis (Upstash) --> [Cache Layer]
    |                       |
    |                       |-- Meilisearch --> [Search Index]
    |
    |-- Supabase Realtime (WebSocket) --> [Live Updates]

[Cron Worker: Vercel Cron / Supabase Edge Functions]
    |
    |-- DIP API (Bundestag) --> [Daten-Sync]
    |-- abgeordnetenwatch API --> [Daten-Sync]
    |-- Lobbyregister API --> [Daten-Sync]
    |-- OpenAI API --> [Content-Pipeline: Zusammenfassungen, Quiz, News-Links]
    |
    +--> PostgreSQL (Write via Supabase Service Role)
    +--> Meilisearch (Index Update)

[Externe Services]
    |-- Mapbox GL JS --> [Wahlkreis-Karte, Choropleth]
    |-- Stripe --> [Premium-Abonnements, Webhooks]
    |-- @vercel/og (Satori) --> [Share-Cards, OG Images]
```

### 5.3 Event Sourcing Architektur (Detail)

**Warum Event Sourcing fur Abstimmungen:**
- Unveranderlichkeit: Stimmen konnen nicht manipuliert werden
- Audit Trail: Jede Aktion ist nachvollziehbar
- Hash Chain: Manipulationserkennung durch kryptographische Verkettung
- Temporale Abfragen: Historische Zustande jederzeit rekonstruierbar
- CQRS: Schreib- und Lesepfad unabhangig skalierbar

**Schreibpfad:**
1. Nutzer gibt Stimme ab -> tRPC Mutation `votes.cast`
2. Validierung: Nutzer authentifiziert? Topic aktiv? Abstimmungsfenster offen? Format-spezifische Regeln?
3. Event erstellen: `event_id`, `stream_id`, `event_type='VoteCast'`, `payload`, `prev_hash`
4. Event in `vote_events` INSERT (append-only, keine UPDATEs/DELETEs)
5. PostgreSQL Trigger aktualisiert `vote_results` Projektion
6. Supabase Realtime broadcastet Update an alle Subscriber

**Lesepfad:**
1. Client subscribt auf `vote_results` via Supabase Realtime
2. Ergebnis-Abfragen lesen nur aus `vote_results` (nie aus `vote_events`)
3. Schnelle Antwortzeiten durch vorberechnete Aggregate

**Hash Chain:**
- Jedes Event enthalt `prev_hash = SHA256(vorheriges Event)`
- Ein Verifikations-Endpoint kann die gesamte Kette validieren
- Jede Manipulation in der Mitte der Kette bricht alle nachfolgenden Hashes

### 5.4 Daten-Sync Architektur

- **Cron-Schedule:** Alle 15 Minuten wahrend Bundestag-Sitzungswochen, alle 6 Stunden sonst
- **Idempotent:** DIP-API `f.aktualisiert.start={last_sync}` verhindert Duplikate
- **Konfliktlosung:** DIP/abgeordnetenwatch-Daten sind autoritativ; interne Anreicherungen sind separate Felder
- **Fehlerbehandlung:** 3 Retries mit exponential Backoff -> Alert -> veraltete Daten mit Hinweis anzeigen
- **Rate Limiting:** abgeordnetenwatch Pagination max 1.000 pro Request; Backoff bei 429

**Sitzungswochen-Erkennung:**
- Der Bundestag veroffentlicht den Sitzungskalender als offene Daten auf bundestag.de
- Sitzungswochen werden als Konfigurationstabelle (`sitzungswochen`) importiert: Start-/Enddatum pro Sitzungswoche
- Ein Cron-Job pruft taglich, ob eine Sitzungswoche aktiv ist, und setzt ein globales Flag
- Wahrend Sitzungswochen: 2x Punkte-Multiplikator, 15-Min-Sync-Intervall, Live-Banner im Feed

**Streak-Timezone:**
- Ein "Tag" fur Streak-Berechnung basiert auf **CET/CEST** (Europe/Berlin)
- Reset um Mitternacht CET/CEST -- alle Nutzer in Deutschland haben denselben Tageswechsel
- `daily_activity.activity_date` speichert das Datum in CET/CEST, nicht UTC

**MdB-Kontaktdaten (fur ERG-04):**
- abgeordnetenwatch API liefert Kontaktdaten der MdBs (Email uber Profil-Seiten)
- Alternativ: Bundestag-Website listet offizielle Email-Adressen aller MdBs (Muster: vorname.nachname@bundestag.de)
- Emails werden nur an die offentliche Bundestag-Email gesendet, nie an private Adressen

### 5.5 Architecture Decision Records (ADRs)

#### ADR-001: Event Sourcing fur Abstimmungen statt CRUD

**Kontext:** Abstimmungsdaten mussen manipulationssicher, auditierbar und nachvollziehbar sein. Dies ist kein technisches Nice-to-have, sondern eine demokratische Grundvoraussetzung.

**Entscheidung:** Alle Abstimmungsereignisse werden als unveranderliche Events in einem append-only Event Store gespeichert. Lesbare Ergebnisse werden als Projektionen materialisiert.

**Begrundung:** CRUD erlaubt stille Anderungen an Datensatzen. Event Sourcing macht jede Anderung transparent und kryptographisch verifizierbar.

**Konsequenzen:** Hohere initiale Komplexitat fur einen Solo-Entwickler; dafur maximale Vertrauenswurdigkeit der Plattform.

#### ADR-002: tRPC uber REST oder GraphQL

**Kontext:** Als Solo-TypeScript-Entwickler ist durchgangige Typsicherheit der starkste Produktivitatshebel.

**Entscheidung:** tRPC fur die gesamte Client-Server-Kommunikation.

**Begrundung:** Kein Schema zu pflegen (REST: OpenAPI, GraphQL: Schema), keine Code-Generierung, TypeScript-Types fliessen automatisch vom Server zum Client.

**Konsequenzen:** Enger an TypeScript/Next.js gebunden; externe API-Konsumenten brauchen einen separaten REST-Layer (Open Data API in Phase 2).

#### ADR-003: Bridging-Algorithmus uber einfache Upvotes

**Kontext:** Einfache Upvote-Systeme verstarken Echokammern -- populare Meinungen werden sichtbarer, Minderheitenpositionen verschwinden.

**Entscheidung:** Kommentare werden nach einem Bridging-Score sortiert, der die Zustimmung uber politische Lagergrenzen hinweg misst.

**Begrundung:** Community Notes (X/Twitter) hat bewiesen, dass Bridging-Algorithmen effektiv polarisierende Inhalte deprioritisieren. Der Algorithmus ist mathematisch (Matrix-Faktorisierung), nicht KI-basiert.

**Konsequenzen:** Hoherer Implementierungsaufwand; dafur ist Anti-Polarisierung ein Kernfeature und Alleinstellungsmerkmal.

#### ADR-004: KI fur Content-Erstellung, nicht fur Algorithmen

**Kontext:** Als Solo-Grunder ist die redaktionelle Erstellung von Zusammenfassungen, Quiz-Fragen und Nachrichtenlinks fur hunderte Gesetzentwurfe nicht manuell leistbar. Gleichzeitig mussen Abstimmungs- und Ranking-Algorithmen transparent und auditierbar bleiben.

**Entscheidung:** KI wird fur die Content-Pipeline eingesetzt (Zusammenfassungen, Quiz-Fragen, Nachrichtenlink-Vorschlage). Alle Abstimmungs- und Ranking-Algorithmen bleiben regelbasiert und mathematisch nachvollziehbar (kein ML/KI).

**Begrundung:** Die Unterscheidung ist: KI als Redaktionswerkzeug (skaliert Content-Erstellung) vs. KI als Entscheidungstrager (ware intransparent). Zusammenfassungen und Quiz-Fragen sind informativ, nicht entscheidend -- sie beeinflussen nicht, wie Stimmen gewichtet oder Kommentare gerankt werden.

**Konsequenzen:** Schnellere Content-Pipeline, mehr Themen konnen zeitnah abgedeckt werden. Bridging-Algorithmus, Feed-Sortierung und Reputation bleiben deterministisch und auf `/transparenz` dokumentiert. Keine Kennzeichnungspflicht fur KI-generierte Inhalte.

#### ADR-005: PWA uber native Apps

**Kontext:** Ein Solo-Entwickler kann nicht drei Codebasen (Web, iOS, Android) pflegen.

**Entscheidung:** Web-First PWA mit Next.js, optimiert fur mobile Gerate.

**Begrundung:** PWA-Fahigkeiten in 2026 decken alle benotigten Features ab: Push Notifications (alle Browser inkl. iOS Safari seit 16.4), Offline-Support, Home-Screen-Installation. Capacitor als Notfall-Option in Phase 3.

**Konsequenzen:** Kein App Store Prasenz (kann Auffindbarkeit verringern); dafur eine Codebasis, sofortige Updates, kein App-Store-Review.

#### ADR-006: Supabase uber Custom Backend

**Kontext:** Auth, Realtime, Storage, Datenbank-Management -- all das selbst zu bauen ist fur einen Solo-Entwickler nicht realistisch.

**Entscheidung:** Supabase als Backend-as-a-Service.

**Begrundung:** Auth, Realtime, Storage, RLS in einer verwalteten Plattform. PostgreSQL darunter bedeutet kein Vendor Lock-in. Open Source, EU-Hosting verfugbar, grosszugiges Free Tier.

**Konsequenzen:** Abhangigkeit von Supabase-Verfugbarkeit; Self-Hosting als Fallback jederzeit moglich.

#### ADR-007: Managed Services uber Self-Hosted

**Kontext:** Solo-Grunder muss den Ops-Aufwand minimieren.

**Entscheidung:** Vercel, Supabase, Upstash, Meilisearch Cloud -- alles managed.

**Begrundung:** Jede Stunde fur Server-Administration ist eine Stunde weniger fur Produktentwicklung. Alle gewahlten Services bieten EU-Regionen.

**Konsequenzen:** Hohere laufende Kosten als Self-Hosting; dafur mehr Zeit fur Features.

#### ADR-008: Nur Deutsch im MVP

**Kontext:** 61,2 Millionen Wahlberechtigte in Deutschland sind ein ausreichend grosser Markt.

**Entscheidung:** Phase 1 und 2 nur auf Deutsch. i18n-Architektur wird von Anfang an vorbereitet.

**Begrundung:** Fokus auf einen Markt reduziert Komplexitat: Eine Sprache, ein Rechtsrahmen, eine API-Quelle (Bundestag).

**Konsequenzen:** Schliesst nicht-deutschsprachige Burger vorerst aus; Leichte Sprache in Phase 2 adressiert einen Teil dieser Lucke.

#### ADR-009: Freemium uber kostenlos

**Kontext:** Nachhaltigkeit erfordert Einnahmen. Aber demokratische Kernfunktionen durfen nie hinter einer Paywall stehen.

**Entscheidung:** Freemium-Modell -- Abstimmen, Kommentieren und Ergebnisse ansehen sind kostenlos. Premium-Features fur Power-User sind kostenpflichtig.

**Begrundung:** Knight Foundation Forschung zeigt, dass rein spendenfinanzierte Civic-Tech-Plattformen selten uberlebensfähig sind. Freemium bietet planbare Einnahmen.

**Konsequenzen:** Muss sorgfaltig balanciert werden: Premium darf nie den Eindruck von "Demokratie fur Reiche" erwecken.

#### ADR-010: react-map-gl + Mapbox fur Wahlkreis-Karte

**Kontext:** Die interaktive Deutschland-Karte mit 299 Wahlkreisen ist ein Kern-Feature (eigener Tab). Sie braucht performante Polygon-Darstellung, Touch-Gesten, Choropleth-Farbkodierung und Live-Pulse-Animationen.

**Entscheidung:** react-map-gl (React-Wrapper fur Mapbox GL JS) + Wahlkreis-Geometrien als Mapbox Tileset + statisches TopoJSON vom Bundeswahlleiter als Fallback.

**Begrundung:** Mapbox bietet die beste Performance fur 299 Polygone mit Zoom/Pan, hat exzellenten Touch-Support und Choropleth-Styling out-of-the-box. Free Tier (50k Map Loads/Monat) reicht fur Phase 1. Bundeswahlleiter-GeoJSON (~2-5MB als TopoJSON) dient als Open-Data-Grundlage und Offline-Fallback.

**Konsequenzen:** Vendor-Abhangigkeit von Mapbox (US-Firma); Migration zu MapLibre GL (Open-Source Fork) jederzeit moglich. Mapbox-Kosten steigen bei Wachstum.

#### ADR-011: Stripe fur Premium-Zahlungen

**Kontext:** Freemium-Modell braucht einen Payment-Provider fur Abonnements.

**Entscheidung:** Stripe mit monatlichem (4,99 EUR) und jahrlichem (49,99 EUR, ~2 Monate gratis) Abo-Modell.

**Begrundung:** Stripe ist der Standard fur SaaS in Deutschland, bietet Stripe Tax fur automatische EU-USt-Berechnung, Stripe Billing fur Abo-Verwaltung, und exzellente Dokumentation. Fees: 1,5% + 0,25 EUR pro Transaktion.

**Konsequenzen:** Stripe ubernimmt nicht die Rolle des Merchant of Record -- UG muss Rechnungen selbst stellen und USt abfuhren (Stripe Tax hilft bei der Berechnung).

#### ADR-012: Reputation-Tiers uber Moderator-only-Moderation

**Kontext:** Ein Solo-Grunder kann nicht allein die gesamte Plattform moderieren.

**Entscheidung:** Community-Moderation mit gestuften Privilegien nach Stack-Overflow-Vorbild.

**Begrundung:** Stack Overflow moderiert Millionen von Beitragen mit einer Handvoll Angestellter, weil die Community selbst moderiert. Vertrauenswurdige Nutzer erhalten schrittweise Moderationsrechte.

**Konsequenzen:** Initiale Phase braucht manuelle Moderation bis genug Nutzer hohe Reputation haben.

---

## 6. Datenmodell

### 6.1 Entity-Relationship-Ubersicht

Das Datenmodell umfasst 25 Tabellen in 7 Domanen:

**User-Domane:** `profiles`, `user_preferences`
**Themen-Domane:** `topics`, `topic_tags`, `topic_supporters`, `topic_news_links`
**Bundestag-Domane:** `bundestag_vorgaenge`, `bundestag_abstimmungen`, `bundestag_mdb`, `mdb_votes`
**Abstimmungs-Domane:** `vote_events`, `vote_results`
**Diskussions-Domane:** `comments`, `comment_ratings`
**Gamification- & Session-Domane:** `user_streaks`, `daily_activity`, `session_content`, `daily_sessions`, `platform_metrics`, `wahlkreis_stats`
**System-Domane:** `reputation_events`, `badges`, `user_badges`, `groups`, `group_members`, `reports`, `audit_log`, `wahlkreise`, `notifications`

### 6.2 Vollstandiges Schema

#### User-Domane

```sql
-- Nutzerprofile (erweitert Supabase auth.users)
CREATE TABLE profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name     TEXT NOT NULL,
  wahlkreis_id     INTEGER REFERENCES wahlkreise(id),
  bio              TEXT,
  avatar_url       TEXT,
  verification_tier TEXT NOT NULL DEFAULT 'unverified'
                   CHECK (verification_tier IN ('unverified','verified','identity_verified')),
  reputation_points INTEGER NOT NULL DEFAULT 0,
  privilege_tier   INTEGER NOT NULL DEFAULT 0,
  is_public        BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nutzereinstellungen
CREATE TABLE user_preferences (
  user_id                UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  categories             TEXT[] DEFAULT '{}',
  notification_votes     BOOLEAN NOT NULL DEFAULT true,
  notification_comments  BOOLEAN NOT NULL DEFAULT true,
  notification_results   BOOLEAN NOT NULL DEFAULT true,
  theme                  TEXT NOT NULL DEFAULT 'system',
  language               TEXT NOT NULL DEFAULT 'de'
);
```

#### Themen-Domane

```sql
-- Themen (sowohl Bundestag als auch nutzergeneriert)
CREATE TABLE topics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  summary         TEXT,  -- burgerverstandliche Zusammenfassung
  source          TEXT NOT NULL CHECK (source IN ('bundestag','user')),
  source_id       TEXT,  -- DIP Vorgang-ID oder abgeordnetenwatch-ID
  category        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','pending','active','voting_closed','archived')),
  voting_format   TEXT NOT NULL
                  CHECK (voting_format IN ('yes_no','multiple_choice','ranked_choice','approval','budget')),
  voting_config   JSONB NOT NULL DEFAULT '{}',
  voting_opens_at  TIMESTAMPTZ,
  voting_closes_at TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id),
  supporter_count INTEGER NOT NULL DEFAULT 0,
  vote_count      INTEGER NOT NULL DEFAULT 0,
  comment_count   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Topic-Tags
CREATE TABLE topic_tags (
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  tag      TEXT NOT NULL,
  PRIMARY KEY (topic_id, tag)
);
```

#### Bundestag-Domane

```sql
-- Vorgange aus der DIP API
CREATE TABLE bundestag_vorgaenge (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dip_id      TEXT UNIQUE NOT NULL,
  titel       TEXT,
  abstract    TEXT,
  sachgebiet  TEXT[],
  vorgangstyp TEXT,
  beratungsstand TEXT,
  initiative  TEXT[],
  datum       DATE,
  aktualisiert TIMESTAMPTZ,
  deskriptor  TEXT[],
  raw_data    JSONB,
  topic_id    UUID REFERENCES topics(id),
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Namentliche Abstimmungen aus abgeordnetenwatch
CREATE TABLE bundestag_abstimmungen (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abgeordnetenwatch_id    TEXT UNIQUE,
  topic_id                UUID REFERENCES topics(id),
  titel                   TEXT,
  datum                   DATE,
  ergebnis                JSONB,  -- {ja: N, nein: N, enthaltung: N, nicht_abgegeben: N}
  field_intro             TEXT,   -- Redaktionelle Zusammenfassung von AW
  field_accepted          BOOLEAN,
  raw_data                JSONB,
  synced_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- MdB-Stammdaten
CREATE TABLE bundestag_mdb (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dip_person_id           TEXT,
  abgeordnetenwatch_id    TEXT,
  name                    TEXT NOT NULL,
  vorname                 TEXT,
  nachname                TEXT,
  fraktion                TEXT,
  wahlkreis_id            INTEGER REFERENCES wahlkreise(id),
  wahlkreis_name          TEXT,
  foto_url                TEXT,
  raw_data                JSONB,
  synced_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Einzelstimmen der MdBs
CREATE TABLE mdb_votes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mdb_id          UUID NOT NULL REFERENCES bundestag_mdb(id),
  abstimmung_id   UUID NOT NULL REFERENCES bundestag_abstimmungen(id),
  vote            TEXT NOT NULL CHECK (vote IN ('ja','nein','enthaltung','nicht_abgegeben')),
  raw_data        JSONB,
  UNIQUE (mdb_id, abstimmung_id)
);
```

#### Abstimmungs-Domane (Event Store)

```sql
-- Event Store (append-only!)
CREATE TABLE vote_events (
  event_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id       UUID NOT NULL REFERENCES topics(id),
  event_type      TEXT NOT NULL
                  CHECK (event_type IN ('VoteCast','VoteChanged','VoteRevoked',
                                        'DelegationSet','DelegationRevoked')),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  payload         JSONB NOT NULL,
  prev_hash       TEXT,
  event_hash      TEXT NOT NULL,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sequence_number BIGINT GENERATED ALWAYS AS IDENTITY
);

-- Schutz: Keine UPDATEs oder DELETEs auf vote_events
CREATE RULE vote_events_no_update AS ON UPDATE TO vote_events DO INSTEAD NOTHING;
CREATE RULE vote_events_no_delete AS ON DELETE TO vote_events DO INSTEAD NOTHING;

-- Projektion / Read Model
CREATE TABLE vote_results (
  topic_id                UUID PRIMARY KEY REFERENCES topics(id),
  total_votes             INTEGER NOT NULL DEFAULT 0,
  results                 JSONB NOT NULL DEFAULT '{}',
  demographic_breakdown   JSONB,  -- anonymisiert: {by_bundesland: {...}}
  last_updated            TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### Diskussions-Domane

```sql
-- Kommentare (max. 2 Ebenen)
CREATE TABLE comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id        UUID NOT NULL REFERENCES topics(id),
  parent_id       UUID REFERENCES comments(id),
  author_id       UUID NOT NULL REFERENCES profiles(id),
  content         TEXT NOT NULL,
  position        TEXT CHECK (position IN ('pro','contra','neutral')),
  sources         TEXT[],
  bridging_score  FLOAT NOT NULL DEFAULT 0,
  upvotes         INTEGER NOT NULL DEFAULT 0,
  downvotes       INTEGER NOT NULL DEFAULT 0,
  is_flagged      BOOLEAN NOT NULL DEFAULT false,
  is_hidden       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kommentar-Bewertungen
CREATE TABLE comment_ratings (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating IN (-1, 0, 1)),
  PRIMARY KEY (user_id, comment_id)
);
```

#### System-Domane

```sql
-- Reputation
CREATE TABLE reputation_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  action          TEXT NOT NULL,
  points          INTEGER NOT NULL,
  reference_type  TEXT,
  reference_id    UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Badges
CREATE TABLE badges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon        TEXT,
  criteria    JSONB NOT NULL
);

CREATE TABLE user_badges (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id  UUID REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- Gruppen
CREATE TABLE groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  type         TEXT NOT NULL CHECK (type IN ('party','faction','interest','custom')),
  visibility   TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  created_by   UUID NOT NULL REFERENCES profiles(id),
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
  group_id  UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Moderation
CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  UUID NOT NULL REFERENCES profiles(id),
  target_type  TEXT NOT NULL CHECK (target_type IN ('comment','topic','user')),
  target_id    UUID NOT NULL,
  reason       TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','reviewed','confirmed','dismissed')),
  reviewed_by  UUID REFERENCES profiles(id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   UUID,
  details     JSONB,
  ip_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wahlkreise
CREATE TABLE wahlkreise (
  id         INTEGER PRIMARY KEY,  -- offizielle WK-Nummer (1-299)
  name       TEXT NOT NULL,
  bundesland TEXT NOT NULL,
  geometry   JSONB  -- GeoJSON fur Kartenanzeige
);
```

#### Gamification- & Session-Domane

```sql
-- Streak-Tracking
CREATE TABLE user_streaks (
  user_id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  longest_streak   INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,  -- letzte Aktivitat (CET/CEST Timezone)
  streak_shields   INTEGER NOT NULL DEFAULT 0,  -- verdiente Streak-Schutz-Tage (max 1/Woche)
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tagliche Aktivitat (was zahlt als "Tag")
CREATE TABLE daily_activity (
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,  -- CET/CEST
  voted       BOOLEAN NOT NULL DEFAULT false,
  read_summary BOOLEAN NOT NULL DEFAULT false,
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  commented   BOOLEAN NOT NULL DEFAULT false,
  rated       BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

-- Benachrichtigungen
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL
              CHECK (type IN ('new_vote','vote_result','bundestag_result','comment_reply',
                              'bridging_achievement','streak_milestone','quest_complete',
                              'wahlkreis_update','mdb_voted','topic_activated','system')),
  title       TEXT NOT NULL,
  body        TEXT,
  reference_type TEXT,  -- 'topic', 'comment', 'badge', etc.
  reference_id   UUID,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- Themen-Unterstutzung (UGC-06)
CREATE TABLE topic_supporters (
  topic_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (topic_id, user_id)
);

-- Nachrichtenlinks pro Thema (FEED-09)
CREATE TABLE topic_news_links (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,  -- z.B. "Tagesschau", "ZEIT", "FAZ"
  source_icon TEXT,           -- URL zum Quellen-Icon
  title       TEXT NOT NULL,
  url         TEXT NOT NULL,
  published_at DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_links_topic ON topic_news_links (topic_id);

-- Wahlkreis-Statistiken (GAM-04, aggregiert)
CREATE TABLE wahlkreis_stats (
  wahlkreis_id     INTEGER PRIMARY KEY REFERENCES wahlkreise(id),
  registered_users INTEGER NOT NULL DEFAULT 0,
  active_users_week INTEGER NOT NULL DEFAULT 0,
  votes_week       INTEGER NOT NULL DEFAULT 0,
  avg_bridging_score FLOAT NOT NULL DEFAULT 0,
  category_diversity INTEGER NOT NULL DEFAULT 0,  -- Anzahl verschiedener Kategorien
  mdb_emails_sent  INTEGER NOT NULL DEFAULT 0,
  fortschritt_stufe INTEGER NOT NULL DEFAULT 1 CHECK (fortschritt_stufe BETWEEN 1 AND 5),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session-Inhalte (GAM-06: Briefings, Quiz-Fragen)
CREATE TABLE session_content (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_date DATE NOT NULL UNIQUE,  -- ein Eintrag pro Tag
  topic_id     UUID REFERENCES topics(id),  -- Haupt-Thema des Tages
  briefing     TEXT NOT NULL,  -- 3-Satz-Zusammenfassung
  quiz_question TEXT NOT NULL,
  quiz_options  JSONB NOT NULL,  -- [{text: "...", correct: true/false}, ...]
  quiz_explanation TEXT,
  bridging_comment_id UUID REFERENCES comments(id),  -- Perspektivenwechsel-Kommentar
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fortschritt der taglichen Session pro Nutzer
CREATE TABLE daily_sessions (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  step_reached INTEGER NOT NULL DEFAULT 0 CHECK (step_reached BETWEEN 0 AND 5),
  completed    BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, session_date)
);

-- Plattform-weite Metriken (GAM-14: Demokratie-Puls)
CREATE TABLE platform_metrics (
  metric_date        DATE PRIMARY KEY,
  active_users_today INTEGER NOT NULL DEFAULT 0,
  votes_today        INTEGER NOT NULL DEFAULT 0,
  avg_bridging_score FLOAT NOT NULL DEFAULT 0,
  active_wahlkreise  INTEGER NOT NULL DEFAULT 0,
  diversity_index    FLOAT NOT NULL DEFAULT 0,
  mdb_emails_sent    INTEGER NOT NULL DEFAULT 0,
  puls_score         FLOAT NOT NULL DEFAULT 0,  -- zusammengesetzter Score 0-100
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 6.3 Row Level Security Policies

```sql
-- Profiles: Offentliche Profile fur alle lesbar; eigenes Profil bearbeitbar
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read ON profiles FOR SELECT
  USING (is_public = true OR id = auth.uid());
CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Vote Events: Eigene Stimmen einfugen und lesen
ALTER TABLE vote_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY vote_events_insert ON vote_events FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY vote_events_read_own ON vote_events FOR SELECT
  USING (user_id = auth.uid());

-- Vote Results: Offentlich lesbar
ALTER TABLE vote_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY vote_results_read ON vote_results FOR SELECT
  USING (true);

-- Comments: Lesbar fur alle Authentifizierten; Ersteller kann bearbeiten
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_read ON comments FOR SELECT
  USING (is_hidden = false OR author_id = auth.uid());
CREATE POLICY comments_insert ON comments FOR INSERT
  WITH CHECK (author_id = auth.uid());
CREATE POLICY comments_update ON comments FOR UPDATE
  USING (author_id = auth.uid()
    AND created_at > now() - INTERVAL '15 minutes');

-- Topics: Aktive Topics fur alle lesbar; Entwurfe nur fur Ersteller
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY topics_read ON topics FOR SELECT
  USING (status != 'draft' OR created_by = auth.uid());
CREATE POLICY topics_insert ON topics FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Reports: Eigene Meldungen lesbar
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY reports_read_own ON reports FOR SELECT
  USING (reporter_id = auth.uid());
CREATE POLICY reports_insert ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- Audit Log: Nur Admins
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_admin ON audit_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND privilege_tier >= 4
  ));

-- Groups: Offentliche Gruppen fur alle; private nur fur Mitglieder
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY groups_read ON groups FOR SELECT
  USING (visibility = 'public' OR EXISTS (
    SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid()
  ));

-- Streaks & Daily Activity: Nur eigene Daten
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY streaks_read ON user_streaks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY streaks_update ON user_streaks FOR UPDATE USING (user_id = auth.uid());

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY activity_read ON daily_activity FOR SELECT USING (user_id = auth.uid());
CREATE POLICY activity_insert ON daily_activity FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: Nur eigene
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notif_read ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notif_update ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Topic Supporters: Offentlich lesbar, eigene einfugbar
ALTER TABLE topic_supporters ENABLE ROW LEVEL SECURITY;
CREATE POLICY supporters_read ON topic_supporters FOR SELECT USING (true);
CREATE POLICY supporters_insert ON topic_supporters FOR INSERT WITH CHECK (user_id = auth.uid());

-- News Links: Offentlich lesbar
ALTER TABLE topic_news_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY news_links_read ON topic_news_links FOR SELECT USING (true);

-- Wahlkreis Stats: Offentlich lesbar
ALTER TABLE wahlkreis_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY wk_stats_read ON wahlkreis_stats FOR SELECT USING (true);

-- Session Content: Offentlich lesbar
ALTER TABLE session_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY session_content_read ON session_content FOR SELECT USING (true);

-- Daily Sessions: Nur eigene
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_sessions_read ON daily_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY daily_sessions_insert ON daily_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY daily_sessions_update ON daily_sessions FOR UPDATE USING (user_id = auth.uid());

-- Platform Metrics: Offentlich lesbar
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY metrics_read ON platform_metrics FOR SELECT USING (true);
```

### 6.4 Kritische Indexes

```sql
-- Feed-Abfragen
CREATE INDEX idx_topics_feed ON topics (status, created_at DESC);
CREATE INDEX idx_topics_source ON topics (source, source_id);
CREATE INDEX idx_topics_category ON topics (category);

-- Event Store
CREATE INDEX idx_vote_events_stream ON vote_events (stream_id, sequence_number);
CREATE UNIQUE INDEX idx_vote_events_user_topic ON vote_events (user_id, stream_id)
  WHERE event_type = 'VoteCast';  -- verhindert doppelte Stimmabgabe

-- Kommentare
CREATE INDEX idx_comments_bridging ON comments (topic_id, bridging_score DESC);
CREATE INDEX idx_comments_chrono ON comments (topic_id, created_at DESC);

-- Bundestag-Sync
CREATE INDEX idx_vorgaenge_dip ON bundestag_vorgaenge (dip_id);
CREATE INDEX idx_abstimmungen_aw ON bundestag_abstimmungen (abgeordnetenwatch_id);

-- Wahlkreis-Abfragen
CREATE INDEX idx_profiles_wahlkreis ON profiles (wahlkreis_id);
CREATE INDEX idx_mdb_wahlkreis ON bundestag_mdb (wahlkreis_id);

-- Volltextsuche
CREATE INDEX idx_topics_search ON topics
  USING GIN (to_tsvector('german', title || ' ' || description));
```

---

## 7. API-Struktur

### 7.1 tRPC Router-Organisation

```
src/server/routers/
  _app.ts            -- Root Router (merged alle Sub-Router)
  auth.ts            -- Authentifizierungs-Prozeduren
  topics.ts          -- Topic CRUD + Listing
  votes.ts           -- Stimmabgabe + Ergebnisse
  comments.ts        -- Kommentar CRUD + Bewertung
  bundestag.ts       -- Bundestag-Datenabfragen
  users.ts           -- Profilverwaltung
  search.ts          -- Such-Proxy (Meilisearch)
  feed.ts            -- Feed-Komposition
  groups.ts          -- Gruppenverwaltung
  moderation.ts      -- Reports + Moderationsaktionen
  admin.ts           -- Admin-Prozeduren
  notifications.ts   -- Benachrichtigungsverwaltung
```

### 7.2 Procedure-Inventar

#### `votes.ts`

| Procedure | Typ | Auth | Input | Output | Rate Limit |
|-----------|-----|------|-------|--------|------------|
| `votes.cast` | Mutation | Required | `{topicId, choice, ranked?}` | `{eventId, receiptHash}` | 10/min |
| `votes.change` | Mutation | Required | `{topicId, newChoice}` | `{eventId}` | 10/min |
| `votes.revoke` | Mutation | Required | `{topicId}` | `{eventId}` | 10/min |
| `votes.myVote` | Query | Required | `{topicId}` | `{choice, timestamp} \| null` | 60/min |
| `votes.results` | Query | Public | `{topicId}` | `{total, breakdown, chartData}` | 120/min |
| `votes.comparison` | Query | Public | `{topicId}` | `{citizenResults, bundestagResults, delta}` | 60/min |
| `votes.delegate` | Mutation | Required | `{topicId, delegateUserId}` | `{eventId}` | 5/min |

#### `topics.ts`

| Procedure | Typ | Auth | Input | Output | Rate Limit |
|-----------|-----|------|-------|--------|------------|
| `topics.list` | Query | Public | `{cursor, limit, category?, source?, status?}` | `{items, nextCursor}` | 60/min |
| `topics.getById` | Query | Public | `{id}` | `Topic` | 120/min |
| `topics.create` | Mutation | Required | `{title, description, category, votingFormat, votingConfig}` | `{id}` | 5/min |
| `topics.update` | Mutation | Required | `{id, title?, description?, summary?}` | `Topic` | 10/min |
| `topics.support` | Mutation | Required | `{topicId}` | `{supporterCount}` | 30/min |
| `topics.close` | Mutation | Moderator+ | `{id, reason}` | `Topic` | 10/min |

#### `comments.ts`

| Procedure | Typ | Auth | Input | Output | Rate Limit |
|-----------|-----|------|-------|--------|------------|
| `comments.list` | Query | Required | `{topicId, sort, position?, cursor}` | `{items, nextCursor}` | 60/min |
| `comments.create` | Mutation | Required | `{topicId, content, position, parentId?, sources?}` | `Comment` | 10/min |
| `comments.update` | Mutation | Required | `{id, content}` | `Comment` | 10/min |
| `comments.rate` | Mutation | Required | `{commentId, rating}` | `{bridgingScore}` | 60/min |
| `comments.report` | Mutation | Required | `{commentId, reason}` | `{reportId}` | 5/min |

#### `feed.ts`

| Procedure | Typ | Auth | Input | Output | Rate Limit |
|-----------|-----|------|-------|--------|------------|
| `feed.home` | Query | Optional | `{cursor, limit, category?}` | `{items, nextCursor}` | 30/min |
| `feed.trending` | Query | Public | `{limit}` | `Topic[]` | 30/min |

#### `bundestag.ts`

| Procedure | Typ | Auth | Input | Output | Rate Limit |
|-----------|-----|------|-------|--------|------------|
| `bundestag.vorgaenge` | Query | Public | `{cursor, sachgebiet?, beratungsstand?}` | `{items, nextCursor}` | 60/min |
| `bundestag.mdb` | Query | Public | `{id}` | `MdB` mit Abstimmungshistorie | 60/min |
| `bundestag.mdbByWahlkreis` | Query | Public | `{wahlkreisId}` | `MdB[]` | 60/min |

### 7.3 Externe API-Integration

```
src/server/integrations/
  dip/
    client.ts        -- DIP API Client mit Auth Header
    types.ts         -- TypeScript Types fur DIP-Entitaten
    sync.ts          -- Sync-Logik (Upsert Vorgange, Drucksachen etc.)
    mappers.ts       -- DIP-Entitaten auf internes Topic-Modell mappen
  abgeordnetenwatch/
    client.ts        -- AW API Client
    types.ts         -- TypeScript Types
    sync.ts          -- Sync-Logik
    mappers.ts       -- Mapping
  lobbyregister/
    client.ts        -- Lobbyregister Client
    types.ts
    sync.ts
```

### 7.4 Cron / Webhook Endpoints

| Endpoint | Intervall | Funktion |
|----------|-----------|----------|
| `/api/cron/sync-bundestag` | 15 Min. | Synchronisiert DIP + abgeordnetenwatch Daten |
| `/api/cron/update-search` | 30 Min. | Reindexiert Meilisearch |
| `/api/cron/compute-bridging` | 60 Min. | Berechnet Bridging-Scores neu |
| `/api/cron/close-votes` | 1 Min. | Schliesst abgelaufene Abstimmungsfenster |
| `/api/cron/update-reputation` | Taglich | Aktualisiert Privilege-Tiers |
| `/api/webhooks/supabase-auth` | Event | Reagiert auf Auth-Events (Signup, Deletion) |

---

## 8. Wireframes & Screen-Beschreibungen

### 8.1 Screen-Inventar

| Screen | Route | Phase | Beschreibung |
|--------|-------|-------|-------------|
| Landing Page | `/` | 1 | Vorstellung der Plattform fur unangemeldete Besucher |
| Registrierung | `/registrieren` | 1 | Email + Passwort Formular |
| Login | `/anmelden` | 1 | Email/Passwort oder Magic Link |
| Home Feed | `/feed` | 1 | Hauptansicht mit Themen-Feed |
| Topic Detail | `/themen/[id]` | 1 | Einzelnes Thema mit Abstimmung und Diskussion |
| Abstimm-Interface | Bottom Sheet | 1 | Stimmabgabe-UI |
| Ergebnis-Ansicht | `/themen/[id]/ergebnis` | 1 | Detaillierte Ergebnis-Darstellung |
| Thema erstellen | `/thema-erstellen` | 1 | Formular fur nutzergenerierte Themen |
| Profil | `/profil` | 1 | Eigenes Profil mit Aktivitaten |
| Einstellungen | `/einstellungen` | 1 | Account- und App-Einstellungen |
| Suche | `/suche` | 1 | Volltextsuche mit Filtern |
| Kategorie | `/kategorien/[slug]` | 1 | Themen einer Kategorie |
| MdB-Profil | `/abgeordnete/[id]` | 1 | MdB mit Abstimmungshistorie |
| Wahlkreis | `/wahlkreis/[id]` | 2 | Wahlkreis-spezifische Ubersicht |
| Gruppe | `/gruppen/[id]` | 2 | Gruppenseite |
| Benachrichtigungen | `/benachrichtigungen` | 1 | Notification-Center |
| Transparenz | `/transparenz` | 1 | Algorithmus-Dokumentation |
| Datenschutz | `/datenschutz` | 1 | Datenschutzerklarung |
| Impressum | `/impressum` | 1 | Rechtlich erforderliches Impressum |
| Demokratie-Karte | `/karte` | 1 | Deutschland-Karte mit 299 Wahlkreisen (Stadtsimulation) |
| Tagliche Session | `/session` | 1 | 5-Minuten Demokratie-Session (Duolingo-Stil) |
| Demokratie-Wrapped | `/wrapped/2026` | 2 | Personlicher Jahresreport |
| Meine Wirkung | `/profil/wirkung` | 1 | Personliches Impact-Dashboard |
| Themen-Team | `/teams/[slug]` | 2 | Team-Dashboard (z.B. Klima-Team) |
| Admin Dashboard | `/admin` | 1 | Verwaltungs-Ubersicht |
| Moderations-Queue | `/admin/moderation` | 1 | Gemeldete Inhalte bearbeiten |

### 8.2 Detaillierte Screen-Beschreibungen

#### Landing Page (`/`)

Die Landing Page ist der wichtigste Conversion-Screen. Sie muss in <10 Sekunden kommunizieren, was Demokrat ist und warum es anders ist.

**Mobile Layout (kein Bottom Tab Bar -- nur fur unangemeldete Besucher):**

```
+------------------------------------------+
|  [Demokrat Logo]            [Anmelden]   |
+------------------------------------------+
|                                          |
|  Deine Stimme.                           |
|  Zwischen den Wahlen.                    |
|                                          |
|  Stimme ab wie der Bundestag.            |
|  Sieh, wo Deutschland anders denkt.      |
|                                          |
|  [    Kostenlos starten    ] <- Indigo   |
|                                          |
|  ┌────────────────────────────────────┐  |
|  │  Live: 2.847 Burger stimmen       │  |
|  │  gerade uber das Klimagesetz ab   │  |
|  └────────────────────────────────────┘  |
|                                          |
+------------------------------------------+
|                                          |
|  SO FUNKTIONIERT'S                       |
|                                          |
|  1. Bundestag-Themen lesen              |
|     Verstandlich zusammengefasst         |
|                                          |
|  2. Deine Stimme abgeben               |
|     Ja, Nein oder differenziert          |
|                                          |
|  3. Ergebnis vergleichen               |
|     Burger vs. Bundestag auf einen Blick |
|                                          |
+------------------------------------------+
|                                          |
|  WAS DEMOKRAT ANDERS MACHT               |
|                                          |
|  [Icon] Kein Social Network             |
|  Keine Likes, kein Algorithmus der       |
|  spaltet. Nur deine Meinung zahlt.       |
|                                          |
|  [Icon] Brucken statt Graben            |
|  Unser Bridging-Algorithmus belohnt      |
|  Kommentare, die verbinden.              |
|                                          |
|  [Icon] Dein Wahlkreis, dein Impact     |
|  Sieh, wie deine Beteiligung deine       |
|  Gemeinschaft starkt.                    |
|                                          |
+------------------------------------------+
|                                          |
|  AKTUELL AUF DEMOKRAT                    |
|                                          |
|  [Feed-Karte: Aktuellstes Thema]        |
|  [Feed-Karte: Zweitaktuellstes]         |
|                                          |
|  Mehr sehen ->                           |
|                                          |
+------------------------------------------+
|                                          |
|  [Mini-Karte: Deutschland, Wahlkreise   |
|   leuchten in Indigo-Abstufungen]        |
|                                          |
|  299 Wahlkreise. Eine Demokratie.        |
|  Finde deinen Wahlkreis.                 |
|                                          |
+------------------------------------------+
|                                          |
|  STIMMEN AUS DER COMMUNITY              |
|                                          |
|  "Endlich sehe ich, was der Bundestag    |
|   entscheidet -- und kann mitdiskutieren"|
|  -- Anna, 34, Lehrerin                   |
|                                          |
+------------------------------------------+
|                                          |
|  [    Kostenlos starten    ] <- Indigo   |
|                                          |
|  Kostenlos. Keine Werbung. Deine Daten   |
|  gehoren dir. DSGVO-konform.             |
|                                          |
+------------------------------------------+
|  Impressum | Datenschutz | Transparenz   |
+------------------------------------------+
```

**Sektionen:**

1. **Hero:** Headline ("Deine Stimme. Zwischen den Wahlen."), Sub-Headline, CTA-Button, Live-Zahler
2. **So funktioniert's:** 3 Schritte mit Icons (nummering 1-2-3)
3. **Differenzierung:** 3 Value Props (kein Social Network, Bridging, Wahlkreis-Impact)
4. **Live-Content:** 2 aktuelle Feed-Karten (offentlich sichtbar, Abstimmung erfordert Login)
5. **Wahlkreis-Karte:** Mini-Version der interaktiven Karte als Teaser
6. **Social Proof:** 2-3 Testimonials (anfangs Persona-basiert, spater echte Nutzer)
7. **Finaler CTA:** Wiederholung des "Kostenlos starten"-Buttons + Trust-Signale (DSGVO, keine Werbung)
8. **Footer:** Impressum, Datenschutz, Transparenz

**Desktop Layout:**
- Max-Breite: 1200px, zentriert
- Hero: Headline links, animierte Mini-Karte rechts (60/40 Split)
- "So funktioniert's": 3 Spalten nebeneinander
- Value Props: 3 Spalten
- Live-Content: 2 Feed-Karten nebeneinander
- Rest: Identisch, aber breiteres Layout

**Technische Notizen:**
- SSR-gerendert fur SEO (Next.js `generateMetadata`)
- OG-Meta-Tags fur Social Sharing
- Performance: Karte lazy-loaded, Feed-Karten statisch vorgerendert (ISR, 5 Min.)
- Anonymes Browsen (AUTH-10): Feed-Karten sind klickbar, Topic-Detail offentlich, Abstimmung erfordert Login

---

#### Home Feed (`/feed`)

**Mobile Layout:**
- **Bottom Tab Bar** (fixiert): 5 Icons -- Home | Suche | + | Karte | Profil
- **Header:** App-Logo links, Glocken-Icon mit Badge rechts (Benachrichtigungen als Dropdown)
- **Streak-Leiste** (wenn Streak aktiv): Dezente Leiste unter Header: "Streak: 23 Tage | Tagesziel: 2/3"
- **Sitzungswoche-Banner** (wenn aktiv): "Sitzungswoche -- Der Bundestag tagt | 2x Punkte"
- **Filter-Leiste** (horizontal scrollbar): Alle | Bundestag | Burger | Dein Wahlkreis | [Interesse-Chips aus Onboarding]
- **Echtzeit-Zahler:** "X Burger stimmen gerade ab" (pulsierender Indigo-Punkt)
- **Feed-Bereich:** Vertikale Liste von Topic-Karten
  - Jede Karte (minimalistisches Design):
    - Quell-Badge: "BUNDESTAG" oder "BURGER" (Caption, grau, uppercase)
    - Titel: H2 (max 2 Zeilen)
    - Beschreibung: Body Small, max 2 Zeilen, Mittelgrau
    - Kategorie-Chip (hellgrauer Hintergrund)
    - Zahlen: Abstimmungs-Count + Kommentar-Count (Mono-Schrift)
    - Fortschrittsbalken: Verbleibende Zeit (Indigo Fill)
    - "Abstimmen"-Button: Volle Breite, Indigo, 48px Hohe
    - Bei Bundestag-Themen: "2 Nachrichtenartikel" Link unter der Beschreibung
    - Wenn personalisiert: "Weil du dich fur [Umwelt] interessierst" in Caption
- **Infinite Scroll** mit Skeleton-Loading-Platzhaltern
- **Pull-to-Refresh** am oberen Rand

**Desktop Layout:**
- **Linke Sidebar** (220px): Navigation, Streak-Anzeige, Wahlkreis-Kurzinfo, Kategorie-Links
- **Center Column** (max 680px): Identisch zu Mobile Feed
- **Rechte Sidebar** (280px): Mini-Wahlkreis-Karte (klickbar -> /karte), Trending-Themen (Top 5), Demokratie-Puls-Anzeige, "Tagliche Session starten" CTA

#### Topic Detail (`/themen/[id]`)

**Mobile Layout:**
- **Zuruck-Button** + Titel im Header
- **Quell-Badge + Kategorie + Datum**
- **Zusammenfassung:** Burgerverstandlicher Text in einer hervorgehobenen Box
- **Wenn Bundestag:** Timeline des Gesetzgebungsprozesses (Punkte-Linie: Eingereicht > 1. Lesung > Ausschuss > 2./3. Lesung > Verkundet), Link zur Drucksache
- **Abstimmungs-Bereich:**
  - Wenn noch nicht abgestimmt: Grosser "Jetzt abstimmen"-Button
  - Wenn bereits abgestimmt: "Du hast [Ja] gestimmt. Andern?" + Ergebnis-Vorschau
  - Countdown: "Noch X Tage, Y Stunden"
- **Ergebnis-Bereich** (nach Abstimmung oder nach Ende):
  - Burger-Ergebnis als Balkendiagramm
  - Wenn Bundestag: Nebeneinander Burger vs. Bundestag mit Abweichungs-Highlight
  - Fraktions-Aufschlusselung
- **Kommentare:**
  - Tabs: Alle | Pro | Contra | Neutral
  - Sortierung: Bridging Score (Standard) | Neueste | Meiste Votes
  - Kommentar-Karten: Position-Farbindikator links, Text, Quellen-Links, Up/Down Buttons, Bridging-Score-Badge
  - Antwort-Button (max 2 Ebenen)
  - Kommentar-Eingabefeld am unteren Rand
- **Sticky Bottom Bar:** "Abstimmen"-Button (wenn noch nicht abgestimmt)

#### Abstimm-Interface (Bottom Sheet)

**Ja/Nein/Enthaltung:**
- Bottom Sheet schiebt sich von unten ins Bild (50% Bildschirmhohe)
- Themen-Titel oben
- Drei grosse Buttons nebeneinander: Ja (Indigo, Daumen hoch Icon), Nein (Hellgrau mit dunklem Text, Daumen runter Icon), Enthaltung (Hellgrau, Minus Icon)
- Bestatigungsschritt: "Deine Stimme: [Ja]. Abstimmen?" + Info: "Du kannst deine Stimme bis [Datum] andern."
- Nach Abstimmung: Sanfter Bounce + Haptic Feedback, Verifikations-Hash, "Ergebnis ansehen" + "Teilen" Buttons

**Multiple Choice:**
- Bottom Sheet (70% Bildschirmhohe)
- Checkbox-Liste der Optionen
- Info: "Wahle bis zu [X] Optionen"
- Bestatigungsschritt

**Ranked Choice:**
- Full-Screen Sheet
- Drag-and-Drop Liste mit Griffpunkten (Hamburger-Icon links)
- Touch-optimierte Griff-Bereiche
- Nummerierung automatisch
- "Nicht alle ordnen" als Option
- Bestatigungsschritt

#### Demokratie-Karte (`/karte`) -- Eigener Tab in Bottom Navigation

Das visuelle Herzstuck der kooperativen Stadtsimulation und einer der 5 Haupt-Tabs.

**Mobile Layout (Fullscreen):**
- **Karte:** Vollbild-Karte von Deutschland, geteilt in 299 Wahlkreise
- **Farbkodierung:** Wahlkreise leuchten in Indigo-Abstufungen (heller/gesattigter = aktiver)
- **Live-Pulse:** Wenn Nutzer abstimmen, pulst der entsprechende Wahlkreis kurz auf (dezent, Indigo-Glow)
- **Header-Leiste (uber der Karte):**
  - Links: "Demokratie-Karte"
  - Rechts: Echtzeit-Zahler "X aktiv" (pulsierender Punkt)
- **Eigener Wahlkreis:** Hervorgehoben mit Indigo-Umrandung, automatisch im Viewport zentriert
- **Tipp auf beliebigen Wahlkreis:** Bottom Sheet (40% Hohe) mit kompaktem Dashboard:
  - Wahlkreis-Name + Nummer
  - Fortschritts-Stufe (1-5) mit Stufen-Icon
  - Beteiligungsrate: "X% der Nutzer haben diese Woche abgestimmt"
  - MdB: Foto + Name + Fraktion
  - Top-3-Themen des Wahlkreises
  - "Wahlkreis besuchen" Button -> Volles Wahlkreis-Dashboard
- **Zoom + Drag:** Standard-Kartengesten (Pinch-to-Zoom, Drag)
- **Dark Mode:** Schwarzer Hintergrund, Wahlkreise leuchten intensiver (Indigo auf Schwarz ist besonders markant)

**Desktop Layout:**
- **Karte links** (60%): Identisch zu Mobile, grosser dargestellt
- **Detail-Panel rechts** (40%): Kompaktes Wahlkreis-Dashboard des ausgewahlten Wahlkreises
- **Hover-Effekt:** Wahlkreis wird bei Mouse-Hover hervorgehoben mit Tooltip

**Kompaktes Wahlkreis-Dashboard (Single Page / Bottom Sheet):**

```
+------------------------------------------+
|  Wahlkreis 281: Freiburg                 |
|  Stufe 3 -- Wachstum                     |
|  ████████████░░░░░░  892 aktive Burger   |
+------------------------------------------+
|                                          |
|  Dein MdB                                |
|  [Foto] Dr. Maria Muller (Grune)         |
|  Ubereinstimmung mit Wahlkreis: 72%      |
|                                          |
+------------------------------------------+
|                                          |
|  Top-Themen im Wahlkreis                 |
|  1. Umwelt & Klima  (342 Stimmen)        |
|  2. Wohnen          (287 Stimmen)        |
|  3. Bildung         (198 Stimmen)        |
|                                          |
+------------------------------------------+
|                                          |
|  Diese Woche                             |
|  67 Abstimmungen | 23 Kommentare         |
|  Bridging-Score: 6.8                     |
|                                          |
+------------------------------------------+
```

- Kompakt: Alles auf einer Seite, kein Scrollen notig
- Zahlen in Geist Mono
- Fortschrittsbalken: Indigo Fill auf hellgrauem Hintergrund
- MdB-Foto: Kleiner Kreis (40px), Name + Fraktion daneben

#### Tagliche Session (`/session`)

**Mobile Layout (Full Screen, kein Header):**
- **Schritt-Indikator:** 5 Punkte oben (wie bei Instagram Stories)
- **Schritt 1 (Briefing):** Grosse H1-Uberschrift des Themas, 3 Satze Zusammenfassung, "Weiter"-Button (Indigo)
- **Schritt 2 (Quiz):** Frage + 4 Antwort-Buttons, sofortiges Feedback (Grunes Hintergrund-Flash bei richtig)
- **Schritt 3 (Abstimmung):** Ja/Nein/Enthaltung-Buttons (gross, zentriert), Ergebnis-Reveal mit Odometer-Animation
- **Schritt 4 (Perspektivenwechsel):** Kommentar-Karte mit Pro/Contra-Indikator, "Hilfreich?"/"Nicht hilfreich?" Buttons
- **Schritt 5 (Zusammenfassung):** Streak-Flamme + Punkte + Wahlkreis-Rang + "Morgen: [Thema]"
- Jeder Schritt: Swipe-Links um weiterzugehen
- Minimalistisch: Nur Schwarz/Weiss + Indigo, grosse Typografie, viel Whitespace

#### Meine Wirkung (`/profil/wirkung`)

**Mobile Layout:**
- **Civic Character Sheet:** Hexagon-Chart der 6 Attribute (Indigo auf weissem Hintergrund)
- **Feedback-Loop:** "Vom Gedanken zum Gesetz"-Schritte (animierte Checkmarks)
- **Statistiken-Karten:**
  - "147 Abstimmungen in 2026"
  - "Streak-Rekord: 45 Tage"
  - "Bridging-Score: 7.2"
  - "3 Ergebnisse an MdB gesendet"
- **Wahlkreis-Beitrag:** "Du hast 2,3% der Stimmen deines Wahlkreises beigetragen"
- Alles in monochromen Karten, Zahlen in Geist Mono, Indigo nur fur Highlights

#### Demokratie-Wrapped (`/wrapped/2026`)

**Full-Screen Slide-Show (Stories-Format):**
- 10 Slides, jeweils tippbar zum Weiterblatter
- Jede Slide: Ein Fakt, grosse Zahl (Geist Mono, 48px+), kurzer Satz
- Hintergrund: Schwarz, Text: Weiss, Akzent: Indigo
- Letzte Slide: Share-Buttons (Instagram, WhatsApp, X, Link kopieren)
- Jede Slide einzeln als Bild speicherbar

---

## 9. Phasenplan

### Phase 1: Fundament (MVP) -- Monate 1-6

**Ziel:** Kern-Abstimmungsspiegel + grundlegende Burgerbeteiligung

**Features:**
- AUTH-01 bis AUTH-04, AUTH-08 bis AUTH-10
- BTS-01 bis BTS-08
- VOTE-01, VOTE-02, VOTE-07 bis VOTE-10, VOTE-12
- UGC-01 bis UGC-06
- DIS-01 bis DIS-03, DIS-07, DIS-09
- **GAM-01 (Demokratie-Punkte), GAM-02 (Streak), GAM-03 (Privilegien), GAM-04 (Wahlkreis-Fortschritt), GAM-06 (Tagliche Session), GAM-07 (Sitzungswoche-Live), GAM-14 (Demokratie-Puls)**
- FEED-01 bis FEED-04, FEED-06 bis FEED-08
- PROF-01 bis PROF-09
- ERG-01, **ERG-08 (Feedback-Loop), ERG-09 (Share-Card), ERG-10 (Echtzeit-Zahler)**
- ADM-01 bis ADM-08
- PWA-01 bis PWA-04, PWA-06 bis PWA-09

**Technische Meilensteine:**
- Datenbank-Schema + RLS Policies deployed
- Event Sourcing fur Abstimmungen implementiert
- DIP API Sync Worker lauft
- abgeordnetenwatch Sync Worker lauft
- tRPC API Layer vollstandig
- Next.js Frontend mit Tailwind + shadcn/ui
- Supabase Auth Integration
- PWA Manifest + Service Worker
- Meilisearch Integration
- CI/CD Pipeline (GitHub Actions)
- Monitoring (Sentry + Health Checks)

**Launch-Kriterien:**
- 50+ Bundestag-Themen importiert
- Ja/Nein + MC Abstimmung funktioniert fehlerfrei
- <2s Page Load auf 3G
- Lighthouse >90
- WCAG AA Audit bestanden
- DSFA abgeschlossen
- Basis-Penetrationstest bestanden
- AGB / Nutzungsbedingungen online (LEGAL-01)
- Datenschutzerklarung online (LEGAL-02)
- Impressum online (LEGAL-03)
- Community Guidelines online (LEGAL-04)
- Cookie-Banner implementiert (LEGAL-05)
- Art. 9 Einwilligungs-Flow implementiert (LEGAL-06)
- DPMA-Markenrecherche durchgefuhrt

### Phase 2: Vertiefung -- Monate 7-12

**Ziel:** Tiefere Deliberation + reichere Daten + Community-Features

**Features:**
- AUTH-05, AUTH-07
- BTS-09 bis BTS-13
- VOTE-03, VOTE-04, VOTE-11
- UGC-07, UGC-09, UGC-10
- DIS-04, DIS-06, DIS-08, DIS-10
- **GAM-05 (Themen-Teams), GAM-08 (Quests), GAM-09 (Saisons), GAM-10 (Wrapped), GAM-11 (Badges), GAM-12 (Character Sheet)**
- FEED-05
- GRP-01 bis GRP-04
- ERG-02, ERG-04 bis ERG-06
- PWA-05

### Phase 3: Erweiterung -- Monate 13-24

**Ziel:** Fortgeschrittene demokratische Features + institutionelle Nutzung

**Features:**
- AUTH-06 (eID)
- VOTE-05 (Liquid Democracy), VOTE-06 (Partizipatives Budget)
- UGC-08 (Kollaboratives Editieren)
- DIS-05 (Pol.is-Clustering)
- GRP-05
- ERG-03, ERG-07
- **GAM-13 (Personliche Demokratie-Geschichte)**
- B2G SaaS White-Label (fur Kommunen)
- Native App Wrapper (Capacitor) falls PWA nicht ausreicht
- Erweiterte Analytics fur Forscher (anonymisiert)

---

## 10. Risikoanalyse

### 10.1 Produkt-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| **Niedrige Retention** (Henne-Ei-Problem) | Hoch | Kritisch | Launch mit 50+ vorgeladenen Bundestag-Themen; geschlossene Feedback-Schleife (Vote -> Ergebnis -> Bundestag-Vergleich); Gamification ab Tag 1; wochentlicher Email-Digest |
| **Troll/Manipulation** | Mittel | Hoch | Bridging-Algorithmus; No-Reply-Modus; Reputation-Tiers; Rate Limiting; Community-Moderation |
| **Rechtliche Herausforderung** (Art. 9 DSGVO) | Niedrig | Kritisch | DSFA vor Launch; explizite Einwilligung; rechtliche Beratung |
| **Wettbewerb durch DEMOCRACY App** | Mittel | Mittel | Differenzierung durch Community, Deliberation und Ergebniskommunikation |
| **Solo-Grunder Burnout** | Mittel | Hoch | Kein Zeitdruck; Qualitat vor Speed; Automatisierung maximieren; Community-Beitrage in Phase 3 |
| **Bundestag API Anderungen/Ausfall** | Niedrig | Mittel | Abstraktionsschicht; Fallback auf Cache; Redundanz durch zwei Quellen (DIP + AW) |
| **Sock-Puppet Manipulation** | Mittel | Hoch | Email-Verifizierung; Phone-Verifizierung (Phase 2); eID (Phase 3); Anomalie-Erkennung |

### 10.2 Technische Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| **Event Sourcing Komplexitat** | Mittel | Mittel | Einfache append-only Tabelle zuerst; Hash Chain iterativ; extensive Tests |
| **Supabase Vendor Lock-in** | Niedrig | Mittel | Open Source; Self-Hosting moglich; Standard PostgreSQL |
| **PWA Limitierungen** | Mittel | Mittel | Fruhe Device-Tests; Capacitor als Fallback (Phase 3) |
| **Skalierung uber Free Tiers** | Niedrig | Niedrig | Erst relevant bei signifikanter Traktion; vorhersehbare Preismodelle |
| **BITV/BFSG Non-Compliance** | Mittel | Hoch | axe-core in CI; manuelle Screenreader-Tests; Audit vor Launch |

### 10.3 Business-Risiken

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|-----------|
| **Finanzierungslucke** | Mittel | Mittel | Start mit Free Tiers; Sovereign Tech Fund Bewerbung; Kosten unter 100 EUR/Monat in Phase 1 |
| **Politische Instrumentalisierung** | Mittel | Hoch | Transparente Algorithmen; offentliche Dokumentation; kein politisches Advertising; Bridging gegen parteiische Ubernahme |
| **Medien-Fehldarstellung** | Niedrig | Mittel | Klare Kommunikation: Demokrat ist keine bindende Volksabstimmung; Ergebnisse sind Meinungsumfragen, keine Gesetzgebung |
| **Regulierungsanderungen** | Niedrig | Niedrig | Keine KI in der Plattform; eIDAS 2.0 Readiness eingebaut |

---

## 11. Erfolgskennzahlen (KPIs)

### 11.1 North Star Metric

**Weekly Active Voters (WAV)** -- Nutzer, die mindestens 1 Stimme pro Woche abgeben.

Begrundung: WAV misst den Kern der Plattform -- demokratische Teilhabe. Im Gegensatz zu MAU oder DAU erfordert es eine substanzielle Interaktion (Stimmabgabe), nicht nur passives Browsen.

### 11.2 Phase-1-Ziele (6 Monate nach Launch)

| Metrik | Zielwert | Messung |
|--------|----------|---------|
| Registrierte Nutzer | 10.000 | Supabase Auth Count |
| Monthly Active Users (MAU) | 3.000 | Nutzer mit >=1 Session/Monat |
| Weekly Active Voters (WAV) | 1.000 | Nutzer mit >=1 Vote/Woche |
| Abgegebene Stimmen (Gesamt) | 50.000 | Event Store Count |
| Nutzergenerierte Themen | 200 | Topics mit source='user' |
| Durchschn. Session-Dauer | >3 Min. | Analytics |
| D7 Retention | >20% | Kohortenanalyse |
| D30 Retention | >10% | Kohortenanalyse |
| Lighthouse Performance | >90 | Automatisiert in CI |
| WCAG AA Compliance | 100% | axe-core + manuelles Audit |
| Uptime | >99,5% | Monitoring |
| Vote Latenz (p95) | <1s | Application Metrics |

### 11.3 Retention-Framework

1. **Geschlossene Feedback-Schleife:** Stimme -> Sofort-Ergebnis -> Bundestag-Vergleich -> Benachrichtigung wenn Bundestag abstimmt
2. **Email-Digest:** Wochentliche Zusammenfassung neuer Themen und abgeschlossener Abstimmungen
3. **Push-Notifications:** "Neue Abstimmung im Bundestag: [Thema]"
4. **Gamification:** Streak-Belohnungen, Badge-Benachrichtigungen
5. **Re-Engagement:** "Du hast vor 3 Tagen abgestimmt. Hier ist das Ergebnis."

---

## 12. Wettbewerbsanalyse

### Feature-Vergleichsmatrix

| Feature | Demokrat | DEMOCRACY App | Decidim | adhocracy+ | abgeordnetenwatch |
|---------|----------|---------------|---------|------------|-------------------|
| Bundestag-Abstimmungsspiegel | Ja | Ja | Nein | Nein | Nur Anzeige |
| Nutzergenerierte Themen | Ja | Nein | Ja | Ja | Nein |
| Strukturierte Deliberation | Ja (Bridging) | Nein | Basis-Kommentare | Ja | Nein |
| Gamification/Reputation | Ja | Nein | Basis | Nein | Nein |
| Ergebnisse an Politiker | Ja (Email) | Nein | Institutionell | Kommunal | Nur Q&A |
| PWA | Ja | Nein (native) | Nein | Nein | Nein |
| Open Data API | Ja (Phase 2) | Nein | Ja | Begrenzt | Ja |
| DSGVO Art. 9 konform | Ja | Ja | Variiert | Ja | Ja |
| Liquid Democracy | Phase 3 | Nein | Nein | Nein | Nein |
| Anti-Polarisierung (Bridging) | Ja | Nein | Nein | Nein | Nein |
| Kostenlos nutzbar | Freemium | Ja | Ja (inst.) | Ja (inst.) | Ja |

### Differenzierung

Demokrat ist die **einzige Plattform**, die alle drei Saulen vereint:
1. **Bundestag-Spiegel** (wie DEMOCRACY App)
2. **Strukturierte Burgerbeteiligung** (wie Decidim/adhocracy+)
3. **Anti-Polarisierung durch Bridging-Algorithmus** (einzigartig)

---

## 13. Anhange

### Anhang A: DIP API Feld-Mapping

| DIP-Feld (Vorgang) | Internes Feld (Topic) | Transformation |
|--------------------|-----------------------|----------------|
| `id` | `source_id` | Direkt |
| `titel` | `title` | Direkt |
| `abstract` | `description` | Direkt |
| `sachgebiet[0]` | `category` | Mapping-Tabelle |
| `vorgangstyp` | -- | Filter: Nur "Gesetzgebung" |
| `beratungsstand` | `status` | Mapping: "Verkundet" -> "voting_closed" |
| `datum` | `created_at` | Datumskonversion |
| `aktualisiert` | `updated_at` | Datumskonversion |
| `initiative` | -- | Gespeichert in `bundestag_vorgaenge.initiative` |
| `deskriptor` | -- | Gespeichert in `topic_tags` |

**Sync-Abfrage:**
```
GET /vorgang?apikey={key}&f.wahlperiode=21&f.aktualisiert.start={last_sync}&cursor=*
```

### Anhang B: abgeordnetenwatch API Mapping

| AW-Feld (Poll) | Internes Feld | Transformation |
|----------------|---------------|----------------|
| `id` | `abgeordnetenwatch_id` | Direkt |
| `label` | `titel` | Direkt |
| `field_intro` | `field_intro` / `summary` | HTML -> Markdown |
| `field_poll_date` | `datum` | Datumskonversion |
| `field_accepted` | `field_accepted` | Direkt |
| `field_topics[].label` | Tags | Mapping |

**Sync-Abfrage:**
```
GET /polls?field_legislature[entity.id]=161&range_end=100
```

**Einzelstimmen abrufen:**
```
GET /votes?poll[entity.id]={poll_id}&range_end=1000
```

### Anhang C: DSGVO Verarbeitungsverzeichnis (Auszug)

| Verarbeitungstatigkeit | Zweck | Rechtsgrundlage | Datenkategorien | Empfanger | Aufbewahrung |
|----------------------|-------|-----------------|----------------|-----------|-------------|
| Registrierung | Account-Erstellung | Art. 6(1)(a) Einwilligung | Email, Anzeigename, Wahlkreis | Supabase (EU) | Bis Loschung |
| Stimmabgabe | Demokratische Teilhabe | Art. 9(2)(a) Explizite Einwilligung | Abstimmungswahl (politische Meinung) | PostgreSQL (EU) | Anonymisiert bei Loschung |
| Kommentare | Deliberation | Art. 6(1)(a) Einwilligung | Kommentartext, Position | PostgreSQL (EU) | Pseudonymisiert bei Loschung |
| Analytics | Plattformverbesserung | Art. 6(1)(f) Berechtigtes Interesse | Aggregierte Nutzungsdaten | Vercel Analytics (EU) | 90 Tage |
| Bundestag-Sync | Informationsbereitstellung | Art. 6(1)(e) Offentliches Interesse | Offentliche Parlamentsdaten | PostgreSQL (EU) | Dauerhaft |

### Anhang D: DSFA Outline (Datenschutz-Folgenabschatzung)

**Muss vor Launch abgeschlossen werden** (Art. 35 DSGVO -- Verarbeitung politischer Meinungen ist "hohes Risiko").

1. **Systematische Beschreibung:** Plattform verarbeitet Abstimmungsdaten als politische Meinungsausserungen (Art. 9)
2. **Notwendigkeit und Verhaltnismassigkeit:** Datenminimierung (nur Wahl + pseudonyme User-ID); Zweckbindung (nur Abstimmungsergebnisse)
3. **Risiken fur Rechte und Freiheiten:**
   - Profilbildung politischer Meinungen
   - Diskriminierung aufgrund politischer Ansichten
   - Datenleck mit politisch sensiblen Informationen
4. **Abhilfemassnahmen:**
   - Pseudonymisierung der Vote-Analysen
   - Row Level Security auf alle Tabellen
   - Encryption at Rest (AES-256) und in Transit (TLS 1.3)
   - Verify-then-Forget fur eID
   - Account-Loschung mit vollstandiger PII-Purge
   - Regelmasige Security Audits

### Anhang E: Barrierefreiheit Checklist

| Kategorie | Kriterium | WCAG | Status |
|-----------|----------|------|--------|
| Wahrnehmbar | Textalternativen fur Bilder | 1.1.1 | -- |
| Wahrnehmbar | Untertitel fur Videos | 1.2.2 | -- |
| Wahrnehmbar | Farbkontrast 4.5:1 | 1.4.3 | -- |
| Wahrnehmbar | Text grosserbar auf 200% | 1.4.4 | -- |
| Bedienbar | Tastaturzuganglich | 2.1.1 | -- |
| Bedienbar | Keine Tastaturfalle | 2.1.2 | -- |
| Bedienbar | Skip Navigation | 2.4.1 | -- |
| Bedienbar | Fokus sichtbar | 2.4.7 | -- |
| Verstandlich | Sprache der Seite angegeben | 3.1.1 | -- |
| Verstandlich | Labels fur Eingabefelder | 3.3.2 | -- |
| Verstandlich | Fehlererkennung | 3.3.1 | -- |
| Robust | ARIA Landmarks | 4.1.2 | -- |
| Robust | Name, Role, Value | 4.1.2 | -- |

### Anhang F: Kostenschatzung

| Service | Phase 1 (monatlich) | Phase 2 (monatlich) | Anmerkungen |
|---------|--------------------|--------------------|-------------|
| Supabase Pro | 25 EUR | 75 EUR | Pro Plan, EU Region |
| Vercel Pro | 20 EUR | 20 EUR | Next.js Hosting |
| Upstash Redis | 0-10 EUR | 10-30 EUR | Pay-per-Request |
| Meilisearch Cloud | 0-30 EUR | 30-60 EUR | Build Plan |
| Mapbox | 0 EUR | 0-50 EUR | Free Tier: 50k Map Loads/Monat, reicht fur Phase 1 |
| Stripe | 0 EUR | ~2-3% Umsatz | Keine Fixkosten, nur Transaktionsgebuhren |
| OpenAI API | 10-30 EUR | 30-60 EUR | Content-Pipeline: Zusammenfassungen, Quiz, News-Links |
| Resend | 0 EUR | 20 EUR | Free Tier reicht fur Phase 1 |
| Sentry | 0 EUR | 0-26 EUR | Free Tier / Team Plan |
| Domain + DNS | 2 EUR | 2 EUR | .de Domain |
| **Gesamt** | **~60-120 EUR** | **~190-345 EUR** | Exkl. Stripe-Transaktionsgebuhren |

### Anhang G: Glossar

Siehe [Section 0](#0-glossar).

---

## 14. Entscheidungsprotokoll

Alle offenen Fragen wurden im Rahmen der PRD-Erstellung geklart:

| ID | Frage | Entscheidung | Datum |
|----|-------|-------------|-------|
| OQ-001 | Zusammenfassungen Editorial oder Community? | Redaktionell in Phase 1 (abgeordnetenwatch `field_intro` als Basis), Community-Erweiterung in Phase 2 | 30.03.2026 |
| OQ-002 | Unterstutzerschwelle fur nutzergenerierte Themen? | 10 Unterstutzer in der Startphase (konfigurierbar, kann mit Nutzerwachstum skaliert werden) | 30.03.2026 |
| OQ-003 | Stimmabgabe anonym oder pseudonym? | Pseudonym: Nutzer sehen ihr eigenes Votum, andere sehen nur Aggregate. Admin sieht nichts. Event Store speichert user_id fur Integritatsprufung, aber RLS verhindert Einsicht durch Dritte | 30.03.2026 |
| OQ-004 | Premium-Paywall-Features? | Free: Abstimmen, Kommentieren, Feed, Karte, Ergebnisse, Streak, Quests. Premium: Detaillierte Wahlkreis-Analysen, erweiterte Character-Sheet-Statistiken, historische Vergleiche, Datenexport, Embed-Widgets, unbegrenzte Themen-Erstellung, erweiterte Benachrichtigungen | 30.03.2026 |
| OQ-005 | Finaler Markenname? | "Demokrat" bleibt Arbeitstitel. DPMA-Markenrecherche vor Launch durchfuhren | 30.03.2026 |
| OQ-006 | Bridging-Algorithmus? | Vereinfacht in Phase 1 (min/max Ratio), volle Matrix-Faktorisierung in Phase 2 | 30.03.2026 |
| OQ-007 | DPMA-Markeneintragung? | Ja, vor offentlichem Launch. Budget: ~300 EUR fur Wortmarke | 30.03.2026 |
| OQ-008 | Rechtsform? | UG (haftungsbeschrankt) fur den Start -- niedrigste Hurde (1 EUR Stammkapital). Umwandlung in GmbH bei Wachstum | 30.03.2026 |
| OQ-009 | Design-Stil? | Notion-inspiriert, minimalistisch: Schwarz/Weiss/Grau + Indigo (#4F46E5). Light Mode Standard, Dark Mode optional | 30.03.2026 |
| OQ-010 | Gamification-Ansatz? | Kooperative Stadtsimulation. Wahlkreis-Teams + Themen-Teams. Kein kompetitives Ranking | 30.03.2026 |
| OQ-011 | Karten-Platzierung? | Eigener Tab in Bottom Nav: Home \| Suche \| + \| Karte \| Profil | 30.03.2026 |
| OQ-012 | Onboarding? | Kombiniert: Kurzer Flow (Wahlkreis + 3 Interessen + Tagesziel) + organisch wachsender Charakter | 30.03.2026 |
| OQ-013 | News-Feed? | Hybrid: Plattform-Inhalte + 2-3 kuratierte Nachrichtenlinks pro Bundestag-Thema als "Hintergrund" | 30.03.2026 |
| OQ-014 | Wahlkreis-Dashboard? | Kompakt (eine Seite): Fortschritts-Stufe, MdB, Top-Themen, Beteiligungsrate, Bridging-Score | 30.03.2026 |

---

*Dieses Dokument ist ein lebendes Dokument und wird laufend aktualisiert.*

*Letzte Aktualisierung: 30. Marz 2026*
