import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { router, protectedProcedure } from '../trpc';
import { deleteUserAccount } from '../services/account-deletion';
import { generateDataExport } from '../services/data-export';
import type { UserPreferences } from '@/lib/auth/types';

/**
 * Hilfsfunktion: Gibt den Supabase-Client ohne Database-Generics zurück.
 * Nötig solange die Database-Typen noch Platzhalter sind
 * (wird durch `supabase gen types typescript` ersetzt).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(client: SupabaseClient<any>) {
  return client as SupabaseClient;
}

export const authRouter = router({
  /**
   * Gibt das Profil und die Einstellungen des aktuellen Nutzers zurück.
   */
  session: protectedProcedure.query(async ({ ctx }) => {
    const { data: preferences, error } = await db(ctx.supabase)
      .from('user_preferences')
      .select('*')
      .eq('user_id', ctx.user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Einstellungen konnten nicht geladen werden.',
      });
    }

    return {
      profile: ctx.profile,
      preferences: preferences as UserPreferences,
    };
  }),

  /**
   * DSGVO Art. 17 — Konto und alle personenbezogenen Daten löschen.
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.literal('DELETE'),
      }),
    )
    .mutation(async ({ ctx }) => {
      try {
        await deleteUserAccount(ctx.user.id);
      } catch (err) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            err instanceof Error
              ? err.message
              : 'Konto konnte nicht gelöscht werden.',
        });
      }

      // Session auf Client-Seite wird beendet; Server-seitig gibt es
      // keinen Auth-User mehr, daher reicht ein einfaches Signal.
      await ctx.supabase.auth.signOut();

      return { success: true as const };
    }),

  /**
   * DSGVO Art. 20 — Datenexport anfordern.
   */
  requestDataExport: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await generateDataExport(ctx.user.id);
    } catch (err) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          err instanceof Error
            ? err.message
            : 'Datenexport konnte nicht erstellt werden.',
      });
    }

    return {
      message:
        'Datenexport wird erstellt. Du erhältst eine E-Mail mit dem Download-Link.',
    };
  }),

  /**
   * Art. 9 DSGVO — Einwilligung für besondere Kategorien
   * personenbezogener Daten (politische Meinungen).
   *
   * Bei Widerruf der Einwilligung werden alle vote_events gelöscht.
   */
  updateArt9Consent: protectedProcedure
    .input(
      z.object({
        consent: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.consent) {
        // Einwilligung erteilen
        const { data, error } = await db(ctx.supabase)
          .from('user_preferences')
          .update({ art9_consent_at: new Date().toISOString() })
          .eq('user_id', ctx.user.id)
          .select()
          .single();

        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Einwilligung konnte nicht gespeichert werden.',
          });
        }

        return { preferences: data as UserPreferences };
      }

      // Einwilligung widerrufen — vote_events löschen
      const { error: voteError } = await db(ctx.supabase)
        .from('vote_events')
        .delete()
        .eq('user_id', ctx.user.id);

      if (voteError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Abstimmungsdaten konnten nicht gelöscht werden.',
        });
      }

      const { data, error } = await db(ctx.supabase)
        .from('user_preferences')
        .update({ art9_consent_at: null })
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Einwilligung konnte nicht aktualisiert werden.',
        });
      }

      return { preferences: data as UserPreferences };
    }),
});
