/**
 * Phase 172 -- Admin Audit Log Router
 */
import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireTier } from '@/server/middleware/requireTier';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

export const adminAuditRouter = router({
  /**
   * Paginated audit log entries with filters.
   * Tier >= 4.
   */
  list: protectedProcedure
    .use(requireTier(4) as any)
    .input(z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
      action: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const admin = createAdminClient() as any;
      const { page, pageSize, action, dateFrom, dateTo, search } = input;

      let query = admin
        .from('audit_log')
        .select('id, user_id, action, resource_type, resource_id, payload, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (action && action !== 'all') {
        query = query.eq('action', action);
      }

      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00Z`);
      }

      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59Z`);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Fetch actor display names
      const userIds = [...new Set((data ?? []).map((r: AnyRow) => r.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length > 0
        ? await admin.from('profiles').select('id, display_name').in('id', userIds)
        : { data: [] };

      const nameMap: Record<string, string> = {};
      for (const p of (profiles ?? []) as AnyRow[]) {
        nameMap[p.id] = p.display_name;
      }

      // If search is provided, filter by actor name (client-side after fetching names)
      let entries = (data ?? []).map((r: AnyRow) => ({
        id: r.id,
        userId: r.user_id,
        actorName: nameMap[r.user_id] ?? 'System',
        action: r.action,
        resourceType: r.resource_type,
        resourceId: r.resource_id,
        payload: r.payload,
        createdAt: r.created_at,
      }));

      if (search) {
        const lowerSearch = search.toLowerCase();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entries = entries.filter((e: any) =>
          e.actorName.toLowerCase().includes(lowerSearch)
        );
      }

      return {
        entries,
        total: (count ?? 0) as number,
        page,
        pageSize,
        totalPages: Math.ceil(((count ?? 0) as number) / pageSize),
      };
    }),

  /**
   * Export all entries for a date range as flat array (for CSV).
   * Tier >= 4.
   */
  export: protectedProcedure
    .use(requireTier(4) as any)
    .input(z.object({
      dateFrom: z.string(),
      dateTo: z.string(),
    }))
    .query(async ({ input }) => {
      const admin = createAdminClient() as any;

      const { data, error } = await admin
        .from('audit_log')
        .select('id, user_id, action, resource_type, resource_id, payload, created_at')
        .gte('created_at', `${input.dateFrom}T00:00:00Z`)
        .lte('created_at', `${input.dateTo}T23:59:59Z`)
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Fetch actor names
      const userIds = [...new Set((data ?? []).map((r: AnyRow) => r.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length > 0
        ? await admin.from('profiles').select('id, display_name').in('id', userIds)
        : { data: [] };

      const nameMap: Record<string, string> = {};
      for (const p of (profiles ?? []) as AnyRow[]) {
        nameMap[p.id] = p.display_name;
      }

      return (data ?? []).map((r: AnyRow) => ({
        id: r.id,
        actorName: nameMap[r.user_id] ?? 'System',
        action: r.action,
        resourceType: r.resource_type,
        resourceId: r.resource_id,
        details: JSON.stringify(r.payload ?? {}),
        createdAt: r.created_at,
      }));
    }),
});
