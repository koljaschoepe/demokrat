import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Heart, Scale, Users, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Bridging-Score -- Transparenz',
  description:
    'So funktioniert der Bridging-Score bei Demokrat: Wie wir Argumente fördern, die Brücken bauen statt zu polarisieren.',
};

const EXAMPLES = [
  {
    label: 'Stark brückenbildend',
    yesVotes: 45,
    noVotes: 42,
    score: 0.93,
    color: 'text-green-700 bg-green-100',
    description: 'Wird von beiden Seiten nahezu gleich geschätzt.',
  },
  {
    label: 'Teilweise brückenbildend',
    yesVotes: 30,
    noVotes: 15,
    score: 0.5,
    color: 'text-amber-700 bg-amber-100',
    description: 'Wird eher von einer Seite geschätzt, aber nicht ausschließlich.',
  },
  {
    label: 'Einseitig',
    yesVotes: 50,
    noVotes: 5,
    score: 0.1,
    color: 'text-red-700 bg-red-100',
    description:
      'Wird fast nur von einer Seite geschätzt -- vermutlich ein parteiisches Argument.',
  },
];

export default function BridgingScorePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/transparenz"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Zurück zur Transparenz-Übersicht
      </Link>

      {/* Header */}
      <section className="mb-10 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-pink-100">
          <Heart className="size-7 text-pink-700" />
        </div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Was ist der Bridging-Score?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Der Bridging-Score misst, wie sehr ein Kommentar von beiden Seiten
          einer Abstimmung geschätzt wird. Er ist unser wichtigstes Werkzeug
          gegen Polarisierung.
        </p>
      </section>

      {/* Section 1: Erklaerung */}
      <section className="mb-10">
        <Card>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-700">
              <Scale className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Das Prinzip</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Bei jeder Abstimmung gibt es Nutzer, die mit Ja und Nutzer, die
                mit Nein gestimmt haben. Wenn ein Kommentar von{' '}
                <strong className="text-foreground">beiden Gruppen</strong>{' '}
                positiv bewertet wird, ist das ein starkes Signal dafür, dass
                dieses Argument überparteilich wertvoll ist. Genau das misst
                der Bridging-Score.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: Die Formel */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Die Formel</h2>
        <Card className="border-indigo-200/50 bg-indigo-50/30">
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Der Bridging-Score wird für jeden Kommentar wie folgt berechnet:
            </p>
            <code className="block rounded-lg bg-muted px-4 py-3 font-mono text-sm">
              bridging_score = min(upvotes_yes, upvotes_no) /
              max(upvotes_yes, upvotes_no)
            </code>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">upvotes_yes</strong> =
                Anzahl positiver Bewertungen von Nutzern, die mit Ja gestimmt
                haben
              </p>
              <p className="mt-1">
                <strong className="text-foreground">upvotes_no</strong> =
                Anzahl positiver Bewertungen von Nutzern, die mit Nein gestimmt
                haben
              </p>
              <p className="mt-3">
                Das Ergebnis ist ein Wert zwischen{' '}
                <strong className="text-foreground">0.0</strong> (nur eine Seite
                stimmt zu) und{' '}
                <strong className="text-foreground">1.0</strong> (perfekte
                Übereinstimmung beider Seiten).
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Beispiele */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-bold">Beispiele</h2>
        <div className="flex flex-col gap-3">
          {EXAMPLES.map((example) => (
            <Card key={example.label}>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${example.color}`}
                      >
                        {example.score.toFixed(2)}
                      </span>
                      <span className="text-sm font-semibold">
                        {example.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {example.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded bg-green-50 px-2 py-1">
                      Ja-Stimmer: {example.yesVotes} Upvotes
                    </span>
                    <span className="rounded bg-red-50 px-2 py-1">
                      Nein-Stimmer: {example.noVotes} Upvotes
                    </span>
                  </div>
                </div>
                <div className="mt-3">
                  <code className="text-xs text-muted-foreground font-mono">
                    min({example.yesVotes}, {example.noVotes}) / max(
                    {example.yesVotes}, {example.noVotes}) ={' '}
                    {Math.min(example.yesVotes, example.noVotes)} /{' '}
                    {Math.max(example.yesVotes, example.noVotes)} ={' '}
                    {example.score.toFixed(2)}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Section 4: Warum Bridging? */}
      <section className="mb-4">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Lightbulb className="size-5 text-amber-500" />
          Warum Bridging?
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  Gegen Polarisierung
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Soziale Medien belohnen oft Empörung und Extreme. Der
                  Bridging-Score dreht dieses Prinzip um: Wer Argumente findet,
                  die beide Seiten überzeugen, wird belohnt.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Scale className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  Qualität statt Lautstärke
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ein hoher Bridging-Score signalisiert, dass ein Argument
                  substanziell ist -- nicht nur laut. Kommentare mit hohem
                  Bridging-Score erhalten +{10} Bonuspunkte und werden im Feed
                  bevorzugt angezeigt.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
                <Heart className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  Inspiriert von Community Notes
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Das Konzept ist inspiriert von Twitters/Xs Community Notes und
                  der Forschung zu &ldquo;bridging-based ranking&rdquo;. Es
                  wurde gezeigt, dass diese Methode die Qualität öffentlicher
                  Diskurse messbar verbessert.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
