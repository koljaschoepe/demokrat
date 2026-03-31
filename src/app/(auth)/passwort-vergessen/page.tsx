import { PasswordResetForm } from '@/components/auth/password-reset-form';

export const metadata = {
  title: 'Passwort vergessen',
  description: 'Setze dein Passwort bei Demokrat zurück.',
};

export default function PasswortVergessenPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Passwort vergessen?</h1>
        <p className="mt-2 text-muted-foreground">
          Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum
          Zurücksetzen deines Passworts.
        </p>
      </div>
      <PasswordResetForm mode="request" />
    </div>
  );
}
