'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrength } from './password-strength';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { getAuthErrorMessage } from '@/lib/auth/error-messages';
import { createClient } from '@/lib/supabase/client';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
      acceptTerms: false as unknown as true,
      acceptPrivacy: false as unknown as true,
    },
  });

  const passwordValue = watch('password');
  const acceptTermsValue = watch('acceptTerms');
  const acceptPrivacyValue = watch('acceptPrivacy');

  async function onSubmit(data: RegisterInput) {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
        },
      },
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
        <h2 className="text-lg font-medium">Bestätigungsmail gesendet</h2>
        <p className="text-sm text-muted-foreground">
          Wir haben dir eine E-Mail mit einem Bestätigungslink geschickt. Bitte
          überprüfe dein Postfach und klicke auf den Link, um dein Konto zu
          aktivieren.
        </p>
        <Link
          href="/anmelden"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
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
        <Label htmlFor="displayName">Anzeigename</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Dein Anzeigename"
          autoComplete="name"
          aria-invalid={!!errors.displayName}
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-xs text-destructive">
            {errors.displayName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
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

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <div className="relative">
          <Input
            id="password"
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
            aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
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

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="acceptTerms"
            checked={acceptTermsValue === true}
            onCheckedChange={(checked) => {
              setValue('acceptTerms', checked === true ? true : (false as unknown as true), {
                shouldValidate: true,
              });
            }}
            aria-invalid={!!errors.acceptTerms}
          />
          <Label htmlFor="acceptTerms" className="text-sm font-normal leading-snug">
            Ich akzeptiere die{' '}
            <Link
              href="/nutzungsbedingungen"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
            >
              Nutzungsbedingungen
            </Link>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-destructive">
            {errors.acceptTerms.message}
          </p>
        )}

        <div className="flex items-start gap-2">
          <Checkbox
            id="acceptPrivacy"
            checked={acceptPrivacyValue === true}
            onCheckedChange={(checked) => {
              setValue('acceptPrivacy', checked === true ? true : (false as unknown as true), {
                shouldValidate: true,
              });
            }}
            aria-invalid={!!errors.acceptPrivacy}
          />
          <Label htmlFor="acceptPrivacy" className="text-sm font-normal leading-snug">
            Ich akzeptiere die{' '}
            <Link
              href="/datenschutz"
              className="text-primary underline-offset-4 hover:underline"
              target="_blank"
            >
              Datenschutzerklärung
            </Link>
          </Label>
        </div>
        {errors.acceptPrivacy && (
          <p className="text-xs text-destructive">
            {errors.acceptPrivacy.message}
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
            Konto wird erstellt...
          </>
        ) : (
          'Konto erstellen'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Du hast bereits ein Konto?{' '}
        <Link
          href="/anmelden"
          className="text-primary underline-offset-4 hover:underline"
        >
          Anmelden
        </Link>
      </p>
    </form>
  );
}
