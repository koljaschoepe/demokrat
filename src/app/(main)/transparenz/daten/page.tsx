import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DatenverarbeitungPage() {
  return (
    <div>
      <Link
        href="/transparenz"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground no-underline hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Zurück zur Übersicht
      </Link>

      <h1>Datenverarbeitung</h1>

      <p>
        Transparenz beginnt bei uns mit einer ehrlichen Darstellung, welche Daten
        wir erheben und wie wir mit ihnen umgehen.
      </p>

      <h2>Welche Daten werden erhoben?</h2>

      <h3>Pflichtdaten bei Registrierung</h3>
      <ul>
        <li>E-Mail-Adresse (zur Anmeldung und Kommunikation)</li>
        <li>Anzeigename (öffentlich sichtbar)</li>
        <li>Wahlkreis (für die regionale Zuordnung von Themen)</li>
      </ul>

      <h3>Nutzungsdaten</h3>
      <ul>
        <li>Abstimmungen (anonymisiert gespeichert, nicht mit dem Profil verknüpft)</li>
        <li>Reputationspunkte und Privilegien-Stufe</li>
        <li>Erstellte Beiträge und Kommentare</li>
      </ul>

      <h3>Technische Daten</h3>
      <ul>
        <li>IP-Adresse (wird nach 7 Tagen anonymisiert)</li>
        <li>Geräte- und Browserinformationen (für Fehleranalyse)</li>
        <li>Zugriffszeiten (für Sicherheitszwecke)</li>
      </ul>

      <h2>Warum erheben wir diese Daten?</h2>
      <p>
        Jede Datenerhebung dient einem konkreten Zweck. Wir speichern keine Daten
        &ldquo;auf Vorrat&rdquo;. Die Rechtsgrundlage ist jeweils die Vertragserfüllung
        (Art. 6 Abs. 1 lit. b DSGVO) oder unser berechtigtes Interesse an der
        Plattformsicherheit (Art. 6 Abs. 1 lit. f DSGVO).
      </p>

      <h2>Speicherdauer</h2>
      <table>
        <thead>
          <tr>
            <th>Datenart</th>
            <th>Speicherdauer</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Kontodaten</td>
            <td>Bis zur Kontolöschung</td>
          </tr>
          <tr>
            <td>Abstimmungen</td>
            <td>Dauerhaft (anonymisiert)</td>
          </tr>
          <tr>
            <td>IP-Adressen</td>
            <td>7 Tage</td>
          </tr>
          <tr>
            <td>Fehlerprotokolle</td>
            <td>30 Tage</td>
          </tr>
          <tr>
            <td>Gelöschte Beiträge</td>
            <td>30 Tage (für Moderation)</td>
          </tr>
        </tbody>
      </table>

      <h2>Drittanbieter</h2>
      <p>Folgende Dienste werden für den Betrieb der Plattform eingesetzt:</p>

      <table>
        <thead>
          <tr>
            <th>Dienst</th>
            <th>Zweck</th>
            <th>Standort</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Supabase</td>
            <td>Datenbank und Authentifizierung</td>
            <td>EU (Frankfurt)</td>
          </tr>
          <tr>
            <td>Vercel</td>
            <td>Hosting und Auslieferung</td>
            <td>EU (Frankfurt)</td>
          </tr>
          <tr>
            <td>Sentry</td>
            <td>Fehlerüberwachung</td>
            <td>EU</td>
          </tr>
          <tr>
            <td>Meilisearch</td>
            <td>Volltextsuche</td>
            <td>EU</td>
          </tr>
        </tbody>
      </table>

      <h2>Ihre Rechte (DSGVO)</h2>
      <p>Als Nutzerin oder Nutzer haben Sie folgende Rechte:</p>
      <ul>
        <li><strong>Auskunftsrecht (Art. 15):</strong> Sie können jederzeit erfahren, welche Daten über Sie gespeichert sind.</li>
        <li><strong>Berichtigungsrecht (Art. 16):</strong> Unrichtige Daten können Sie jederzeit korrigieren lassen.</li>
        <li><strong>Löschungsrecht (Art. 17):</strong> Sie können die Löschung Ihrer Daten verlangen.</li>
        <li><strong>Datenportabilität (Art. 20):</strong> Sie können Ihre Daten in einem gängigen Format exportieren.</li>
        <li><strong>Widerspruchsrecht (Art. 21):</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.</li>
      </ul>
      <p>
        Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter{' '}
        <a href="mailto:datenschutz@demokrat.app">datenschutz@demokrat.app</a>.
      </p>
    </div>
  );
}
