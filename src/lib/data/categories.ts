export const CATEGORIES = [
  { id: 'umwelt', label: 'Umwelt & Klima', icon: 'Leaf' },
  { id: 'wirtschaft', label: 'Wirtschaft', icon: 'TrendingUp' },
  { id: 'bildung', label: 'Bildung', icon: 'BookOpen' },
  { id: 'gesundheit', label: 'Gesundheit', icon: 'Heart' },
  { id: 'digitales', label: 'Digitales', icon: 'Laptop' },
  { id: 'soziales', label: 'Soziales', icon: 'Users' },
  { id: 'sicherheit', label: 'Sicherheit', icon: 'Shield' },
  { id: 'finanzen', label: 'Finanzen', icon: 'Coins' },
  { id: 'wohnen', label: 'Wohnen', icon: 'Home' },
  { id: 'europa', label: 'Europa', icon: 'Globe' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
