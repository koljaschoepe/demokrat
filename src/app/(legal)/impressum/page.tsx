import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum',
  description:
    'Impressum und Anbieterkennzeichnung der Demokrat Plattform.',
};

export default function ImpressumPage() {
  return (
    <div>
      <h1 id="impressum">Impressum</h1>

      <h2 id="angaben">Angaben gemäß &sect; 5 TMG</h2>
      <p>
        Demokrat
        <br />
        Kolja Schope (Einzelunternehmer)
        <br />
        [Straße und Hausnummer]
        <br />
        [PLZ Ort]
        <br />
        Deutschland
      </p>

      <p>
        <strong>Vertreten durch:</strong>
        <br />
        Kolja Schope
      </p>

      <h2 id="kontakt">Kontakt</h2>
      <p>
        E-Mail:{' '}
        <a href="mailto:kontakt@demokrat.app">kontakt@demokrat.app</a>
        <br />
        Website:{' '}
        <a href="https://demokrat.app" target="_blank" rel="noreferrer">
          https://demokrat.app
        </a>
      </p>

      <h2 id="verantwortlich">Verantwortlich für den Inhalt gemäß &sect; 18 Abs. 2 MStV</h2>
      <p>
        Kolja Schope
        <br />
        [Straße und Hausnummer]
        <br />
        [PLZ Ort]
      </p>

      <h2 id="streitschlichtung">EU-Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
        (OS) bereit:{' '}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noreferrer"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>

      <h2 id="verbraucherstreitbeilegung">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor
        einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2 id="haftung-inhalte">Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß &sect; 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach &sect;&sect; 8
        bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte
        oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
        forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      <p>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
        nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
        Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
        Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen
        werden wir diese Inhalte umgehend entfernen.
      </p>

      <h2 id="haftung-links">Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
        wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch
        keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der
        jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten
        Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
        überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht
        erkennbar.
      </p>

      <h2 id="urheberrecht">Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
        unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
        Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
        Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
        bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten,
        nicht kommerziellen Gebrauch gestattet.
      </p>
    </div>
  );
}
