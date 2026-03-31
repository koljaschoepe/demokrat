'use client'

import * as React from 'react'
import { DesktopSidebarLeft, DesktopSidebarRight } from '@/components/layout/desktop-sidebar'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

/**
 * Responsive wrapper that provides 3-column layout on desktop.
 * On mobile: renders only the children (bottom nav handles navigation).
 * On md+: left sidebar | center content (max-w-2xl) | right sidebar.
 */
function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  return (
    <div className="flex w-full justify-center gap-0">
      {/* Left sidebar — hidden below md */}
      <DesktopSidebarLeft />

      {/* Center content */}
      <div className="min-w-0 flex-1 md:max-w-2xl">
        {children}
      </div>

      {/* Right sidebar — hidden below lg */}
      <DesktopSidebarRight />
    </div>
  )
}

export { ResponsiveLayout }
