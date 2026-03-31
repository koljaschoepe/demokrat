'use client'

import * as React from 'react'
import { useToast } from '@/hooks/use-toast'
import { Toast } from '@/components/ui/toast'

/**
 * Renders all active toasts from the toast store.
 * Position: fixed bottom-right on desktop, bottom-center on mobile.
 * Sits above the bottom nav on mobile (bottom-20).
 */
function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      data-slot="toaster"
      aria-label="Benachrichtigungen"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6 md:inset-x-auto md:right-6 md:items-end"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  )
}

export { Toaster }
