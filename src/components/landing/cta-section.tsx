import Link from 'next/link';
import { cn } from '@/lib/utils';

export function CtaSection() {
  return (
    <section className="bg-primary py-20 text-primary-foreground">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Bereit, deine Stimme einzubringen?
        </h2>
        <p className="max-w-lg text-lg text-primary-foreground/80">
          Registriere dich kostenlos und werde Teil der digitalen Demokratie.
        </p>
        <Link
          href="/registrieren"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-base font-medium text-primary hover:bg-white/90"
        >
          Kostenlos registrieren
        </Link>
      </div>
    </section>
  );
}
