'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, Search, PlusCircle, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollDirection } from '@/hooks/use-scroll-direction';

const navItems = [
  { key: 'home' as const, href: '/feed', icon: Home },
  { key: 'search' as const, href: '/search', icon: Search },
  { key: 'create' as const, href: '/create', icon: PlusCircle },
  { key: 'map' as const, href: '/map', icon: Map },
  { key: 'profile' as const, href: '/profile', icon: User },
];

interface BottomNavProps {
  unreadCount?: number;
}

export function BottomNav({ unreadCount = 0 }: BottomNavProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const scrollDirection = useScrollDirection();

  const isHidden = scrollDirection === 'down';

  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden',
        'pb-[env(safe-area-inset-bottom)]',
        'transition-transform duration-300 ease-in-out',
        isHidden && 'translate-y-full',
      )}
      aria-label="Hauptnavigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isCreate = item.key === 'create';
          const isHome = item.key === 'home';

          // Raised create button in the middle
          if (isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors"
                aria-label={t(item.key)}
              >
                <span
                  className={cn(
                    '-mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95',
                    isActive && 'ring-2 ring-primary/30',
                  )}
                >
                  <PlusCircle className="h-6 w-6 text-primary-foreground" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {/* Notification badge on Home tab */}
                {isHome && unreadCount > 0 && (
                  <span
                    className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white"
                    aria-label={`${unreadCount > 9 ? '9+' : unreadCount} ungelesene Benachrichtigungen`}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
