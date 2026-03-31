'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  PlusCircle,
  Map,
  User,
  Landmark,
  Bell,
  Settings,
  Flame,
  MapPin,
  TrendingUp,
  Users,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/config/site'

const mainNavItems = [
  { label: 'Feed', href: '/feed', icon: Home },
  { label: 'Suche', href: '/search', icon: Search },
  { label: 'Erstellen', href: '/create', icon: PlusCircle },
  { label: 'Karte', href: '/map', icon: Map },
  { label: 'Profil', href: '/profile', icon: User },
  { label: 'Bundestag', href: '/bundestag', icon: Landmark },
  { label: 'Benachrichtigungen', href: '/notifications', icon: Bell },
  { label: 'Einstellungen', href: '/settings', icon: Settings },
]

const trendingTopics = [
  'Klimaschutzgesetz 2026',
  'Digitale Bildung',
  'Mietpreisbremse',
]

/**
 * Left sidebar navigation for desktop (md+ screens).
 * Contains main navigation links, streak info, and wahlkreis badge.
 */
function DesktopSidebarLeft() {
  const pathname = usePathname()

  return (
    <aside
      className="sticky top-[3.75rem] hidden h-[calc(100vh-3.75rem)] w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-background py-4 md:flex"
      aria-label="Seitennavigation"
    >
      {/* Logo & App Name */}
      <div className="mb-4 px-3">
        <Link
          href="/feed"
          className="flex items-center gap-2 text-lg font-bold text-primary"
        >
          <Landmark className="h-6 w-6" />
          <span>{siteConfig.name}</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-l-2 border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section: Streak + Wahlkreis */}
      <div className="mt-auto space-y-3 px-3 pt-4">
        {/* Streak Card */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
          <Flame
            className="h-5 w-5 text-orange-500 animate-[flame-pulse_2s_ease-in-out_infinite]"
            aria-hidden="true"
          />
          <div className="text-sm">
            <span className="font-semibold text-foreground">7 Tage</span>{' '}
            <span className="text-muted-foreground">Streak</span>
          </div>
        </div>

        {/* Wahlkreis Badge */}
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">
            Wahlkreis 42 - Berlin Mitte
          </span>
        </div>
      </div>
    </aside>
  )
}

/**
 * Right sidebar for desktop (md+ screens).
 * Contains trending topics, democracy pulse stats, and footer links.
 */
function DesktopSidebarRight() {
  return (
    <aside
      className="sticky top-[3.75rem] hidden h-[calc(100vh-3.75rem)] w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-background py-4 lg:flex"
      aria-label="Zusätzliche Informationen"
    >
      {/* Trending Section */}
      <div className="px-4 pb-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          Trending
        </h2>
        <ul className="space-y-2">
          {trendingTopics.map((topic, index) => (
            <li key={topic}>
              <Link
                href="/feed"
                className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                <span className="mt-0.5 text-xs font-medium text-muted-foreground">
                  {index + 1}
                </span>
                <span className="text-foreground group-hover:text-primary">
                  {topic}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Demokratie-Puls Card */}
      <div className="mx-4 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
          Demokratie-Puls
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Aktive Teilnehmer heute
            </span>
            <span className="text-sm font-semibold text-foreground">1.247</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              Themen diese Woche
            </span>
            <span className="text-sm font-semibold text-foreground">34</span>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto px-4 pt-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <Link href="/impressum" className="hover:text-foreground hover:underline">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground hover:underline">
            Datenschutz
          </Link>
          <Link href="/transparenz" className="hover:text-foreground hover:underline">
            Transparenz
          </Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground/60">
          &copy; 2026 {siteConfig.name}
        </p>
      </div>
    </aside>
  )
}

export { DesktopSidebarLeft, DesktopSidebarRight }
