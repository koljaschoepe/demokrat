'use client'

import { useState, useEffect, useRef } from 'react'

type ScrollDirection = 'up' | 'down' | null

/**
 * Tracks the scroll direction of the page.
 * Uses a threshold (10px) to prevent jitter from small scroll movements.
 * Returns 'up', 'down', or null (initial state).
 */
export function useScrollDirection(threshold: number = 10): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    lastScrollY.current = window.scrollY

    function updateScrollDirection() {
      const currentScrollY = window.scrollY
      const diff = currentScrollY - lastScrollY.current

      if (Math.abs(diff) < threshold) {
        ticking.current = false
        return
      }

      setScrollDirection(diff > 0 ? 'down' : 'up')
      lastScrollY.current = currentScrollY
      ticking.current = false
    }

    function handleScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection)
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  return scrollDirection
}
