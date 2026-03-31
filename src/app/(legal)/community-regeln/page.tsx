import type { Metadata } from 'next';
import {
  Heart,
  Scale,
  ShieldAlert,
  SearchCheck,
  MessageCircle,
  AlertTriangle,
  Clock,
  Ban,
  Flag,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community-Regeln',
  description:
    'Die Community-Regeln für einen respektvollen und konstruktiven Austausch auf Demokrat.',
};

export default function CommunityRegelnPage() {
  return (
    <div>
      <h1 id="community-regeln">Community-Regeln</h1>

      <p>
        Demokrat ist ein Ort für konstruktiven demokratischen Austausch. Damit
        alle Nutzerinnen und Nutzer eine positive Erfahrung machen, gelten die
        folgenden Regeln. Bitte lesen Sie diese sorgfältig durch.
      </p>

      <h2 id="unsere-regeln">Unsere Regeln</h2>

      <div className="not-prose space-y-4">
        <RuleCard
          icon={Heart}
          title="Respektvoller Umgang"
          description="Behandeln Sie andere Nutzerinnen und Nutzer so, wie Sie selbst behandelt werden möchten. Persönliche Angriffe, Beleidigungen und herabwürdigendes Verhalten sind nicht akzeptabel — auch nicht in hitzigen politischen Diskussionen."
        />

        <RuleCard
          icon={Scale}
          title="Sachlichkeit"
          description="Bleiben Sie beim Thema und argumentieren Sie sachlich. Politische Diskussionen sollen auf Fakten und belegbaren Argumenten basieren. Emotionale Reaktionen sind menschlich, aber versuchen Sie, konstruktiv zu bleiben."
        />

        <RuleCard
          icon={ShieldAlert}
          title="Keine Hassrede"
          description="Hassrede, Diskriminierung und Aufrufe zur Gewalt sind verboten. Dies umfasst Äußerungen, die Personen oder Gruppen aufgrund von Herkunft, Geschlecht, Religion, sexueller Orientierung, Behinderung oder anderen Merkmalen herabwürdigen."
        />

        <RuleCard
          icon={SearchCheck}
          title="Keine Falschinformationen"
          description="Verbreiten Sie keine bewussten Falschinformationen oder irreführenden Inhalte. Wenn Sie Behauptungen aufstellen, sollten Sie diese belegen können. Bei Unsicherheit kennzeichnen Sie Ihre Aussage als persönliche Meinung."
        />

        <RuleCard
          icon={MessageCircle}
          title="Konstruktive Kritik"
          description="Kritik ist erwünscht und wichtig für den demokratischen Diskurs. Sie sollte jedoch konstruktiv formuliert sein und sich auf Sachverhalte, nicht auf Personen beziehen. Schlagen Sie Alternativen vor, wenn Sie etwas kritisieren."
        />
      </div>

      <h2 id="konsequenzen">Konsequenzen bei Verstößen</h2>
      <p>
        Bei Verstößen gegen die Community-Regeln greifen abgestufte Maßnahmen.
        Die Schwere des Verstoßes bestimmt die Reaktion:
      </p>

      <div className="not-prose space-y-3">
        <div className="flex items-start gap-3 rounded-xl border p-4">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-medium">Stufe 1: Verwarnung</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bei einem ersten oder leichten Verstoß erhalten Sie eine Verwarnung.
              Der beanstandete Inhalt kann entfernt oder ausgeblendet werden. Sie
              werden über den Grund der Verwarnung informiert.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-orange-200 p-4 dark:border-orange-900/50">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
            <Clock className="size-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="font-medium">Stufe 2: Temporäre Sperre</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bei wiederholten Verstößen oder einem schwerwiegenden Einzelverstoß
              wird Ihr Konto vorübergehend gesperrt. Die Dauer der Sperre hängt von
              der Schwere des Verstoßes ab (1 bis 30 Tage).
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-red-200 p-4 dark:border-red-900/50">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Ban className="size-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium">Stufe 3: Permanente Sperre</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Bei besonders schweren Verstößen oder wiederholtem Fehlverhalten trotz
              Verwarnungen kann Ihr Konto dauerhaft gesperrt werden. Eine Neuregistrierung
              ist in diesem Fall nicht gestattet.
            </p>
          </div>
        </div>
      </div>

      <h2 id="melden">Inhalte melden</h2>
      <div className="not-prose flex items-start gap-3 rounded-xl border p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Flag className="size-4 text-primary" />
        </div>
        <div>
          <p className="font-medium">So melden Sie einen Verstoß</p>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
            <li>Klicken Sie auf das Drei-Punkte-Menü neben dem betreffenden Beitrag.</li>
            <li>Wählen Sie &ldquo;Melden&rdquo; aus dem Menü.</li>
            <li>Wählen Sie den Grund der Meldung aus den vorgegebenen Kategorien.</li>
            <li>Optional: Fügen Sie eine kurze Erklärung hinzu.</li>
            <li>Ihr Report wird von unserem Moderationsteam innerhalb von 24 Stunden geprüft.</li>
          </ol>
          <p className="mt-2 text-sm text-muted-foreground">
            Alle Meldungen werden vertraulich behandelt. Der gemeldete Nutzer erfährt nicht,
            wer die Meldung abgegeben hat.
          </p>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Stand: März 2026
      </p>
    </div>
  );
}

function RuleCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
