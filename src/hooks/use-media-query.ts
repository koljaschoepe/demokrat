'use client'

import { useState, useEffect } from 'react'

/**
 * SSR-safe media query hook.
 * Returns false during SSR and initial hydration, then syncs with the actual match state.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query)

    // Set the initial value
    setMatches(mediaQueryList.matches)

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches)
    }

    mediaQueryList.addEventListener('change', handleChange)
    return () => {
      mediaQueryList.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}
