import Link from 'next/link';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-20 text-center md:py-28">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Deine Stimme.{' '}
            <span className="text-primary">Zwischen den Wahlen.</span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            Stimme über Bundestagsthemen ab, vergleiche dein Votum mit dem
            Bundestag und gestalte Demokratie aktiv mit.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/registrieren"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            Jetzt mitmachen
          </Link>
          <a
            href="#so-funktionierts"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-6 text-base font-medium text-foreground hover:bg-muted"
          >
            So funktioniert&apos;s
          </a>
        </div>
        <div className="mt-4 w-full max-w-md">
          <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex h-5 items-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                BUNDESTAG
              </span>
              <span className="text-xs text-muted-foreground">Aktuell</span>
            </div>
            <p className="mb-4 text-sm font-semibold text-foreground">
              Cannabisgesetz -- Änderungsantrag
            </p>
            <div className="flex gap-2">
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                Ja
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                Nein
              </span>
              <span className="flex h-9 flex-1 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                Enthaltung
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
