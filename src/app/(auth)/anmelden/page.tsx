import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
  title: 'Anmelden',
  description: 'Melde dich bei Demokrat an, um an der digitalen Demokratie teilzunehmen.',
};

export default function AnmeldenPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Willkommen zurück</h1>
        <p className="mt-2 text-muted-foreground">
          Melde dich an, um weiterzumachen
        </p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
