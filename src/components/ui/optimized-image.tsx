import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * Container-type-based responsive sizes.
 * These map common UI patterns to appropriate `sizes` attributes
 * so the browser can pick the optimal resolution image.
 */
const SIZE_PRESETS = {
  /** Small avatar (32-48px) */
  avatar: '48px',
  /** Card thumbnail or preview image */
  card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  /** Hero / banner images spanning full width */
  hero: '100vw',
  /** Full-width content images */
  full: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
} as const;

type SizePreset = keyof typeof SIZE_PRESETS;

interface OptimizedImageProps extends Omit<ImageProps, 'sizes'> {
  /**
   * Predefined size preset. Determines the `sizes` attribute.
   * Use `hero` for above-the-fold images (sets priority + eager loading).
   * @default 'card'
   */
  sizePreset?: SizePreset;
  /**
   * Custom sizes string. Overrides `sizePreset` when provided.
   */
  sizes?: string;
  /**
   * Provide a blurDataURL to show a blur placeholder while loading.
   * When true, uses a generic low-res placeholder.
   */
  blurPlaceholder?: boolean;
}

/**
 * Phase 191 -- Optimized Image wrapper around next/image.
 *
 * Provides sensible defaults for the Demokrat platform:
 * - Quality 80 (good balance of size/quality)
 * - Lazy loading by default, eager for hero images
 * - Responsive sizes based on container type
 * - Blur placeholder support
 *
 * Usage:
 *   <OptimizedImage src="/img/hero.jpg" alt="..." sizePreset="hero" width={1200} height={600} />
 *   <OptimizedImage src={avatarUrl} alt="..." sizePreset="avatar" width={48} height={48} />
 */
export function OptimizedImage({
  sizePreset = 'card',
  sizes: customSizes,
  blurPlaceholder = false,
  quality = 80,
  loading,
  priority,
  className,
  alt,
  ...rest
}: OptimizedImageProps) {
  // Hero images should be loaded eagerly (above the fold)
  const isHero = sizePreset === 'hero';
  const resolvedPriority = priority ?? isHero;
  const resolvedLoading = loading ?? (isHero ? 'eager' : 'lazy');

  const resolvedSizes = customSizes ?? SIZE_PRESETS[sizePreset];

  const placeholderProps: Partial<ImageProps> = blurPlaceholder
    ? {
        placeholder: 'blur' as const,
        blurDataURL:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlYiIvPjwvc3ZnPg==',
      }
    : {};

  return (
    <Image
      alt={alt}
      quality={quality}
      loading={resolvedLoading}
      priority={resolvedPriority}
      sizes={resolvedSizes}
      className={cn(
        sizePreset === 'avatar' && 'rounded-full object-cover',
        className,
      )}
      {...placeholderProps}
      {...rest}
    />
  );
}
