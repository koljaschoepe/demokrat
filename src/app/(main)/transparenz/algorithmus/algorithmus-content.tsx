'use client';

import {
  Timer,
  Target,
  MapPin,
  TrendingUp,
  Calendar,
  Sparkles,
  ShieldCheck,
  Eye,
  Ban,
  Code2,
  Scale,
  Clock,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Hardcoded values matching src/server/lib/feed/constants.ts
const BOOST_FACTORS = [
  {
    key: 'ACTIVE_WINDOW',
    label: 'Aktives Abstimmungsfenster',
    description:
      'Themen mit laufender Abstimmung erhalten einen Boost, damit Nutzer rechtzeitig abstimmen können.',
    value: 1.0,
    icon: Timer,
    color: 'bg-red-100 text-red-700',
  },
  {
    key: 'CATEGORY_MATCH',
    label: 'Kategorie-Übereinstimmung',
    description:
      'Themen aus bevorzugten Kategorien des Nutzers erhalten einen Boost für persönliche Relevanz.',
    value: 0.5,
    icon: Target,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    key: 'WAHLKREIS',
    label: 'Wahlkreis-Übereinstimmung',
    description:
      'Themen aus dem eigenen Wahlkreis erhalten einen Boost für lokale Relevanz.',
    value: 0.3,
    icon: MapPin,
    color: 'bg-green-100 text-green-700',
  },
  {
    key: 'ENGAGEMENT_VELOCITY',
    label: 'Engagement-Geschwindigkeit',
    description:
      'Themen mit hoher aktueller Aktivität (Stimmen und Kommentare in den letzten 24 Stunden) erhalten einen Boost.',
    value: 0.2,
    icon: TrendingUp,
    color: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'SITZUNGSWOCHE',
    label: 'Sitzungswoche',
    description:
      'Während einer Sitzungswoche des Bundestags erhalten alle Themen einen Boost, da politische Entscheidungen anstehen.',
    value: 0.5,
    icon: Calendar,
    color: 'bg-purple-100 text-purple-700',
  },
];

const ANTI_PATTERNS = [
  {
    icon: Eye,
    title: 'Keine personalisierten Filterblasen',
    description:
      'Alle Nutzer sehen denselben Feed. Wir zeigen bewusst auch Themen, die nicht deiner Meinung entsprechen.',
  },
  {
    icon: Ban,
    title: 'Kein Engagement-Baiting',
    description:
      'Wir optimieren nicht auf Empörung oder Klicks. Kontroverse Themen werden nicht bevorzugt, nur weil sie mehr Reaktionen auslösen.',
  },
  {
    icon: ShieldCheck,
    title: 'Keine bezahlte Platzierung',
    description:
      'Kein Thema kann sich eine bessere Position im Feed erkaufen. Es gibt keine gesponserten Inhalte.',
  },
  {
    icon: ShieldCheck,
    title: 'Kein Tracking für Werbezwecke',
    description:
      'Wir tracken dein Verhalten nicht für Werbung. Deine Daten gehören dir, nicht Werbekunden.',
  },
];

function BoostFactorCard({
  factor,
}: {
  factor: (typeof BOOST_FACTORS)[number];
}) {
  const Icon = factor.icon;
  const percentage = Math.round(factor.value * 100);

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              factor.color,
            )}
          >
            <Icon className="size-5" />
          </div>
          <Badge
            variant="secondary"
            className="font-mono text-sm font-bold"
          >
            +{percentage}%
          </Badge>
        </div>
        <h3 className="text-sm font-semibold">{factor.label}</h3>
        <p className="text-sm text-muted-foreground">{factor.description}</p>
      </CardContent>
    </Card>
  );
}

export function AlgorithmusContent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Header */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-100">
          <Sparkles className="size-7 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Transparenter Algorithmus
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Bei Demokrat wissen Nutzer genau, warum sie bestimmte Themen sehen.
          Hier erklären wir offen, wie unser Feed-Algorithmus funktioniert.
        </p>
      </section>

      {/* Boost-Faktoren */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Boost-Faktoren</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Jedes Thema erhält einen chronologischen Basis-Score. Die folgenden
          Faktoren können den Score erhöhen:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {BOOST_FACTORS.map((factor) => (
            <BoostFactorCard key={factor.key} factor={factor} />
          ))}
        </div>
      </section>

      {/* Chronologische Basis */}
      <section className="mb-10">
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Chronologische Basis</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Jedes Thema startet mit einem Zeitwert, der mit einer{' '}
                <strong>Halbwertszeit von 48 Stunden</strong> abnimmt. Das
                bedeutet: Ein Thema, das 48 Stunden alt ist, hat nur noch die
                Hälfte seines ursprünglichen Zeitwerts. Nach 96 Stunden nur
                noch ein Viertel. So bleiben aktuelle Themen oben, während
                ältere natürlich nach unten wandern.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 80/20 Mischung */}
      <section className="mb-10">
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Scale className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">80/20 Mischung</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Der Feed zeigt eine ausgewogene Mischung: Etwa{' '}
                <strong>80% Bundestag-Themen</strong> (echte Gesetzgebung und
                parlamentarische Vorgänge) und{' '}
                <strong>20% Bürger-Themen</strong> (von der Community
                vorgeschlagene Themen). So steht die reale Politik im
                Mittelpunkt, während Bürger-Initiativen sichtbar bleiben.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bridging-Score */}
      <section className="mb-10">
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-700">
              <Heart className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bridging-Score</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Kommentare, die von beiden Seiten einer Abstimmung geschätzt
                werden, erhalten einen Bridging-Bonus. Die Formel:{' '}
              </p>
              <code className="mt-2 inline-block rounded bg-muted px-3 py-1.5 font-mono text-xs">
                min(upvotes_yes, upvotes_no) / max(upvotes_yes, upvotes_no)
              </code>
              <p className="mt-2 text-sm text-muted-foreground">
                Ein Wert nahe 1.0 bedeutet, dass ein Kommentar von Ja- und
                Nein-Stimmern gleichermaßen geschätzt wird. So fördern wir
                Argumente, die Brücken bauen, statt zu polarisieren.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Was wir NICHT tun */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Was wir NICHT tun</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ANTI_PATTERNS.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-red-200/50">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Quellcode */}
      <section className="mb-4">
        <Card className="border-indigo-200/50 bg-indigo-50/30">
          <CardContent className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Code2 className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold">Quellcode</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Der Feed-Algorithmus von Demokrat wird als Open-Source
                veröffentlicht. Du kannst den Code selbst prüfen und
                Verbesserungen vorschlagen.
              </p>
            </div>
            <a
              href="https://github.com/demokrat-de/demokrat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <ExternalLink className="size-4" />
              GitHub
            </a>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
