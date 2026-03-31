'use client';

import { BottomSheet } from '@/components/layout/bottom-sheet';
import { WahlkreisDashboard } from '@/components/map/wahlkreis-dashboard';

interface MapBottomSheetProps {
  wahlkreisId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Phase 158 — Map Bottom Sheet
 *
 * Wraps the WahlkreisDashboard in a BottomSheet component.
 * Mobile: bottom sheet with snap points.
 * Desktop: right side panel.
 *
 * Note: Wahlkreis name/bundesland are fetched server-side inside
 * WahlkreisDashboard via the tRPC query, so we pass a generic title
 * and let the dashboard header show the actual name.
 */
export function MapBottomSheet({ wahlkreisId, open, onOpenChange }: MapBottomSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={wahlkreisId ? `Wahlkreis ${wahlkreisId}` : 'Wahlkreis'}
      snapPoints={['sm', 'md', 'lg']}
      defaultSnap="md"
      showDragHandle
    >
      {wahlkreisId && (
        <WahlkreisDashboard wahlkreisId={wahlkreisId} />
      )}
    </BottomSheet>
  );
}
