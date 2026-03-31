/**
 * Phase 169 -- Admin Sync Monitoring Router
 */
import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTier } from '@/server/middleware/requireTier';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const adminSyncRouter = router({
  // Current status per source
  status: protectedProcedure
    .use(requireTier(3) as any)
    .query(async () => {
      const admin = createAdminClient() as any;
      const sources = ['dip', 'abgeordnetenwatch', 'meilisearch', 'content'] as const;

      const statuses = await Promise.all(
        sources.map(async (source) => {
          const { data } = await admin
            .from('sync_runs')
            .select('id, source, status, records_processed, error_message, started_at, finished_at')
            .eq('source', source)
            .order('started_at', { ascending: false })
            .limit(1)
            .single();

          return {
            source,
            lastRun: data ? {
              id: (data as AnyRow).id,
              status: (data as AnyRow).status,
              recordsProcessed: (data as AnyRow).records_processed,
              errorMessage: (data as AnyRow).error_message,
              startedAt: (data as AnyRow).started_at,
              finishedAt: (data as AnyRow).finished_at,
            } : null,
          };
        })
      );

      return statuses;
    }),

  // Sync history (last 50 runs)
  history: protectedProcedure
    .use(requireTier(3) as any)
    .input(z.object({
      source: z.enum(['all', 'dip', 'abgeordnetenwatch', 'meilisearch', 'content']).default('all'),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const admin = createAdminClient() as any;

      let query = admin
        .from('sync_runs')
        .select('id, source, status, records_processed, error_message, started_at, finished_at')
        .order('started_at', { ascending: false })
        .limit(input.limit);

      if (input.source !== 'all') {
        query = query.eq('source', input.source);
      }

      const { data, error } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      return (data ?? []).map((r: AnyRow) => ({
        id: r.id,
        source: r.source,
        status: r.status,
        recordsProcessed: r.records_processed,
        errorMessage: r.error_message,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
      }));
    }),
});
