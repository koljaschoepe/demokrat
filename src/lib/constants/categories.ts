/**
 * Phase 138 -- Topic-Kategorien-Konstanten
 *
 * Zentrale Definition der 10 Themen-Kategorien mit deutschem Label
 * und zugehoerigem Lucide-Icon-Namen.
 */

export const TOPIC_CATEGORIES = [
  { id: 'umwelt-klima', label: 'Umwelt & Klima', icon: 'Leaf' },
  { id: 'wirtschaft', label: 'Wirtschaft', icon: 'TrendingUp' },
  { id: 'bildung', label: 'Bildung', icon: 'GraduationCap' },
  { id: 'gesundheit', label: 'Gesundheit', icon: 'Heart' },
  { id: 'digitales', label: 'Digitales', icon: 'Smartphone' },
  { id: 'soziales', label: 'Soziales', icon: 'Users' },
  { id: 'sicherheit', label: 'Sicherheit', icon: 'Shield' },
  { id: 'finanzen', label: 'Finanzen', icon: 'Banknote' },
  { id: 'wohnen', label: 'Wohnen', icon: 'Home' },
  { id: 'europa', label: 'Europa', icon: 'Globe' },
] as const;

/** Typ einer einzelnen Kategorie. */
export type TopicCategory = (typeof TOPIC_CATEGORIES)[number];

/** Array aller Kategorie-IDs (Slugs). */
export const CATEGORY_IDS = TOPIC_CATEGORIES.map((c) => c.id) as unknown as readonly [
  'umwelt-klima',
  'wirtschaft',
  'bildung',
  'gesundheit',
  'digitales',
  'soziales',
  'sicherheit',
  'finanzen',
  'wohnen',
  'europa',
];

/** Gibt das deutsche Label fuer eine Kategorie-ID zurueck, oder undefined. */
export function getCategoryLabel(id: string): string | undefined {
  return TOPIC_CATEGORIES.find((c) => c.id === id)?.label;
}
