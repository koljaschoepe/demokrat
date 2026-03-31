import type { Metadata } from 'next';
import { AlgorithmusContent } from './algorithmus-content';

export const metadata: Metadata = {
  title: 'So funktioniert der Feed-Algorithmus \u2014 Demokrat',
  description:
    'Demokrat setzt auf vollständige Transparenz: Erfahre genau, wie unser Feed-Algorithmus funktioniert, welche Faktoren Themen nach oben bringen und was wir bewusst nicht tun.',
  openGraph: {
    title: 'So funktioniert der Feed-Algorithmus \u2014 Demokrat',
    description:
      'Vollständige Transparenz über unseren Feed-Algorithmus. Keine Filterblasen, kein Engagement-Baiting, keine bezahlte Platzierung.',
  },
};

export default function AlgorithmusPage() {
  return <AlgorithmusContent />;
}
