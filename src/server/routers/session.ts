/**
 * Phase 116 & 117 — tRPC Session Router
 *
 * Exposes the daily session content pipeline and session flow
 * as tRPC procedures for the frontend.
 */

import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getSessionContent } from '@/server/services/session-content.service';
import {
  startSession,
  completeStep,
  skipToFreeNav,
} from '@/server/services/session-flow.service';
import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

/**
 * Returns today's date in CET timezone as YYYY-MM-DD.
 */
function getCETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

// ─── Router ──────────────────────────────────────────────────────────

export const sessionRouter = router({
  /**
   * Get today's session content (briefing, quiz, bridging comment).
   * Public — no auth required.
   */
  todayContent: publicProcedure.query(async () => {
    const today = getCETDate();
    const content = await getSessionContent(today);

    if (!content) {
      return null;
    }

    return {
      contentDate: content.content_date,
      topicId: content.topic_id,
      briefing: content.briefing,
      quizQuestion: content.quiz_question,
      quizOptions: content.quiz_options,
      quizExplanation: content.quiz_explanation,
      bridgingCommentId: content.bridging_comment_id,
    };
  }),

  /**
   * Start or resume today's daily session.
   * Returns current progress if resuming.
   */
  startSession: protectedProcedure.mutation(async ({ ctx }) => {
    const today = getCETDate();

    try {
      const result = await startSession(ctx.user.id, today);
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Session konnte nicht gestartet werden.',
      });
    }
  }),

  /**
   * Complete a step in the daily session.
   * Validates step order and awards points.
   */
  completeStep: protectedProcedure
    .input(
      z.object({
        step: z.number().int().min(0).max(4),
        payload: z
          .object({
            quizCorrect: z.boolean().optional(),
            voteChoice: z.string().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const today = getCETDate();

      try {
        const result = await completeStep(
          ctx.user.id,
          today,
          input.step,
          input.payload,
        );
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Schritt konnte nicht abgeschlossen werden.';

        // Map known error messages to appropriate tRPC error codes
        if (message.includes('Keine aktive Session')) {
          throw new TRPCError({ code: 'NOT_FOUND', message });
        }
        if (message.includes('bereits abgeschlossen')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }
        if (message.includes('Ungültiger Schritt')) {
          throw new TRPCError({ code: 'BAD_REQUEST', message });
        }

        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
      }
    }),

  /**
   * Skip directly to free navigation mode.
   * Marks the session as complete without earning step points.
   */
  skipToFreeNav: protectedProcedure.mutation(async ({ ctx }) => {
    const today = getCETDate();

    try {
      await skipToFreeNav(ctx.user.id, today);
      return { success: true as const };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Überspringen fehlgeschlagen.',
      });
    }
  }),

  /**
   * Get the user's progress for today's session.
   * Returns step_reached, completed status, and points earned.
   */
  myProgress: protectedProcedure.query(async ({ ctx }) => {
    const today = getCETDate();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createAdminClient() as any;

    const { data, error } = await supabase
      .from('daily_sessions')
      .select('step_reached, completed, points_earned, completed_at')
      .eq('user_id', ctx.user.id)
      .eq('session_date', today)
      .single();

    if (error || !data) {
      // No session started yet
      return {
        stepReached: 0,
        completed: false,
        pointsEarned: 0,
        completedAt: null,
        hasStarted: false,
      };
    }

    const row = data as AnyRow;
    return {
      stepReached: row.step_reached as number,
      completed: row.completed as boolean,
      pointsEarned: row.points_earned as number,
      completedAt: (row.completed_at as string) ?? null,
      hasStarted: true,
    };
  }),
});
