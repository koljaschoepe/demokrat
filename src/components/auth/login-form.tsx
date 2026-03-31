'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Mail, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  loginSchema,
  magicLinkSchema,
  type LoginInput,
  type MagicLinkInput,
} from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/auth/error-messages';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'password' | 'magic-link';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('password');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Fehler aus der URL (z.B. vom Auth Callback)
  const urlError = searchParams.get('error');

  const passwordForm = useForm<LoginInput>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const magicLinkForm = useForm<MagicLinkInput>({
    resolver: standardSchemaResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  });

  const next = searchParams.get('next') ?? '/feed';

  async function onPasswordSubmit(data: LoginInput) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(getAuthErrorMessage(error.message));
      return;
    }

    router.push(next);
  }

  async function onMagicLinkSubmit(data: MagicLinkInput) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: data.email,
    });

    if (error) {
      setServerError(getAuthErrorMessage(error.message));
      return;
    }

    setMagicLinkSent(true);
  }

  function switchMode() {
    setServerError(null);
    setMagicLinkSent(false);
    setMode((prev) => (prev === 'password' ? 'magic-link' : 'password'));
  }

  const displayError =
    serverError ??
    (urlError === 'auth_callback_failed'
      ? 'Die Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.'
      : null);

  if (magicLinkSent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green-600" />
        <h2 className="text-lg font-medium">Magic Link gesendet</h2>
        <p className="text-sm text-muted-foreground">
          Wir haben dir einen Anmeldelink per E-Mail geschickt. Bitte überprüfe
          dein Postfach und klicke auf den Link.
        </p>
        <Button variant="ghost" onClick={() => setMagicLinkSent(false)}>
          Erneut versuchen
        </Button>
      </div>
    );
  }

  if (mode === 'magic-link') {
    return (
      <div className="space-y-4">
        {displayError && (
          <Alert variant="destructive">
            <AlertDescription>{displayError}</AlertDescription>
          </Alert>
        )}

        <form
          onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="magic-email">E-Mail-Adresse</Label>
            <Input
              id="magic-email"
              type="email"
              placeholder="deine@email.de"
              autoComplete="email"
              aria-invalid={!!magicLinkForm.formState.errors.email}
              {...magicLinkForm.register('email')}
            />
            {magicLinkForm.formState.errors.email && (
              <p className="text-xs text-destructive">
                {magicLinkForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={magicLinkForm.formState.isSubmitting}
          >
            {magicLinkForm.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Link wird gesendet...
              </>
            ) : (
              <>
                <Mail className="size-4" />
                Magic Link senden
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Button variant="link" onClick={switchMode} type="button">
            Stattdessen Passwort
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{' '}
          <Link
            href="/registrieren"
            className="text-primary underline-offset-4 hover:underline"
          >
            Registrieren
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayError && (
        <Alert variant="destructive">
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="login-email">E-Mail-Adresse</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="deine@email.de"
            autoComplete="email"
            aria-invalid={!!passwordForm.formState.errors.email}
            {...passwordForm.register('email')}
          />
          {passwordForm.formState.errors.email && (
            <p className="text-xs text-destructive">
              {passwordForm.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Passwort</Label>
            <Link
              href="/passwort-vergessen"
              className="text-xs text-muted-foreground underline-offset-4 hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Dein Passwort"
              autoComplete="current-password"
              aria-invalid={!!passwordForm.formState.errors.password}
              {...passwordForm.register('password')}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </div>
          {passwordForm.formState.errors.password && (
            <p className="text-xs text-destructive">
              {passwordForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={passwordForm.formState.isSubmitting}
        >
          {passwordForm.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Wird angemeldet...
            </>
          ) : (
            'Anmelden'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" onClick={switchMode} type="button">
          Stattdessen Magic Link
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Noch kein Konto?{' '}
        <Link
          href="/registrieren"
          className="text-primary underline-offset-4 hover:underline"
        >
          Registrieren
        </Link>
      </p>
    </div>
  );
}
