'use client'

import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast as ToastType, ToastVariant } from '@/hooks/use-toast'

const variantStyles: Record<ToastVariant, string> = {
  default:
    'border-border bg-background text-foreground',
  destructive:
    'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/20',
  success:
    'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20',
}

const variantIcons: Record<ToastVariant, React.ElementType> = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
}

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  const Icon = variantIcons[toast.variant]

  return (
    <div
      data-slot="toast"
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg',
        'animate-[slide-in-bottom_300ms_ease-out]',
        variantStyles[toast.variant],
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-tight">{toast.title}</p>
        {toast.description && (
          <p className="text-xs opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label="Benachrichtigung schließen"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export { Toast }
