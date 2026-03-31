'use client';

import { useEffect, useState, useRef } from 'react';
import { MAP_CONFIG } from '@/lib/map/config';

interface TooltipData {
  name: string;
  number: number;
  x: number;
  y: number;
}

interface WahlkreisTooltipProps {
  map: unknown;
}

/**
 * Phase 157 — Desktop Hover Tooltip
 *
 * Shows wahlkreis name + number on hover over the choropleth layer.
 * Only renders on non-touch devices.
 */
export function WahlkreisTooltip({ map }: WahlkreisTooltipProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const isTouchRef = useRef(false);

  useEffect(() => {
    // Detect touch device
    isTouchRef.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (!m || isTouchRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseMove = (e: any) => {
      if (e.features && e.features.length > 0) {
        const props = e.features[0].properties;
        setTooltip({
          name: props.WKR_NAME,
          number: props.WKR_NR,
          x: e.point.x,
          y: e.point.y,
        });
      }
    };

    const handleMouseLeave = () => {
      setTooltip(null);
    };

    m.on('mousemove', MAP_CONFIG.fillLayerId, handleMouseMove);
    m.on('mouseleave', MAP_CONFIG.fillLayerId, handleMouseLeave);

    return () => {
      m.off('mousemove', MAP_CONFIG.fillLayerId, handleMouseMove);
      m.off('mouseleave', MAP_CONFIG.fillLayerId, handleMouseLeave);
    };
  }, [map]);

  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none absolute z-20 rounded-lg border bg-card px-3 py-2 text-sm shadow-lg"
      style={{
        left: tooltip.x + 12,
        top: tooltip.y - 40,
        transform: 'translateX(-50%)',
      }}
    >
      <p className="font-medium text-card-foreground">{tooltip.name}</p>
      <p className="text-xs text-muted-foreground">Wahlkreis {tooltip.number}</p>
    </div>
  );
}
