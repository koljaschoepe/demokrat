import { z } from 'zod/v4';

export const registerSchema = z.object({
  email: z.email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z
    .string()
    .min(8, 'Mindestens 8 Zeichen')
    .regex(/[a-zA-Z]/, 'Muss mindestens einen Buchstaben enthalten')
    .regex(/[0-9]/, 'Muss mindestens eine Zahl enthalten'),
  displayName: z
    .string()
    .min(2, 'Mindestens 2 Zeichen')
    .max(50, 'Maximal 50 Zeichen'),
  acceptTerms: z.literal(true, {
    message: 'Du musst die Nutzungsbedingungen akzeptieren',
  }),
  acceptPrivacy: z.literal(true, {
    message: 'Du musst die Datenschutzerklärung akzeptieren',
  }),
});

export const loginSchema = z.object({
  email: z.email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(1, 'Passwort ist erforderlich'),
});

export const magicLinkSchema = z.object({
  email: z.email('Bitte gib eine gültige E-Mail-Adresse ein'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Bitte gib eine gültige E-Mail-Adresse ein'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Mindestens 8 Zeichen')
      .regex(/[a-zA-Z]/, 'Muss mindestens einen Buchstaben enthalten')
      .regex(/[0-9]/, 'Muss mindestens eine Zahl enthalten'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
