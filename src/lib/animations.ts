/**
 * Animation presets as CSS class strings.
 * All animations respect prefers-reduced-motion via Tailwind's motion-reduce: modifier.
 */

/**
 * Page transition: slide-in from right, fade in.
 * Apply on page mount.
 */
export const pageTransition =
  'animate-[slideInRight_300ms_ease-out] motion-reduce:animate-none';

/**
 * Fade up: fade in + translate from below.
 * Good for cards appearing in a list.
 */
export const fadeUp =
  'animate-[fadeUp_300ms_ease-out] motion-reduce:animate-none';

/**
 * Scale in: scale from 0.95 to 1 with fade.
 * Good for modals/overlays.
 */
export const scaleIn =
  'animate-[scaleIn_200ms_ease-out] motion-reduce:animate-none';

/**
 * Slide up from bottom: for bottom sheets and drawers.
 */
export const slideUp =
  'animate-[slideUp_300ms_ease-out] motion-reduce:animate-none';

/**
 * CSS keyframes to be included in global styles.
 * These are defined as a string to be injected or referenced in Tailwind config.
 */
export const animationKeyframes = `
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
` as const;
