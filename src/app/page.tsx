import { Metadata } from 'next';
import { HeroSection } from '@/components/landing/hero-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ValueProps } from '@/components/landing/value-props';
import { LivePreview } from '@/components/landing/live-preview';
import { CtaSection } from '@/components/landing/cta-section';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `${siteConfig.name} — Deine Stimme. Zwischen den Wahlen.`,
  description: siteConfig.description,
  openGraph: { title: siteConfig.name, description: siteConfig.description },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-primary">
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/anmelden"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Anmelden
            </Link>
            <Link
              href="/registrieren"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>
      <HeroSection />
      <HowItWorks />
      <ValueProps />
      <LivePreview />
      <CtaSection />
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-sm text-muted-foreground">
          <div className="flex gap-6">
            <Link href="/impressum" className="hover:text-foreground">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-foreground">
              Datenschutz
            </Link>
            <Link
              href="/nutzungsbedingungen"
              className="hover:text-foreground"
            >
              Nutzungsbedingungen
            </Link>
            <Link href="/transparenz" className="hover:text-foreground">
              Transparenz
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}</p>
        </div>
      </footer>
    </div>
  );
}
