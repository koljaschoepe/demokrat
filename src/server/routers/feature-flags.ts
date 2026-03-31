/**
 * Phase 173 -- Feature Flags Router
 *
 * Public list for client-side checks, admin mutations for toggling and creating flags.
 */
import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTier } from '@/server/middleware/requireTier';
import { getAllFlags, invalidateFlagsCache } from '@/lib/feature-flags';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const featureFlagsRouter = router({
  /**
   * List all feature flags -- public (needed for client-side hook).
   */
  list: publicProcedure.query(async () => {
    return getAllFlags();
  }),

  /**
   * Update a feature flag -- tier >= 4.
   */
  update: protectedProcedure
    .use(requireTier(4) as any)
    .input(
      z.object({
        id: z.string().min(1),
        enabled: z.boolean().optional(),
        rolloutPercentage: z.number().int().min(0).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = createAdminClient() as any;

      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
        updated_by: ctx.user.id,
      };

      if (input.enabled !== undefined) updates.enabled = input.enabled;
      if (input.rolloutPercentage !== undefined)
        updates.rollout_percentage = input.rolloutPercentage;

      const { data, error } = await admin
        .from('feature_flags')
        .update(updates)
        .eq('id', input.id)
        .select()
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Feature Flag nicht gefunden.',
        });
      }

      await invalidateFlagsCache();

      const row = data as AnyRow;
      return {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        enabled: row.enabled as boolean,
        rolloutPercentage: row.rollout_percentage as number,
        updatedAt: row.updated_at as string,
      };
    }),

  /**
   * Create a new feature flag -- tier >= 4.
   */
  create: protectedProcedure
    .use(requireTier(4) as any)
    .input(
      z.object({
        id: z
          .string()
          .min(1)
          .max(50)
          .regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.'),
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        enabled: z.boolean().optional(),
        rolloutPercentage: z.number().int().min(0).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const admin = createAdminClient() as any;

      const { data, error } = await admin
        .from('feature_flags')
        .insert({
          id: input.id,
          name: input.name,
          description: input.description ?? '',
          enabled: input.enabled ?? false,
          rollout_percentage: input.rolloutPercentage ?? 100,
          updated_at: new Date().toISOString(),
          updated_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Eine Flag mit dieser ID existiert bereits.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Flag konnte nicht erstellt werden.',
        });
      }

      await invalidateFlagsCache();

      const row = data as AnyRow;
      return {
        id: row.id as string,
        name: row.name as string,
        description: row.description as string,
        enabled: row.enabled as boolean,
        rolloutPercentage: row.rollout_percentage as number,
        updatedAt: row.updated_at as string,
      };
    }),
});
