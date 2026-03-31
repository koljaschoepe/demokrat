import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Transparenz',
  description:
    'Demokrat verpflichtet sich zu vollständiger Transparenz. Erfahre wie unsere Algorithmen, das Punktesystem und der Bridging-Score funktionieren.',
};

const TRANSPARENZ_CARDS = [
  {
    href: '/transparenz/algorithmus',
    icon: Sparkles,
    title: 'Feed-Algorithmus',
    description:
      'Erfahre genau, wie unser Feed sortiert wird und welche Faktoren Themen nach oben bringen.',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    href: '/transparenz/punktesystem',
    icon: TrendingUp,
    title: 'Punktesystem',
    description:
      'Wie du Punkte sammelst, welche Privilegstufen es gibt und wie Streaks funktionieren.',
    color: 'bg-green-100 text-green-700',
  },
  {
    href: '/transparenz/bridging',
    icon: Heart,
    title: 'Bridging-Score',
    description:
      'Wie wir Argumente fördern, die Brücken bauen statt zu polarisieren.',
    color: 'bg-pink-100 text-pink-700',
  },
  {
    href: '/transparenz/daten',
    icon: Database,
    title: 'Datenverarbeitung',
    description:
      'Welche Daten wir erheben, warum wir sie brauchen und wie lange wir sie speichern.',
    color: 'bg-amber-100 text-amber-700',
  },
] as const;

export default function TransparenzHubPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      {/* Hero */}
      <section className="mb-10 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Transparenz bei Demokrat
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Als Plattform für demokratische Teilhabe ist es unsere Pflicht, alle
          Prozesse offen und nachvollziehbar zu gestalten. Hier erklären wir,
          wie Demokrat funktioniert.
        </p>
      </section>

      {/* Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2">
        {TRANSPARENZ_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group block no-underline"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardContent className="flex h-full flex-col gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${card.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-base font-semibold">{card.title}</h2>
                  <p className="flex-1 text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Mehr erfahren{' '}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
