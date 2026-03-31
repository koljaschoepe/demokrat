import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung',
  description:
    'Informationen zum Umgang mit Ihren personenbezogenen Daten auf der Demokrat-Plattform.',
};

export default function DatenschutzPage() {
  return (
    <div>
      <h1 id="datenschutz">Datenschutzerklärung</h1>

      <p>
        Wir freuen uns über Ihr Interesse an unserer Plattform. Der Schutz Ihrer
        personenbezogenen Daten ist uns ein wichtiges Anliegen. Nachfolgend informieren
        wir Sie ausführlich über den Umgang mit Ihren Daten.
      </p>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          1. Verantwortlicher
        </summary>
        <div className="mt-2 pl-4">
          <p>
            Verantwortlich für die Datenverarbeitung auf dieser Plattform ist:
          </p>
          <p>
            Demokrat UG (haftungsbeschränkt)
            <br />
            Musterstraße 42
            <br />
            10115 Berlin
            <br />
            E-Mail:{' '}
            <a href="mailto:datenschutz@demokrat.app">datenschutz@demokrat.app</a>
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          2. Datenerfassung auf unserer Plattform
        </summary>
        <div className="mt-2 pl-4">
          <h3 id="daten-automatisch">a) Automatisch erfasste Daten</h3>
          <p>
            Beim Besuch unserer Plattform werden automatisch technische Daten erfasst
            (Server-Logfiles). Diese Daten umfassen:
          </p>
          <ul>
            <li>IP-Adresse (wird nach 7 Tagen anonymisiert)</li>
            <li>Datum und Uhrzeit der Anfrage</li>
            <li>Zeitzonendifferenz zur Greenwich Mean Time (GMT)</li>
            <li>Inhalt der Anforderung (konkrete Seite)</li>
            <li>Zugriffsstatus / HTTP-Statuscode</li>
            <li>Übertragene Datenmenge</li>
            <li>Browsertyp und -version</li>
            <li>Betriebssystem</li>
          </ul>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
            Interesse liegt in der Sicherstellung eines störungsfreien Betriebs.
          </p>

          <h3 id="daten-registrierung">b) Bei Registrierung erfasste Daten</h3>
          <p>Bei der Erstellung eines Kontos erheben wir:</p>
          <ul>
            <li>E-Mail-Adresse</li>
            <li>Anzeigename</li>
            <li>Wahlkreis</li>
          </ul>
          <p>
            Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>

          <h3 id="daten-abstimmung">c) Abstimmungsdaten</h3>
          <p>
            Ihre Stimmen werden anonymisiert gespeichert. Nach der Abgabe einer Stimme
            wird die Verknüpfung zwischen Ihrem Benutzerkonto und der konkreten Stimme
            aufgelöst. Es ist technisch nicht möglich, nachträglich festzustellen, wie
            Sie abgestimmt haben.
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          3. Cookies
        </summary>
        <div className="mt-2 pl-4">
          <p>
            Unsere Plattform verwendet ausschließlich technisch notwendige Cookies:
          </p>
          <ul>
            <li>
              <strong>Sitzungs-Cookie:</strong> Für die Authentifizierung und
              Aufrechterhaltung Ihrer Anmeldung. Wird beim Schließen des Browsers
              gelöscht.
            </li>
            <li>
              <strong>Cookie-Einwilligungs-Cookie:</strong> Speichert Ihre
              Cookie-Präferenz. Gültigkeitsdauer: 1 Jahr.
            </li>
          </ul>
          <p>
            Wir setzen keine Tracking-Cookies, Marketing-Cookies oder Cookies von
            Drittanbietern zu Werbezwecken ein.
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          4. Analyse-Tools
        </summary>
        <div className="mt-2 pl-4">
          <p>
            Wir verwenden Sentry zur Fehlererkennung und -behebung. Sentry erfasst
            technische Informationen über auftretende Fehler, darunter:
          </p>
          <ul>
            <li>Fehlermeldungen und Stack-Traces</li>
            <li>Browsertyp und -version</li>
            <li>Betriebssystem</li>
            <li>Anonymisierte Nutzer-ID</li>
          </ul>
          <p>
            Sentry wird auf EU-Servern betrieben. Die Datenverarbeitung erfolgt
            auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
            an einem fehlerfreien Betrieb).
          </p>
          <p>
            Wir verwenden keine Dienste wie Google Analytics, Facebook Pixel oder
            vergleichbare Tracking-Tools.
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          5. Drittanbieter und Auftragsverarbeiter
        </summary>
        <div className="mt-2 pl-4">
          <p>Folgende Drittanbieter verarbeiten in unserem Auftrag Daten:</p>
          <ul>
            <li>
              <strong>Supabase (EU):</strong> Datenbank, Authentifizierung und
              Dateispeicherung
            </li>
            <li>
              <strong>Vercel (EU):</strong> Hosting und Content Delivery
            </li>
            <li>
              <strong>Sentry (EU):</strong> Fehlerüberwachung
            </li>
            <li>
              <strong>Meilisearch (EU):</strong> Volltextsuche
            </li>
          </ul>
          <p>
            Mit allen Auftragsverarbeitern wurden Verträge zur Auftragsverarbeitung
            gemäß Art. 28 DSGVO abgeschlossen. Eine Übermittlung von Daten in
            Drittländer (außerhalb der EU/des EWR) findet nicht statt.
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          6. Rechte der Betroffenen
        </summary>
        <div className="mt-2 pl-4">
          <p>Sie haben gegenüber uns folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
          <ul>
            <li><strong>Auskunftsrecht (Art. 15 DSGVO)</strong></li>
            <li><strong>Recht auf Berichtigung (Art. 16 DSGVO)</strong></li>
            <li><strong>Recht auf Löschung (Art. 17 DSGVO)</strong></li>
            <li><strong>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</strong></li>
            <li><strong>Recht auf Datenportabilität (Art. 20 DSGVO)</strong></li>
            <li><strong>Widerspruchsrecht (Art. 21 DSGVO)</strong></li>
          </ul>
          <p>
            Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
            über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          7. Datensicherheit
        </summary>
        <div className="mt-2 pl-4">
          <p>
            Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein,
            um Ihre Daten gegen zufällige oder vorsätzliche Manipulation, Verlust,
            Zerstörung oder den Zugriff unberechtigter Personen zu schützen. Unsere
            Sicherheitsmaßnahmen umfassen unter anderem:
          </p>
          <ul>
            <li>Verschlüsselte Datenübertragung (TLS/SSL)</li>
            <li>Verschlüsselte Speicherung sensibler Daten</li>
            <li>Regelmäßige Sicherheitsaudits</li>
            <li>Zugriffskontrolle und Protokollierung</li>
          </ul>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          8. Art. 9 DSGVO -- Besondere Kategorien personenbezogener Daten
        </summary>
        <div className="mt-2 pl-4">
          <p>
            Bei der Nutzung der Abstimmungsfunktion geben Sie eine politische Meinung
            ab. Politische Meinungen fallen unter die besonderen Kategorien
            personenbezogener Daten gemäß Art. 9 Abs. 1 DSGVO.
          </p>
          <p>
            Die Verarbeitung erfolgt ausschließlich auf Grundlage Ihrer
            ausdrücklichen Einwilligung gemäß Art. 9 Abs. 2 lit. a DSGVO.
            Sie erteilen diese Einwilligung vor Ihrer ersten Stimmabgabe über
            unseren Einwilligungsdialog.
          </p>
          <p>
            Ihre Stimmen werden anonymisiert und getrennt von Ihrem Profil
            gespeichert. Eine Zuordnung zu Ihrer Person ist nach der Stimmabgabe
            technisch nicht möglich.
          </p>
          <p>
            Sie können Ihre Einwilligung jederzeit widerrufen. Ein Widerruf
            berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.
          </p>
        </div>
      </details>

      <details>
        <summary className="cursor-pointer text-lg font-semibold">
          9. Änderungen dieser Datenschutzerklärung
        </summary>
        <div className="mt-2 pl-4">
          <p>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie
            stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen
            unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die
            neue Datenschutzerklärung.
          </p>
        </div>
      </details>

      <p className="mt-8 text-sm text-muted-foreground">
        Stand: März 2026
      </p>
    </div>
  );
}
