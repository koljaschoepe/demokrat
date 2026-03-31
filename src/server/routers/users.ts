import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import type { Profile, UserPreferences } from '@/lib/auth/types';

/**
 * Hilfsfunktion: Gibt den Supabase-Client ohne Database-Generics zurück.
 * Nötig solange die Database-Typen noch Platzhalter sind
 * (wird durch `supabase gen types typescript` ersetzt).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(client: SupabaseClient<any>) {
  return client as SupabaseClient;
}

export const usersRouter = router({
  /**
   * Öffentliches Profil eines Nutzers abrufen.
   * Gibt nur öffentliche Profile zurück — es sei denn, der Nutzer
   * ruft sein eigenes Profil ab.
   */
  getProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data: profile, error } = await db(ctx.supabase)
        .from('profiles')
        .select('*')
        .eq('id', input.userId)
        .single();

      if (error || !profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil nicht gefunden.',
        });
      }

      const typedProfile = profile as Profile;

      // Privates Profil nur für den Eigentümer sichtbar
      if (!typedProfile.is_public && ctx.user?.id !== input.userId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profil nicht gefunden.',
        });
      }

      return { profile: typedProfile };
    }),

  /**
   * Eigenes Profil aktualisieren.
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        display_name: z.string().min(2).max(50).optional(),
        bio: z.string().max(500).optional(),
        wahlkreis_id: z.number().int().min(1).max(299).optional(),
        is_public: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Nur gesetzte Felder übernehmen
      const updates: Record<string, unknown> = {};
      if (input.display_name !== undefined)
        updates.display_name = input.display_name;
      if (input.bio !== undefined) updates.bio = input.bio;
      if (input.wahlkreis_id !== undefined)
        updates.wahlkreis_id = input.wahlkreis_id;
      if (input.is_public !== undefined) updates.is_public = input.is_public;

      if (Object.keys(updates).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Keine Änderungen angegeben.',
        });
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await db(ctx.supabase)
        .from('profiles')
        .update(updates)
        .eq('id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Profil konnte nicht aktualisiert werden.',
        });
      }

      return { profile: data as Profile };
    }),

  /**
   * Nutzereinstellungen aktualisieren.
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        notification_votes: z.boolean().optional(),
        notification_comments: z.boolean().optional(),
        notification_results: z.boolean().optional(),
        theme: z.string().min(1).optional(),
        language: z.string().min(1).optional(),
        daily_goal: z.number().int().min(1).max(4).optional(),
        font_size: z.enum(['small', 'medium', 'large']).optional(),
        high_contrast: z.boolean().optional(),
        reduced_motion: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = {};

      if (input.notification_votes !== undefined)
        updates.notification_votes = input.notification_votes;
      if (input.notification_comments !== undefined)
        updates.notification_comments = input.notification_comments;
      if (input.notification_results !== undefined)
        updates.notification_results = input.notification_results;
      if (input.theme !== undefined) updates.theme = input.theme;
      if (input.language !== undefined) updates.language = input.language;
      if (input.daily_goal !== undefined) updates.daily_goal = input.daily_goal;
      if (input.font_size !== undefined) updates.font_size = input.font_size;
      if (input.high_contrast !== undefined)
        updates.high_contrast = input.high_contrast;
      if (input.reduced_motion !== undefined)
        updates.reduced_motion = input.reduced_motion;

      if (Object.keys(updates).length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Keine Änderungen angegeben.',
        });
      }

      const { data, error } = await db(ctx.supabase)
        .from('user_preferences')
        .update(updates)
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Einstellungen konnten nicht aktualisiert werden.',
        });
      }

      return { preferences: data as UserPreferences };
    }),

  /**
   * Abstimmungsverlauf des aktuellen Nutzers abrufen.
   * Cursor-basierte Pagination über sequence_number.
   */
  getVoteHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).optional().default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let query = db(ctx.supabase)
        .from('vote_events')
        .select('*')
        .eq('user_id', ctx.user.id)
        .eq('event_type', 'VoteCast')
        .order('created_at', { ascending: false })
        .limit(input.limit + 1); // +1 um zu prüfen, ob es weitere gibt

      if (input.cursor) {
        const cursorNum = parseInt(input.cursor, 10);
        if (isNaN(cursorNum)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Ungültiger Cursor.',
          });
        }
        query = query.lt('sequence_number', cursorNum);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Abstimmungsverlauf konnte nicht geladen werden.',
        });
      }

      const votes = data ?? [];
      let nextCursor: string | null = null;

      if (votes.length > input.limit) {
        const lastItem = votes.pop();
        if (lastItem && typeof lastItem === 'object' && 'sequence_number' in lastItem) {
          nextCursor = String(
            (lastItem as Record<string, unknown>).sequence_number,
          );
        }
      }

      return {
        votes: votes as Record<string, unknown>[],
        nextCursor,
      };
    }),

  /**
   * Interessenkategorien aktualisieren.
   */
  updateCategories: protectedProcedure
    .input(
      z.object({
        categories: z.array(z.string().min(1)).min(0).max(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await db(ctx.supabase)
        .from('user_preferences')
        .update({ categories: input.categories })
        .eq('user_id', ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Kategorien konnten nicht aktualisiert werden.',
        });
      }

      return { preferences: data as UserPreferences };
    }),

  /**
   * Onboarding abschließen.
   * Setzt Wahlkreis, Kategorien, Tagesziel und markiert
   * das Onboarding als abgeschlossen.
   */
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        wahlkreis_id: z.number().int().min(1).max(299),
        categories: z.array(z.string().min(1)).min(3).max(5),
        daily_goal: z.number().int().min(1).max(4),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Profil aktualisieren: Wahlkreis setzen
      const { error: profileError } = await db(ctx.supabase)
        .from('profiles')
        .update({
          wahlkreis_id: input.wahlkreis_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ctx.user.id);

      if (profileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Wahlkreis konnte nicht gespeichert werden.',
        });
      }

      // Einstellungen aktualisieren: Kategorien, Tagesziel, Onboarding
      const { error: prefsError } = await db(ctx.supabase)
        .from('user_preferences')
        .update({
          categories: input.categories,
          daily_goal: input.daily_goal,
          onboarding_completed: true,
        })
        .eq('user_id', ctx.user.id);

      if (prefsError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Einstellungen konnten nicht gespeichert werden.',
        });
      }

      return { success: true as const };
    }),

  /**
   * Phase 177: Art. 9 DSGVO Einwilligung erteilen.
   * Setzt art9_consent_at auf den aktuellen Zeitpunkt.
   */
  giveArt9Consent: protectedProcedure.mutation(async ({ ctx }) => {
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
  }),
});
