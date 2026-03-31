'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const legalPages = [
  { href: '/datenschutz', label: 'Datenschutz' },
  { href: '/nutzungsbedingungen', label: 'Nutzungsbedingungen' },
  { href: '/impressum', label: 'Impressum' },
  { href: '/community-regeln', label: 'Community-Regeln' },
  { href: '/dsfa', label: 'DSFA' },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Demokrat</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium">Rechtliches</span>
          <Badge variant="outline" className="ml-auto text-[10px]">
            Version 1.0
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-10">
          {/* Desktop sidebar navigation */}
          <nav className="hidden w-48 shrink-0 md:block" aria-label="Rechtliche Seiten">
            <div className="sticky top-22">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seiten
              </p>
              <ul className="space-y-1">
                {legalPages.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className={cn(
                        'block rounded-md px-3 py-2 text-sm transition-colors',
                        pathname === page.href
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <article className="prose prose-neutral dark:prose-invert max-w-3xl">
              {children}
            </article>

            {/* Footer */}
            <footer className="mt-12 border-t pt-6">
              <p className="text-xs text-muted-foreground">
                Stand: März 2026
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
