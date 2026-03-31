import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutz-Folgenabschätzung',
  description: 'DSFA gemäß Art. 35 DSGVO für die Demokrat-Plattform',
};

/**
 * Phase 198 -- Datenschutz-Folgenabschätzung (DSFA)
 * DSGVO Art. 35 documentation page.
 */
export default function DSFAPage() {
  return (
    <>
      <h1 id="dsfa">Datenschutz-Folgenabschätzung (DSFA)</h1>
      <p className="lead">Gemäß Art. 35 DSGVO &mdash; Stand: März 2026</p>

      <nav>
        <h2>Inhaltsverzeichnis</h2>
        <ol>
          <li>
            <a href="#beschreibung">
              Systematische Beschreibung der Verarbeitung
            </a>
          </li>
          <li>
            <a href="#notwendigkeit">
              Notwendigkeit und Verhältnismäßigkeit
            </a>
          </li>
          <li>
            <a href="#risiken">Risikobewertung</a>
          </li>
          <li>
            <a href="#massnahmen">Abhilfemaßnahmen</a>
          </li>
          <li>
            <a href="#ergebnis">Ergebnis</a>
          </li>
        </ol>
      </nav>

      <section id="beschreibung">
        <h2>1. Systematische Beschreibung der Verarbeitung</h2>

        <h3>1.1 Zweck der Verarbeitung</h3>
        <p>
          Demokrat ist eine digitale Demokratie-Plattform, die Bürgerinnen und
          Bürgern ermöglicht, zu Bundestag-Themen abzustimmen, Meinungen zu
          diskutieren und politische Teilhabe auszuüben.
        </p>

        <h3>1.2 Art der verarbeiteten Daten</h3>
        <ul>
          <li>
            <strong>Kontodaten:</strong> E-Mail-Adresse, Anzeigename, Profilbild
            (optional)
          </li>
          <li>
            <strong>Politische Meinungen (Art. 9 DSGVO):</strong>{' '}
            Abstimmungsergebnisse (Ja/Nein/Enthaltung) zu politischen Themen
          </li>
          <li>
            <strong>Standortdaten:</strong> Wahlkreis-Zuordnung (freiwillig,
            nicht GPS-basiert)
          </li>
          <li>
            <strong>Nutzungsdaten:</strong> Sitzungsdaten,
            Streak-Informationen, Punktestand
          </li>
          <li>
            <strong>Kommunikationsdaten:</strong> Kommentare, Bewertungen,
            Meldungen
          </li>
        </ul>

        <h3>1.3 Kategorien betroffener Personen</h3>
        <ul>
          <li>
            Registrierte Nutzerinnen und Nutzer (wahlberechtigte Bürger ab 16
            Jahren)
          </li>
        </ul>

        <h3>1.4 Empfänger der Daten</h3>
        <ul>
          <li>Supabase (Datenbankhosting, EU-Region)</li>
          <li>Vercel (Webhosting, Edge-Funktionen)</li>
          <li>Upstash (Redis-Cache, EU-Region)</li>
          <li>Sentry (Fehlertracking)</li>
          <li>
            OpenAI (KI-Zusammenfassungen, keine personenbezogenen Daten)
          </li>
        </ul>

        <h3>1.5 Speicherfristen</h3>
        <ul>
          <li>Kontodaten: Bis zur Kontolöschung</li>
          <li>
            Abstimmungen: Bis zur Kontolöschung (Hash-Chain bleibt
            anonymisiert erhalten)
          </li>
          <li>
            Kommentare: Bis zur Löschung durch Nutzer oder Moderation
          </li>
          <li>Audit-Logs: 2 Jahre</li>
          <li>Analytik-Daten: Aggregiert, nicht personenbezogen</li>
        </ul>
      </section>

      <section id="notwendigkeit">
        <h2>2. Notwendigkeit und Verhältnismäßigkeit</h2>

        <h3>2.1 Rechtsgrundlage</h3>
        <ul>
          <li>
            <strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung für
            Kontodaten
          </li>
          <li>
            <strong>Art. 6 Abs. 1 lit. b DSGVO:</strong>{' '}
            Vertragsdurchführung (Nutzungsbedingungen)
          </li>
          <li>
            <strong>Art. 9 Abs. 2 lit. a DSGVO:</strong> Ausdrückliche
            Einwilligung für politische Meinungsäußerungen
          </li>
        </ul>

        <h3>2.2 Datenminimierung</h3>
        <ul>
          <li>Keine Klarnamen-Pflicht</li>
          <li>Wahlkreis-Zuordnung freiwillig</li>
          <li>Minimale Pflichtfelder bei Registrierung</li>
          <li>
            Aggregierte Ergebnisse öffentlich, Einzelstimmen nur für den
            Nutzer selbst sichtbar
          </li>
        </ul>

        <h3>2.3 Verhältnismäßigkeit</h3>
        <p>
          Die Verarbeitung politischer Meinungen ist für den Zweck der
          demokratischen Teilhabe zwingend erforderlich. Ohne Abstimmungsdaten
          kann die Kernfunktion der Plattform nicht erbracht werden.
        </p>
      </section>

      <section id="risiken">
        <h2>3. Risikobewertung</h2>

        <table>
          <thead>
            <tr>
              <th>Risiko</th>
              <th>Eintrittswahrscheinlichkeit</th>
              <th>Schwere</th>
              <th>Risikostufe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Unbefugter Zugriff auf Abstimmungsdaten</td>
              <td>Niedrig</td>
              <td>Hoch</td>
              <td>Mittel</td>
            </tr>
            <tr>
              <td>Profiling politischer Meinungen</td>
              <td>Niedrig</td>
              <td>Sehr hoch</td>
              <td>Hoch</td>
            </tr>
            <tr>
              <td>Re-Identifizierung aggregierter Daten</td>
              <td>Sehr niedrig</td>
              <td>Hoch</td>
              <td>Niedrig</td>
            </tr>
            <tr>
              <td>Datenverlust</td>
              <td>Niedrig</td>
              <td>Mittel</td>
              <td>Niedrig</td>
            </tr>
            <tr>
              <td>Manipulation von Abstimmungen</td>
              <td>Niedrig</td>
              <td>Hoch</td>
              <td>Mittel</td>
            </tr>
            <tr>
              <td>Diskriminierung durch Meinungsäußerung</td>
              <td>Niedrig</td>
              <td>Hoch</td>
              <td>Mittel</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="massnahmen">
        <h2>4. Abhilfemaßnahmen</h2>

        <h3>4.1 Technische Maßnahmen</h3>
        <ul>
          <li>
            Row-Level Security (RLS) auf allen Tabellen &mdash; Nutzer sehen
            nur eigene Daten
          </li>
          <li>
            Hash-Chain für Abstimmungsintegrität (manipulationssicher)
          </li>
          <li>
            Verschlüsselung in Transit (TLS 1.3) und at Rest (AES-256)
          </li>
          <li>Content Security Policy (CSP) Headers</li>
          <li>Rate Limiting auf allen API-Endpunkten</li>
          <li>Audit-Logging aller Admin-Aktionen</li>
          <li>
            Automatische Kontolöschung mit kaskadierender Datenbereinigung
          </li>
        </ul>

        <h3>4.2 Organisatorische Maßnahmen</h3>
        <ul>
          <li>
            Privilege-Tier-System: Gestufter Zugang (Tier 0-4)
          </li>
          <li>Moderations-System mit Vier-Augen-Prinzip</li>
          <li>
            Transparenz-Seiten: Algorithmus, Punktesystem, Bridging-Score
            öffentlich dokumentiert
          </li>
          <li>
            Art. 9 Einwilligung vor erster Abstimmung mit verständlicher
            Erklärung
          </li>
          <li>Cookie-Banner mit Opt-in für Analytics</li>
          <li>
            Widerrufsrecht in Einstellungen jederzeit ausübbar
          </li>
        </ul>

        <h3>4.3 Maßnahmen gegen Hochrisiken</h3>
        <ul>
          <li>
            <strong>Profiling-Risiko:</strong> Keine öffentlichen
            Abstimmungshistorien. Bridging-Score anonymisiert. Kein Verkauf von
            Daten.
          </li>
          <li>
            <strong>Manipulations-Risiko:</strong> Kryptographische Hash-Chain.
            Wahl-Integritätsprüfung. Event-Sourcing.
          </li>
          <li>
            <strong>Diskriminierungs-Risiko:</strong> Pseudonyme Nutzung. Keine
            Arbeitgeber-Sichtbarkeit. Community-Regeln gegen Hetze.
          </li>
        </ul>
      </section>

      <section id="ergebnis">
        <h2>5. Ergebnis</h2>
        <p>
          Die Risiken der Datenverarbeitung werden durch die implementierten
          technischen und organisatorischen Maßnahmen auf ein vertretbares
          Niveau reduziert. Die Verarbeitung politischer Meinungen erfolgt
          ausschließlich mit ausdrücklicher Einwilligung (Art. 9 Abs. 2 lit. a
          DSGVO) und ist für den Plattformzweck erforderlich.
        </p>
        <p>
          Die DSFA wird bei wesentlichen Änderungen der Verarbeitung
          aktualisiert, mindestens jedoch jährlich überprüft.
        </p>

        <h3>5.1 Verantwortlich</h3>
        <p>
          [Name des Verantwortlichen]
          <br />
          [Kontaktdaten]
          <br />
          Datum der Erstellung: März 2026
        </p>

        <h3>5.2 Nächste Überprüfung</h3>
        <p>
          März 2027 oder bei wesentlichen Änderungen der Datenverarbeitung
        </p>
      </section>
    </>
  );
}
