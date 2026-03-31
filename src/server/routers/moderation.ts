/**
 * Phase 137 -- tRPC Moderation Router
 *
 * Endpunkte fuer die Moderations-Queue: Ausstehende Meldungen,
 * markierte Themen, Meldungen bearbeiten, Statistiken.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints } from '@/server/services/points.service';
import { requireTier } from '@/server/middleware/requireTier';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const moderationRouter = router({
  // ── Ausstehende Meldungen ─────────────────────────────────────────

  pendingReports: protectedProcedure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(requireTier(3) as any)
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
        type: z.enum(['comment', 'topic']).optional(),
      }),
    )
    .query(async ({ input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;
      const { cursor, limit, type } = input;

      let query = admin
        .from('reports')
        .select(`
          id, reporter_id, content_type, content_id, reason, details, status, created_at,
          reporter:profiles!reporter_id ( display_name )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('content_type', type);
      }

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      query = query.limit(limit + 1);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Meldungen konnten nicht geladen werden: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      // Enrich with content details
      const enriched = await Promise.all(
        items.map(async (report: AnyRow) => {
          let contentPreview = '';
          let contentAuthor = '';

          if (report.content_type === 'comment') {
            const { data: comment } = await admin
              .from('comments')
              .select('content, user_id, profiles!comments_user_id_fkey ( display_name )')
              .eq('id', report.content_id)
              .single();
            if (comment) {
              contentPreview = ((comment as AnyRow).content as string).slice(0, 200);
              contentAuthor = (comment as AnyRow).profiles?.display_name ?? 'Unbekannt';
            }
          } else if (report.content_type === 'topic') {
            const { data: topic } = await admin
              .from('topics')
              .select('title, created_by, creator:profiles!created_by ( display_name )')
              .eq('id', report.content_id)
              .single();
            if (topic) {
              contentPreview = (topic as AnyRow).title as string;
              contentAuthor = (topic as AnyRow).creator?.display_name ?? 'Unbekannt';
            }
          }

          return {
            id: report.id,
            reporterId: report.reporter_id,
            reporterName: report.reporter?.display_name ?? 'Unbekannt',
            contentType: report.content_type,
            contentId: report.content_id,
            reason: report.reason,
            details: report.details,
            createdAt: report.created_at,
            contentPreview,
            contentAuthor,
          };
        }),
      );

      const nextCursor = hasMore ? items[items.length - 1].created_at : null;

      return { items: enriched, nextCursor };
    }),

  // ── Markierte Themen ──────────────────────────────────────────────

  pendingTopics: protectedProcedure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(requireTier(3) as any)
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      let query = admin
        .from('topics')
        .select('id, title, status, category, created_at, created_by, creator:profiles!created_by ( display_name )')
        .or('is_flagged.eq.true,status.eq.pending')
        .order('created_at', { ascending: false });

      if (input.cursor) {
        query = query.lt('created_at', input.cursor);
      }

      query = query.limit(input.limit + 1);

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Themen konnten nicht geladen werden: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, input.limit) : rows;

      const nextCursor = hasMore ? items[items.length - 1].created_at : null;

      return {
        items: items.map((t: AnyRow) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          category: t.category,
          createdAt: t.created_at,
          authorName: t.creator?.display_name ?? 'Unbekannt',
        })),
        nextCursor,
      };
    }),

  // ── Meldung bearbeiten ────────────────────────────────────────────

  resolveReport: protectedProcedure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(requireTier(3) as any)
    .input(
      z.object({
        reportId: z.string().uuid(),
        action: z.enum(['confirm', 'dismiss', 'escalate']),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const statusMap = {
        confirm: 'confirmed',
        dismiss: 'dismissed',
        escalate: 'escalated',
      } as const;

      // Fetch report
      const { data: report, error: fetchError } = await admin
        .from('reports')
        .select('id, reporter_id, content_type, content_id, status')
        .eq('id', input.reportId)
        .single();

      if (fetchError || !report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Meldung nicht gefunden.',
        });
      }

      if ((report as AnyRow).status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Meldung wurde bereits bearbeitet.',
        });
      }

      const resolvedAt = new Date().toISOString();

      // Update report
      const { error: updateError } = await admin
        .from('reports')
        .update({
          status: statusMap[input.action],
          resolved_by: ctx.user.id,
          resolved_at: resolvedAt,
          resolution_note: input.note ?? null,
        })
        .eq('id', input.reportId);

      if (updateError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Meldung konnte nicht aktualisiert werden: ${updateError.message}`,
        });
      }

      // If confirmed: flag the content
      if (input.action === 'confirm') {
        const contentType = (report as AnyRow).content_type as string;
        const contentId = (report as AnyRow).content_id as string;

        if (contentType === 'comment') {
          await admin
            .from('comments')
            .update({ is_flagged: true })
            .eq('id', contentId);
        }

        // Award reporter points
        const reporterId = (report as AnyRow).reporter_id as string;
        await awardPoints(reporterId, 'REPORT_VALID', (report as AnyRow).id);
      }

      // Audit log
      await admin.from('audit_log').insert({
        user_id: ctx.user.id,
        action: 'moderation_resolve',
        resource_type: (report as AnyRow).content_type,
        resource_id: (report as AnyRow).content_id,
        payload: {
          report_id: input.reportId,
          resolution: input.action,
          note: input.note ?? null,
        },
        created_at: resolvedAt,
      });

      return { resolved: true as const };
    }),

  // ── Statistiken ───────────────────────────────────────────────────

  stats: protectedProcedure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .use(requireTier(3) as any)
    .query(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = createAdminClient() as any;

      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();

      const [pending, confirmedToday, dismissedToday, flagged] = await Promise.all([
        admin
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'confirmed')
          .gte('resolved_at', todayISO)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'dismissed')
          .gte('resolved_at', todayISO)
          .then((r: AnyRow) => r.count ?? 0),
        admin
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('is_flagged', true)
          .then((r: AnyRow) => r.count ?? 0),
      ]);

      return {
        pendingReports: pending as number,
        confirmedToday: confirmedToday as number,
        dismissedToday: dismissedToday as number,
        flaggedComments: flagged as number,
      };
    }),
});
