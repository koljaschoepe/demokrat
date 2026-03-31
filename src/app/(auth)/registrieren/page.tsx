import { RegisterForm } from '@/components/auth/register-form';

export const metadata = {
  title: 'Registrieren',
  description: 'Erstelle ein Konto bei Demokrat und werde Teil der digitalen Demokratie.',
};

export default function RegistrierenPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Konto erstellen</h1>
        <p className="mt-2 text-muted-foreground">
          Werde Teil der demokratischen Gemeinschaft
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
