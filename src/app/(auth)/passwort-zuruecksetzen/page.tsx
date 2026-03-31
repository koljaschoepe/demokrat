import { PasswordResetForm } from '@/components/auth/password-reset-form';

export const metadata = {
  title: 'Passwort zurücksetzen',
  description: 'Setze dein Passwort bei Demokrat zurück.',
};

export default function PasswortZuruecksetzenPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Neues Passwort wählen</h1>
        <p className="mt-2 text-muted-foreground">
          Gib dein neues Passwort ein, um den Zugang zu deinem Konto
          wiederherzustellen.
        </p>
      </div>
      <PasswordResetForm mode="confirm" />
    </div>
  );
}
