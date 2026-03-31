'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  RefreshCw,
  BarChart3,
  ScrollText,
  ToggleLeft,
  HeartPulse,
  ArrowLeft,
  Lock,
  Shield,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrivilegeTier } from '@/lib/auth/types';
import { PRIVILEGE_TIERS } from '@/lib/auth/types';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** Minimum tier required to access this item */
  minTier?: PrivilegeTier;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/moderation', label: 'Moderation', icon: ShieldAlert },
  { href: '/admin/users', label: 'Nutzer', icon: Users, minTier: 4 },
  { href: '/admin/sync', label: 'Sync', icon: RefreshCw },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  {
    href: '/admin/system-health',
    label: 'System Health',
    icon: HeartPulse,
  },
  {
    href: '/admin/audit-log',
    label: 'Audit-Log',
    icon: ScrollText,
    minTier: 4,
  },
  {
    href: '/admin/feature-flags',
    label: 'Feature Flags',
    icon: ToggleLeft,
    minTier: 4,
  },
  {
    href: '/admin/launch-checklist',
    label: 'Launch Checklist',
    icon: Rocket,
    minTier: 4,
  },
];

interface AdminSidebarProps {
  displayName: string;
  privilegeTier: PrivilegeTier;
}

export function AdminSidebar({
  displayName,
  privilegeTier,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const tierLabel = PRIVILEGE_TIERS[privilegeTier].name;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      {/* Header */}
      <div className="border-b px-4 py-4">
        <h2 className="text-base font-semibold">Demokrat Admin</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isRestricted =
            item.minTier !== undefined && item.minTier > privilegeTier;

          return (
            <Link
              key={item.href}
              href={isRestricted ? '#' : item.href}
              aria-disabled={isRestricted}
              tabIndex={isRestricted ? -1 : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                isRestricted &&
                  'pointer-events-none opacity-50',
              )}
            >
              <Icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.minTier !== undefined && (
                <Lock className="size-3 text-muted-foreground/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin info + back link */}
      <div className="border-t p-3">
        {/* Current admin display */}
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
          <Shield className="size-4 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">{tierLabel}</p>
          </div>
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Zurück zur App
        </Link>
      </div>
    </aside>
  );
}
