import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/feed" className="text-lg font-bold text-primary">
          {siteConfig.name}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
