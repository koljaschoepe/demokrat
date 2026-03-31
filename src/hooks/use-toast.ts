'use client'

import { useState, useCallback, useRef, useSyncExternalStore } from 'react'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

export interface ToastInput {
  title: string
  description?: string
  variant?: ToastVariant
}

const TOAST_DISMISS_DELAY = 5000
const TOAST_LIMIT = 5

let toasts: Toast[] = []
let listeners: Array<() => void> = []
let count = 0

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener]
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot() {
  return toasts
}

function getServerSnapshot(): Toast[] {
  return []
}

function addToast(input: ToastInput): string {
  const id = String(++count)
  const newToast: Toast = {
    id,
    title: input.title,
    description: input.description,
    variant: input.variant ?? 'default',
  }

  toasts = [newToast, ...toasts].slice(0, TOAST_LIMIT)
  emitChange()

  setTimeout(() => {
    dismissToast(id)
  }, TOAST_DISMISS_DELAY)

  return id
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emitChange()
}

/**
 * Hook for managing toast notifications.
 * Returns the current toasts array, a `toast()` function to create toasts,
 * and a `dismiss()` function to remove individual toasts.
 */
export function useToast() {
  const currentToasts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    toasts: currentToasts,
    toast: addToast,
    dismiss: dismissToast,
  }
}
