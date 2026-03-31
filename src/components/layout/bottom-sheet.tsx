'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

type SnapPoint = 'sm' | 'md' | 'lg' | 'full'

const snapPointHeights: Record<SnapPoint, string> = {
  sm: 'max-h-[40vh]',
  md: 'max-h-[60vh]',
  lg: 'max-h-[80vh]',
  full: 'max-h-[95vh]',
}

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  snapPoints?: SnapPoint[]
  defaultSnap?: SnapPoint
  showDragHandle?: boolean
  children: React.ReactNode
}

/**
 * Reusable bottom sheet component.
 * On mobile: renders as a bottom sheet with drag handle and rounded corners.
 * On desktop (md+): renders as a right-side panel.
 */
function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  snapPoints,
  defaultSnap = 'md',
  showDragHandle = true,
  children,
}: BottomSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [currentSnap, setCurrentSnap] = React.useState<SnapPoint>(defaultSnap)

  // Determine height class based on current snap point
  const heightClass = snapPointHeights[currentSnap]

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full max-w-md overflow-y-auto"
        >
          {(title || description) && (
            <SheetHeader>
              {title && <SheetTitle>{title}</SheetTitle>}
              {description && (
                <SheetDescription>{description}</SheetDescription>
              )}
            </SheetHeader>
          )}
          <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          'rounded-t-2xl',
          heightClass,
          'overflow-hidden flex flex-col',
        )}
      >
        {/* Drag handle */}
        {showDragHandle && (
          <div className="flex justify-center pb-2 pt-3">
            <div
              aria-hidden="true"
              className="h-1 w-8 rounded-full bg-muted-foreground/30"
            />
          </div>
        )}

        {(title || description) && (
          <SheetHeader>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>
        )}

        {/* Snap point indicators (rendered only if multiple snap points) */}
        {snapPoints && snapPoints.length > 1 && (
          <div
            className="flex justify-center gap-1.5 py-1"
            role="radiogroup"
            aria-label="Größe der Ansicht"
          >
            {snapPoints.map((point) => (
              <button
                key={point}
                type="button"
                role="radio"
                aria-checked={currentSnap === point}
                aria-label={`Größe: ${point}`}
                onClick={() => setCurrentSnap(point)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  currentSnap === point
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30',
                )}
              />
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

export { BottomSheet }
export type { BottomSheetProps, SnapPoint }
