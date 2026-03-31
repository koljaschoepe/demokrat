/**
 * Phase 117 — Session Flow Service
 *
 * State machine for the daily 5-step session:
 * 0: briefing → 1: quiz → 2: vote → 3: perspective → 4: summary
 *
 * Manages session lifecycle: start, step completion, point tracking,
 * and skip-to-free-navigation.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

// ─── Constants ───────────────────────────────────────────────────────

export const SESSION_STEPS = ['briefing', 'quiz', 'vote', 'perspective', 'summary'] as const;
export type SessionStep = (typeof SESSION_STEPS)[number];

const STEP_POINTS = {
  briefing: 10,
  quiz_correct: 15,
  quiz_wrong: 5,
  vote: 15,
  perspective: 5,
  complete_bonus: 10,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Returns today's date in CET timezone as YYYY-MM-DD.
 */
function getCETDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });
}

/**
 * Calculate points earned for completing a given step.
 */
function calculateStepPoints(
  step: number,
  payload?: { quizCorrect?: boolean },
): number {
  const stepName = SESSION_STEPS[step];
  if (!stepName) return 0;

  switch (stepName) {
    case 'briefing':
      return STEP_POINTS.briefing;
    case 'quiz':
      return payload?.quizCorrect ? STEP_POINTS.quiz_correct : STEP_POINTS.quiz_wrong;
    case 'vote':
      return STEP_POINTS.vote;
    case 'perspective':
      return STEP_POINTS.perspective;
    case 'summary':
      return 0; // Points come from complete_bonus, not the step itself
    default:
      return 0;
  }
}

// ─── Service Functions ───────────────────────────────────────────────

/**
 * Start or resume a daily session.
 *
 * - If session exists and is not completed → resume from step_reached
 * - If session exists and is completed → return as already complete
 * - If no session exists → create new one with step_reached=0
 */
export async function startSession(
  userId: string,
  date?: string,
): Promise<{
  sessionId: string;
  stepReached: number;
  isResume: boolean;
  isComplete: boolean;
}> {
  const sessionDate = date ?? getCETDate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Check if session already exists
  const { data: existing } = await supabase
    .from('daily_sessions')
    .select('user_id, session_date, step_reached, completed, points_earned')
    .eq('user_id', userId)
    .eq('session_date', sessionDate)
    .single();

  if (existing) {
    const row = existing as AnyRow;
    return {
      sessionId: `${userId}:${sessionDate}`,
      stepReached: row.step_reached as number,
      isResume: !(row.completed as boolean),
      isComplete: row.completed as boolean,
    };
  }

  // Create new session
  const { error } = await supabase.from('daily_sessions').insert({
    user_id: userId,
    session_date: sessionDate,
    step_reached: 0,
    completed: false,
    points_earned: 0,
  });

  if (error) {
    // Handle race condition: another request may have created it
    if (error.code === '23505') {
      const { data: raceRow } = await supabase
        .from('daily_sessions')
        .select('user_id, session_date, step_reached, completed, points_earned')
        .eq('user_id', userId)
        .eq('session_date', sessionDate)
        .single();

      if (raceRow) {
        const row = raceRow as AnyRow;
        return {
          sessionId: `${userId}:${sessionDate}`,
          stepReached: row.step_reached as number,
          isResume: !(row.completed as boolean),
          isComplete: row.completed as boolean,
        };
      }
    }

    throw new Error(`Session-Erstellung fehlgeschlagen: ${error.message}`);
  }

  return {
    sessionId: `${userId}:${sessionDate}`,
    stepReached: 0,
    isResume: false,
    isComplete: false,
  };
}

/**
 * Complete a step in the daily session.
 *
 * Validates that the step matches the current step_reached (no skipping/going back).
 * Awards points, advances step, and marks complete if final step.
 */
export async function completeStep(
  userId: string,
  date: string,
  step: number,
  payload?: { quizCorrect?: boolean; voteChoice?: string },
): Promise<{
  pointsEarned: number;
  nextStep: number;
  isComplete: boolean;
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // 1. Fetch current session state
  const { data: session, error: fetchError } = await supabase
    .from('daily_sessions')
    .select('step_reached, completed, points_earned')
    .eq('user_id', userId)
    .eq('session_date', date)
    .single();

  if (fetchError || !session) {
    throw new Error('Keine aktive Session gefunden. Bitte starte zuerst eine Session.');
  }

  const row = session as AnyRow;

  if (row.completed as boolean) {
    throw new Error('Die heutige Session wurde bereits abgeschlossen.');
  }

  // 2. Validate step matches current step_reached
  const currentStep = row.step_reached as number;
  if (step !== currentStep) {
    throw new Error(
      `Ungültiger Schritt. Erwartet: ${currentStep}, erhalten: ${step}. Schritte können nicht übersprungen oder wiederholt werden.`,
    );
  }

  // 3. Calculate points for this step
  const stepPoints = calculateStepPoints(step, payload);
  const currentPoints = row.points_earned as number;

  // 4. Check if this is the final step (summary = step 4)
  const isFinalStep = step === 4;
  const bonusPoints = isFinalStep ? STEP_POINTS.complete_bonus : 0;
  const totalStepPoints = stepPoints + bonusPoints;
  const newTotalPoints = currentPoints + totalStepPoints;
  const nextStep = step + 1;

  // 5. Update daily_sessions
  const updateData: Record<string, unknown> = {
    step_reached: nextStep,
    points_earned: newTotalPoints,
  };

  if (isFinalStep) {
    updateData.completed = true;
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('daily_sessions')
    .update(updateData)
    .eq('user_id', userId)
    .eq('session_date', date);

  if (updateError) {
    throw new Error(`Schritt-Update fehlgeschlagen: ${updateError.message}`);
  }

  // 6. Update daily_activity tracking fields
  const stepName = SESSION_STEPS[step];
  const activityUpdate: Record<string, unknown> = {};

  if (stepName === 'briefing') {
    activityUpdate.read_summary = true;
  } else if (stepName === 'quiz') {
    activityUpdate.quiz_passed = payload?.quizCorrect ?? false;
  } else if (stepName === 'vote') {
    activityUpdate.voted = true;
  }

  if (Object.keys(activityUpdate).length > 0) {
    // UPSERT into daily_activity (may not exist yet)
    await supabase.from('daily_activity').upsert(
      {
        user_id: userId,
        activity_date: date,
        ...activityUpdate,
      },
      { onConflict: 'user_id,activity_date' },
    );
  }

  return {
    pointsEarned: totalStepPoints,
    nextStep,
    isComplete: isFinalStep,
  };
}

/**
 * Skip directly to free navigation mode.
 * Marks the session as completed with step_reached=5.
 * Used when the user wants to bypass the guided session.
 */
export async function skipToFreeNav(
  userId: string,
  date?: string,
): Promise<void> {
  const sessionDate = date ?? getCETDate();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Ensure session exists
  await supabase.from('daily_sessions').upsert(
    {
      user_id: userId,
      session_date: sessionDate,
      step_reached: 5,
      completed: true,
      completed_at: new Date().toISOString(),
      points_earned: 0,
    },
    {
      onConflict: 'user_id,session_date',
      ignoreDuplicates: false,
    },
  );

  // If session already existed with points, only update step/completed fields
  await supabase
    .from('daily_sessions')
    .update({
      step_reached: 5,
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('session_date', sessionDate);
}
