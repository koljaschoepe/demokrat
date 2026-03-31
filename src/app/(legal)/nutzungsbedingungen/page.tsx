import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nutzungsbedingungen',
  description:
    'Die Nutzungsbedingungen der Demokrat-Plattform für alle registrierten und nicht-registrierten Nutzer.',
};

export default function NutzungsbedingungenPage() {
  return (
    <div>
      <h1 id="nutzungsbedingungen">Nutzungsbedingungen</h1>

      <p>
        Willkommen bei Demokrat. Mit der Nutzung unserer Plattform erklären Sie sich
        mit den folgenden Nutzungsbedingungen einverstanden. Bitte lesen Sie diese
        sorgfältig durch.
      </p>

      <h2 id="geltungsbereich">1. Geltungsbereich</h2>
      <p>
        Diese Nutzungsbedingungen gelten für die Nutzung der Plattform Demokrat
        (&ldquo;Plattform&rdquo;), betrieben von der Demokrat UG (haftungsbeschränkt),
        Musterstraße 42, 10115 Berlin (&ldquo;Betreiber&rdquo;). Sie gelten für alle
        registrierten und nicht-registrierten Nutzerinnen und Nutzer.
      </p>
      <p>
        Mit der Registrierung oder Nutzung der Plattform akzeptieren Sie diese
        Bedingungen. Abweichende Bedingungen gelten nur, wenn der Betreiber ihnen
        ausdrücklich schriftlich zugestimmt hat.
      </p>

      <h2 id="registrierung">2. Registrierung und Benutzerkonto</h2>
      <p>
        Für die aktive Teilnahme an Abstimmungen ist eine Registrierung erforderlich.
        Bei der Registrierung sind wahrheitsgemäße Angaben zu machen. Jede Person
        darf nur ein Benutzerkonto anlegen.
      </p>
      <p>
        Sie sind verpflichtet, Ihre Zugangsdaten vertraulich zu behandeln und diese
        nicht an Dritte weiterzugeben. Für alle Aktivitäten, die über Ihr Benutzerkonto
        erfolgen, sind Sie verantwortlich.
      </p>
      <p>
        Der Betreiber behält sich vor, Benutzerkonten zu sperren oder zu löschen,
        wenn gegen diese Nutzungsbedingungen oder die Community-Regeln verstoßen wird.
      </p>

      <h2 id="nutzungsregeln">3. Nutzungsregeln</h2>
      <p>
        Die Plattform dient dem demokratischen Diskurs und der politischen Teilhabe.
        Folgende Verhaltensweisen sind untersagt:
      </p>
      <ul>
        <li>Veröffentlichung von rechtswidrigen, beleidigenden, diskriminierenden oder verleumderischen Inhalten</li>
        <li>Verbreitung von Falschinformationen oder Propaganda</li>
        <li>Manipulation von Abstimmungen (z.B. durch Mehrfachkonten)</li>
        <li>Automatisierte Nutzung der Plattform (Bots, Scraping) ohne ausdrückliche Genehmigung</li>
        <li>Belästigung, Bedrohung oder Einschüchterung anderer Nutzer</li>
        <li>Werbung oder kommerzielle Inhalte ohne Genehmigung</li>
      </ul>
      <p>
        Detaillierte Verhaltensregeln finden Sie in unseren{' '}
        <a href="/community-regeln">Community-Regeln</a>.
      </p>

      <h2 id="abstimmungen">4. Abstimmungen</h2>
      <p>
        Abstimmungen auf Demokrat sind unverbindliche Meinungsbilder der registrierten
        Nutzerinnen und Nutzer. Sie haben keine rechtliche Bindungswirkung und stellen
        keine offiziellen Wahlen im Sinne des Grundgesetzes dar.
      </p>
      <p>
        Jede registrierte Nutzerin und jeder registrierte Nutzer hat pro Abstimmung
        eine Stimme. Die Stimme ist nach Abgabe unveränderlich. Die Anonymität der
        Stimmabgabe wird durch technische Maßnahmen sichergestellt.
      </p>
      <p>
        Der Betreiber stellt sicher, dass Abstimmungen fair und transparent durchgeführt
        werden. Manipulationsversuche werden verfolgt und können zur Sperrung des
        Benutzerkontos führen.
      </p>

      <h2 id="geistiges-eigentum">5. Geistiges Eigentum</h2>
      <p>
        Die Plattform und ihre Inhalte (Design, Logos, Texte, Software) sind
        urheberrechtlich geschützt und Eigentum des Betreibers. Nutzergenerierte
        Inhalte (Beiträge, Kommentare) verbleiben im Eigentum der jeweiligen
        Urheber.
      </p>
      <p>
        Mit dem Einstellen von Inhalten auf der Plattform räumen Sie dem Betreiber
        ein einfaches, zeitlich und räumlich unbeschränktes Nutzungsrecht ein, diese
        Inhalte im Rahmen des Plattformbetriebs zu verwenden, anzuzeigen und zu
        verbreiten.
      </p>

      <h2 id="haftung">6. Haftung</h2>
      <p>
        Der Betreiber haftet nur für Vorsatz und grobe Fahrlässigkeit. Die Haftung
        für leichte Fahrlässigkeit ist ausgeschlossen, soweit nicht wesentliche
        Vertragspflichten (Kardinalpflichten) verletzt werden. In diesem Fall ist
        die Haftung auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
      </p>
      <p>
        Der Betreiber übernimmt keine Gewährleistung für die ständige Verfügbarkeit
        der Plattform. Wartungsarbeiten, technische Störungen oder höhere Gewalt können
        zu vorübergehenden Einschränkungen führen.
      </p>
      <p>
        Für Inhalte, die von Nutzerinnen und Nutzern erstellt werden, übernimmt der
        Betreiber keine Haftung. Jeder Nutzer ist für die von ihm veröffentlichten
        Inhalte selbst verantwortlich.
      </p>

      <h2 id="kuendigung">7. Kündigung und Kontolöschung</h2>
      <p>
        Sie können Ihr Benutzerkonto jederzeit ohne Angabe von Gründen in den
        Einstellungen löschen. Mit der Löschung werden Ihre personenbezogenen Daten
        gemäß unserer <a href="/datenschutz">Datenschutzerklärung</a> entfernt.
      </p>
      <p>
        Anonymisierte Abstimmungsdaten bleiben auch nach Kontolöschung erhalten, da
        sie nicht mehr Ihrem Konto zugeordnet werden können.
      </p>
      <p>
        Der Betreiber kann das Nutzungsverhältnis mit einer Frist von 14 Tagen
        kündigen. Bei schwerwiegenden Verstößen (insbesondere wiederholte Verstöße
        gegen die Community-Regeln) ist eine fristlose Kündigung möglich.
      </p>

      <h2 id="aenderungen">8. Änderungen der Nutzungsbedingungen</h2>
      <p>
        Der Betreiber behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern.
        Über wesentliche Änderungen werden registrierte Nutzer per E-Mail informiert.
        Die weitere Nutzung der Plattform nach Inkrafttreten der Änderungen gilt als
        Zustimmung.
      </p>

      <h2 id="schlussbestimmungen">9. Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland. Gerichtsstand ist Berlin,
        soweit gesetzlich zulässig. Sollten einzelne Bestimmungen dieser
        Nutzungsbedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen
        Bestimmungen unberührt.
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        Stand: März 2026
      </p>
    </div>
  );
}
