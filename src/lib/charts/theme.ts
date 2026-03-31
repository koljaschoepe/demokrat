/**
 * Chart color theme for the Demokrat platform.
 * Vote choices use Indigo + gray shades (no green/red) for accessibility.
 * Faction colors follow established German parliamentary colors.
 */

export const VOTE_CHART_COLORS: Record<string, string> = {
  ja: '#4f46e5', // indigo-600
  nein: '#9ca3af', // gray-400
  enthaltung: '#d1d5db', // gray-300
  nicht_abgegeben: '#e5e7eb', // gray-200
};

/** German display labels for vote choices */
export const VOTE_LABELS: Record<string, string> = {
  ja: 'Ja',
  nein: 'Nein',
  enthaltung: 'Enthaltung',
  nicht_abgegeben: 'Nicht abgegeben',
};

export const FACTION_COLORS: Record<string, string> = {
  SPD: '#e3000f',
  'CDU/CSU': '#000000',
  GRÜNE: '#1aa037',
  FDP: '#ffed00',
  AfD: '#009ee0',
  'DIE LINKE': '#be3075',
  BSW: '#7b2d8b',
  fraktionslos: '#6b7280',
};

const deFormatter = new Intl.NumberFormat('de-DE');
const percentFormatter = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/** Format a 0-100 percentage value for recharts tooltips/labels */
export function formatPercent(value: number): string {
  return percentFormatter.format(value / 100);
}

/** Format a count value with German locale (dot as thousands separator) */
export function formatCount(value: number): string {
  return deFormatter.format(value);
}
