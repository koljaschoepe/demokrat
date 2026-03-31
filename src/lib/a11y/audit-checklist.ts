/**
 * Phase 193 -- BITV 2.0 Audit Checklist
 *
 * Based on BITV 2.0 (Barrierefreie-Informationstechnik-Verordnung),
 * the German implementation of WCAG 2.1 AA.
 *
 * Used by the admin panel to track compliance status.
 */

export type ComplianceStatus = 'pass' | 'partial' | 'untested';

export interface BitvChecklistItem {
  /** BITV 2.0 / WCAG criterion ID (e.g. "1.1.1") */
  readonly id: string;
  /** German requirement description */
  readonly requirement: string;
  /** Current compliance status */
  readonly status: ComplianceStatus;
  /** Optional implementation notes */
  readonly notes?: string;
}

export const BITV_2_CHECKLIST: readonly BitvChecklistItem[] = [
  // ---------------------------------------------------------------------------
  // 1. Wahrnehmbar (Perceivable)
  // ---------------------------------------------------------------------------
  {
    id: '1.1.1',
    requirement: 'Nicht-Text-Inhalte: Alle Nicht-Text-Inhalte haben eine Textalternative',
    status: 'pass',
    notes: 'Alle img-Elemente haben alt-Attribute. Dekorative Bilder nutzen role="presentation".',
  },
  {
    id: '1.2.1',
    requirement: 'Aufgezeichnete Audio- und Videoinhalte: Alternativen bereitgestellt',
    status: 'untested',
    notes: 'Plattform verwendet aktuell keine Audio-/Video-Inhalte.',
  },
  {
    id: '1.2.2',
    requirement: 'Untertitel (aufgezeichnet): Untertitel für aufgezeichnete Audioinhalte',
    status: 'untested',
    notes: 'Plattform verwendet aktuell keine Audio-/Video-Inhalte.',
  },
  {
    id: '1.2.3',
    requirement: 'Audiodeskription oder Medienalternative (aufgezeichnet)',
    status: 'untested',
    notes: 'Plattform verwendet aktuell keine Audio-/Video-Inhalte.',
  },
  {
    id: '1.3.1',
    requirement: 'Informationen und Beziehungen: Struktur programmatisch bestimmbar',
    status: 'pass',
    notes: 'Semantisches HTML, ARIA-Landmarks, korrekte Überschriftenhierarchie.',
  },
  {
    id: '1.3.2',
    requirement: 'Bedeutungstragende Reihenfolge: Lesereihenfolge programmatisch bestimmbar',
    status: 'pass',
    notes: 'DOM-Reihenfolge entspricht visueller Reihenfolge. Flexbox order nicht missbraucht.',
  },
  {
    id: '1.3.3',
    requirement: 'Sensorische Eigenschaften: Anweisungen nicht nur auf Form/Größe/Lage basierend',
    status: 'pass',
    notes: 'Anweisungen verwenden Text zusätzlich zu visuellen Hinweisen.',
  },
  {
    id: '1.3.4',
    requirement: 'Ausrichtung: Inhalt nicht auf eine Bildschirmausrichtung beschränkt',
    status: 'pass',
    notes: 'Responsive Design funktioniert in Portrait und Landscape.',
  },
  {
    id: '1.3.5',
    requirement: 'Eingabezweck bestimmen: Zweck von Eingabefeldern programmatisch bestimmbar',
    status: 'partial',
    notes: 'autocomplete-Attribute bei Login/Registrierung gesetzt. Weitere Formulare prüfen.',
  },
  {
    id: '1.4.1',
    requirement: 'Verwendung von Farbe: Farbe nicht als einziges visuelles Mittel',
    status: 'pass',
    notes: 'Badges, Icons und Text ergänzen farbliche Kodierung.',
  },
  {
    id: '1.4.2',
    requirement: 'Audio-Steuerung: Automatisch abspielende Audioinhalte steuerbar',
    status: 'untested',
    notes: 'Kein automatisch abspielendes Audio vorhanden.',
  },
  {
    id: '1.4.3',
    requirement: 'Kontrast (Minimum): Kontrastverhältnis mindestens 4,5:1',
    status: 'pass',
    notes: 'Indigo-auf-Weiß und Dark-Mode-Farben erfüllen AA-Kontrast.',
  },
  {
    id: '1.4.4',
    requirement: 'Textgrößenanpassung: Text bis 200% vergrößerbar ohne Informationsverlust',
    status: 'pass',
    notes: 'Tailwind rem-basierte Größen. Layout bricht nicht bei 200% Zoom.',
  },
  {
    id: '1.4.5',
    requirement: 'Bilder von Text: Text statt Bilder von Text verwendet',
    status: 'pass',
    notes: 'Alle Texte als echte Schrift, keine Textbilder.',
  },
  {
    id: '1.4.10',
    requirement: 'Reflow: Inhalt bei 320 CSS-Pixel Breite ohne horizontales Scrollen',
    status: 'pass',
    notes: 'Mobile-first Design mit Tailwind, getestet auf 320px.',
  },
  {
    id: '1.4.11',
    requirement: 'Nicht-Text-Kontrast: UI-Komponenten und Grafiken min. 3:1 Kontrast',
    status: 'partial',
    notes: 'Meiste Komponenten erfüllen 3:1. Einige dekorative Elemente prüfen.',
  },
  {
    id: '1.4.12',
    requirement: 'Textabstand: Anpassbarer Textabstand ohne Informationsverlust',
    status: 'pass',
    notes: 'Flexible Layouts brechen nicht bei angepassten Textabständen.',
  },
  {
    id: '1.4.13',
    requirement: 'Eingeblendete Inhalte: Hover/Fokus-Inhalte bedienbar und verwerfbar',
    status: 'pass',
    notes: 'Tooltips sind mit Escape schließbar und bleiben bei Hover bestehen.',
  },

  // ---------------------------------------------------------------------------
  // 2. Bedienbar (Operable)
  // ---------------------------------------------------------------------------
  {
    id: '2.1.1',
    requirement: 'Tastatur: Alle Funktionen per Tastatur bedienbar',
    status: 'pass',
    notes: 'Skip-Navigation, Tab-Reihenfolge, Enter/Space für Buttons.',
  },
  {
    id: '2.1.2',
    requirement: 'Keine Tastaturfalle: Fokus kann per Tastatur bewegt werden',
    status: 'pass',
    notes: 'Modale Dialoge haben Fokus-Trap mit Escape zum Schließen.',
  },
  {
    id: '2.1.4',
    requirement: 'Zeichenbasierte Tastenkombinationen: Einzelzeichentasten deaktivierbar',
    status: 'untested',
    notes: 'Keine Einzelzeichen-Shortcuts implementiert.',
  },
  {
    id: '2.2.1',
    requirement: 'Zeitvorgaben anpassbar: Zeitlimits können verlängert werden',
    status: 'untested',
    notes: 'Session-Timeout durch Supabase gesteuert. Noch keine Warnmeldung.',
  },
  {
    id: '2.2.2',
    requirement: 'Pausieren, Stoppen, Ausblenden: Bewegte Inhalte steuerbar',
    status: 'pass',
    notes: 'prefers-reduced-motion wird respektiert. Animationen deaktivierbar.',
  },
  {
    id: '2.3.1',
    requirement: 'Drei Blitze oder unter Schwellenwert: Keine blinkenden Inhalte',
    status: 'pass',
    notes: 'Keine blinkenden oder blitzenden Inhalte vorhanden.',
  },
  {
    id: '2.4.1',
    requirement: 'Blöcke umgehen: Mechanismus zum Überspringen von Inhaltsabschnitten',
    status: 'pass',
    notes: 'SkipNavigation-Komponente mit "Zum Hauptinhalt springen" Link.',
  },
  {
    id: '2.4.2',
    requirement: 'Seite mit Titel versehen: Aussagekräftige Seitentitel',
    status: 'pass',
    notes: 'Dynamische Titel via Next.js Metadata API mit Template-Pattern.',
  },
  {
    id: '2.4.3',
    requirement: 'Fokusreihenfolge: Sinnvolle Tab-Reihenfolge',
    status: 'pass',
    notes: 'Natürliche DOM-Reihenfolge, keine positiven tabindex-Werte.',
  },
  {
    id: '2.4.4',
    requirement: 'Linkzweck (im Kontext): Zweck jedes Links bestimmbar',
    status: 'partial',
    notes: 'Meiste Links haben beschreibenden Text. aria-label bei Icon-Only-Buttons prüfen.',
  },
  {
    id: '2.4.5',
    requirement: 'Verschiedene Methoden: Mehrere Wege zum Auffinden von Seiten',
    status: 'pass',
    notes: 'Navigation, Suche und Sitemap vorhanden.',
  },
  {
    id: '2.4.6',
    requirement: 'Überschriften und Labels: Beschreibende Überschriften und Labels',
    status: 'pass',
    notes: 'Alle Formulare haben Labels. Überschriften beschreiben den Inhalt.',
  },
  {
    id: '2.4.7',
    requirement: 'Fokus sichtbar: Tastaturfokus ist sichtbar',
    status: 'pass',
    notes: 'Focus-visible Stile via Tailwind. Indigo-Fokusring auf allen interaktiven Elementen.',
  },
  {
    id: '2.5.1',
    requirement: 'Zeigergesten: Mehrzeigeroperationen auch mit einfachen Gesten ausführbar',
    status: 'pass',
    notes: 'Karte hat Zoom-Buttons als Alternative zu Pinch-to-Zoom.',
  },
  {
    id: '2.5.2',
    requirement: 'Zeigereingabe abbrechen: Down-Events nicht als alleiniger Trigger',
    status: 'pass',
    notes: 'Standard onClick/onPointerUp Events verwendet.',
  },
  {
    id: '2.5.3',
    requirement: 'Beschriftung im Namen: Sichtbarer Text im zugänglichen Namen enthalten',
    status: 'pass',
    notes: 'aria-label entspricht sichtbarem Button/Link-Text.',
  },
  {
    id: '2.5.4',
    requirement: 'Bewegungsaktivierung: Bewegungseingaben auch alternativ bedienbar',
    status: 'untested',
    notes: 'Keine bewegungsgesteuerten Features implementiert.',
  },

  // ---------------------------------------------------------------------------
  // 3. Verständlich (Understandable)
  // ---------------------------------------------------------------------------
  {
    id: '3.1.1',
    requirement: 'Sprache der Seite: Standardsprache programmatisch bestimmbar',
    status: 'pass',
    notes: 'html lang="de" wird via next-intl gesetzt.',
  },
  {
    id: '3.1.2',
    requirement: 'Sprache von Teilen: Sprachwechsel programmatisch bestimmbar',
    status: 'partial',
    notes: 'Hauptinhalt auf Deutsch. Fremdsprachliche Fachbegriffe nicht immer markiert.',
  },
  {
    id: '3.2.1',
    requirement: 'Bei Fokus: Kein unerwarteter Kontextwechsel bei Fokuserhalt',
    status: 'pass',
    notes: 'Kein automatischer Kontextwechsel bei Fokus.',
  },
  {
    id: '3.2.2',
    requirement: 'Bei Eingabe: Kein unerwarteter Kontextwechsel bei Eingabe',
    status: 'pass',
    notes: 'Formulare werden nur per Submit-Button abgesendet.',
  },
  {
    id: '3.2.3',
    requirement: 'Konsistente Navigation: Navigation auf wiederholten Seiten konsistent',
    status: 'pass',
    notes: 'Einheitliche Bottom-Navigation und Header auf allen Seiten.',
  },
  {
    id: '3.2.4',
    requirement: 'Konsistente Kennzeichnung: Gleiche Funktionen gleich gekennzeichnet',
    status: 'pass',
    notes: 'Design-System mit einheitlichen Komponenten.',
  },
  {
    id: '3.3.1',
    requirement: 'Fehlererkennung: Eingabefehler automatisch erkannt und beschrieben',
    status: 'pass',
    notes: 'Formularvalidierung mit Fehlermeldungen unter den Feldern.',
  },
  {
    id: '3.3.2',
    requirement: 'Labels oder Anweisungen: Labels und Anweisungen bei Eingaben vorhanden',
    status: 'pass',
    notes: 'Alle Formularfelder haben sichtbare Labels.',
  },
  {
    id: '3.3.3',
    requirement: 'Fehlerempfehlung: Korrekturvorschläge bei erkannten Fehlern',
    status: 'partial',
    notes: 'Basis-Fehlermeldungen vorhanden. Spezifische Korrekturhinweise erweitern.',
  },
  {
    id: '3.3.4',
    requirement: 'Fehlervermeidung (rechtlich, finanziell, Daten): Reversibilität gegeben',
    status: 'pass',
    notes: 'Abstimmungen haben Bestätigung. Kontolöschung hat doppelte Bestätigung.',
  },

  // ---------------------------------------------------------------------------
  // 4. Robust
  // ---------------------------------------------------------------------------
  {
    id: '4.1.1',
    requirement: 'Syntaxanalyse: Keine groben HTML-Fehler',
    status: 'pass',
    notes: 'React/JSX erzeugt valides HTML. Linting aktiv.',
  },
  {
    id: '4.1.2',
    requirement: 'Name, Rolle, Wert: Alle UI-Komponenten haben zugängliche Namen und Rollen',
    status: 'pass',
    notes: 'ARIA-Attribute auf Custom-Widgets. Radix UI Primitives für korrekte Rollen.',
  },
  {
    id: '4.1.3',
    requirement: 'Statusmeldungen: Statusmeldungen programmatisch bestimmbar',
    status: 'partial',
    notes: 'Toast-Benachrichtigungen mit role="status". Live-Regionen teilweise implementiert.',
  },
] as const;

/** Convenience type for the full checklist */
export type BitvChecklist = typeof BITV_2_CHECKLIST;
