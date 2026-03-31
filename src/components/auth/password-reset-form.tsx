'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrength } from './password-strength';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/auth/error-messages';
import { createClient } from '@/lib/supabase/client';

interface PasswordResetFormProps {
  mode: 'request' | 'confirm';
}

export function PasswordResetForm({ mode }: PasswordResetFormProps) {
  if (mode === 'request') {
    return <RequestResetForm />;
  }
  return <ConfirmResetForm />;
}

function RequestResetForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: standardSchemaResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordInput) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/passwort-zuruecksetzen`,
    });

    if (error) {
      setServerError(getAuthErrorMessage(error.message));
      return;
    }

    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green-600" />
        <h2 className="text-lg font-medium">E-Mail gesendet</h2>
        <p className="text-sm text-muted-foreground">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir
          einen Link zum Zurücksetzen deines Passworts geschickt.
        </p>
        <Link
          href="/anmelden"
          className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-3" />
          Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="reset-email">E-Mail-Adresse</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="deine@email.de"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Wird gesendet...
          </>
        ) : (
          'Link zum Zurücksetzen senden'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/anmelden"
          className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-3" />
          Zurück zur Anmeldung
        </Link>
      </p>
    </form>
  );
}

function ConfirmResetForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: standardSchemaResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  async function onSubmit(data: ResetPasswordInput) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setServerError(getAuthErrorMessage(error.message));
      return;
    }

    setIsSuccess(true);
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto size-12 text-green-600" />
        <h2 className="text-lg font-medium">Passwort geändert</h2>
        <p className="text-sm text-muted-foreground">
          Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt mit
          deinem neuen Passwort anmelden.
        </p>
        <Link
          href="/anmelden"
          className="inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          Zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-password">Neues Passwort</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mindestens 8 Zeichen"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register('password')}
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
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
        <PasswordStrength password={passwordValue} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Passwort bestätigen</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Passwort wiederholen"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={
              showConfirmPassword
                ? 'Passwort verbergen'
                : 'Passwort anzeigen'
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Wird gespeichert...
          </>
        ) : (
          'Passwort ändern'
        )}
      </Button>
    </form>
  );
}
