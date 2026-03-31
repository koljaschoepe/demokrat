import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';
import { awardPoints } from '@/server/services/points.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

/** Eingabe-Typ fuer die reine Bridging-Score-Berechnung. */
export interface BridgingRating {
  voter_position: string | null;
  rating: 'up' | 'down';
}

/** Ergebnis der Batch-Neuberechnung. */
export interface RecalculationResult {
  updated: number;
  highBridging: number;
}

/** Schwellenwert ab dem ein Kommentar als "high bridging" gilt. */
const HIGH_BRIDGING_THRESHOLD = 0.7;

/** Mindestanzahl Bewertungen damit ein Kommentar beruecksichtigt wird. */
const MIN_RATINGS = 3;

/** Seitengroesse fuer die paginierte Batch-Verarbeitung. */
const PAGE_SIZE = 500;

/**
 * Berechnet den Bridging-Score eines Kommentars.
 *
 * Der Bridging-Score misst, wie sehr ein Kommentar ueber Meinungsgrenzen
 * hinweg geschaetzt wird. Ein hoher Score bedeutet, dass Nutzer die beim
 * Thema unterschiedlich abgestimmt haben, den Kommentar gleichermassen
 * positiv bewerten.
 *
 * Algorithmus:
 * 1. Nur Upvotes werden beruecksichtigt (Downvotes ignoriert).
 * 2. Upvotes werden nach der Position des Abstimmenden gruppiert:
 *    - "yes" (pro) = Befuerworter des Themas
 *    - "no" (contra) = Gegner des Themas
 * 3. Stimmen von Enthaltungen ("abstain"/neutral) oder ohne Position (null)
 *    werden ignoriert.
 * 4. Score = min(upvotes_yes, upvotes_no) / max(upvotes_yes, upvotes_no)
 *
 * @param ratings - Array aller Bewertungen mit Waehlerposition
 * @returns Score zwischen 0 und 1 (gerundet auf 2 Dezimalstellen),
 *          oder null wenn keine auswertbaren Daten vorliegen
 */
export function computeBridgingScore(
  ratings: BridgingRating[],
): number | null {
  // Nur Upvotes beruecksichtigen
  const upvotes = ratings.filter((r) => r.rating === 'up');

  // Upvotes nach Position zaehlen (yes = pro, no = contra)
  let upvotesYes = 0;
  let upvotesNo = 0;

  for (const vote of upvotes) {
    if (vote.voter_position === 'yes') {
      upvotesYes++;
    } else if (vote.voter_position === 'no') {
      upvotesNo++;
    }
    // "abstain" und null werden bewusst ignoriert
  }

  // Nicht genug Daten: keine Upvotes von relevanten Positionen
  if (upvotesYes === 0 && upvotesNo === 0) {
    return null;
  }

  // Einseitige Zustimmung: nur eine Seite hat upgevoted
  if (upvotesYes === 0 || upvotesNo === 0) {
    return 0;
  }

  // Bridging-Score: Verhaeltnis der kleineren zur groesseren Gruppe
  const score = Math.min(upvotesYes, upvotesNo) / Math.max(upvotesYes, upvotesNo);
  return Math.round(score * 100) / 100;
}

/**
 * Wandelt die DB-Darstellung (rating: -1/0/1) in die Score-Darstellung um.
 *
 * In der Datenbank wird rating als Integer gespeichert:
 *  1 = Upvote, -1 = Downvote, 0 = zurueckgezogen.
 * Fuer die Bridging-Berechnung wird 'up'/'down' erwartet.
 *
 * Ebenso wird voter_position aus der DB ('pro'/'contra'/'neutral')
 * auf 'yes'/'no'/'abstain' gemappt.
 */
function dbRatingToBridging(
  dbRating: AnyRow,
): BridgingRating {
  const ratingMap: Record<number, 'up' | 'down'> = { 1: 'up', [-1]: 'down' };
  const positionMap: Record<string, string> = {
    pro: 'yes',
    contra: 'no',
    neutral: 'abstain',
  };

  return {
    rating: ratingMap[dbRating.rating] ?? 'down',
    voter_position: dbRating.voter_position
      ? (positionMap[dbRating.voter_position] ?? dbRating.voter_position)
      : null,
  };
}

/**
 * Batch-Neuberechnung aller Bridging-Scores.
 *
 * Verarbeitet alle Kommentare mit mindestens 3 Bewertungen in Seiten
 * von je 500 Kommentaren. Fuer jeden Kommentar wird der Score neu
 * berechnet und bei Aenderung in der Datenbank aktualisiert.
 *
 * Bei Ueberschreitung des Schwellenwerts (>0.7) wird:
 * - Eine Benachrichtigung an den Kommentarautor erstellt
 * - COMMENT_HIGH_BRIDGING-Punkte vergeben
 *
 * @returns Anzahl aktualisierter Kommentare und Anzahl neuer High-Bridging-Kommentare
 */
export async function recalculateBridgingScores(): Promise<RecalculationResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  let updated = 0;
  let highBridging = 0;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    // Kommentare mit mindestens MIN_RATINGS Bewertungen paginiert laden
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('id, author_id, bridging_score')
      .gte('upvotes + downvotes', MIN_RATINGS)
      .range(offset, offset + PAGE_SIZE - 1);

    // Fallback: Falls der berechnete Filter nicht funktioniert,
    // laden wir alle und filtern clientseitig
    let commentBatch: AnyRow[] = comments;
    if (commentsError || !comments) {
      // Alternative: Alle Kommentare laden und per Bewertungsanzahl filtern
      const { data: allComments, error: allError } = await supabase
        .from('comments')
        .select('id, author_id, bridging_score, upvotes, downvotes')
        .range(offset, offset + PAGE_SIZE - 1);

      if (allError || !allComments) {
        console.error('[bridging] Fehler beim Laden der Kommentare:', allError);
        break;
      }

      commentBatch = allComments.filter(
        (c: AnyRow) => (c.upvotes ?? 0) + (c.downvotes ?? 0) >= MIN_RATINGS,
      );

      if (allComments.length < PAGE_SIZE) {
        hasMore = false;
      }
    } else {
      if (comments.length < PAGE_SIZE) {
        hasMore = false;
      }
    }

    if (!commentBatch || commentBatch.length === 0) {
      break;
    }

    // Fuer jeden Kommentar: Bewertungen laden und Score berechnen
    for (const comment of commentBatch) {
      const { data: ratings, error: ratingsError } = await supabase
        .from('comment_ratings')
        .select('rating, voter_position')
        .eq('comment_id', comment.id);

      if (ratingsError || !ratings) {
        continue;
      }

      // DB-Bewertungen in Bridging-Format umwandeln
      const bridgingRatings: BridgingRating[] = ratings.map(dbRatingToBridging);
      const newScore = computeBridgingScore(bridgingRatings);

      const oldScore: number | null = comment.bridging_score ?? null;
      const effectiveNewScore = newScore ?? 0;
      const effectiveOldScore = oldScore ?? 0;

      // Nur aktualisieren wenn sich der Score geaendert hat
      if (effectiveNewScore !== effectiveOldScore) {
        const { error: updateError } = await supabase
          .from('comments')
          .update({ bridging_score: effectiveNewScore })
          .eq('id', comment.id);

        if (!updateError) {
          updated++;

          // Cache invalidieren fuer Echtzeit-Abfragen
          await cache.del(`comment:${comment.id}:bridging`);

          // High-Bridging-Schwellenwert erstmals ueberschritten?
          if (
            effectiveNewScore > HIGH_BRIDGING_THRESHOLD &&
            (oldScore === null || effectiveOldScore <= HIGH_BRIDGING_THRESHOLD)
          ) {
            highBridging++;

            // Benachrichtigung erstellen
            await supabase.from('notifications').insert({
              user_id: comment.author_id,
              type: 'bridging_achievement',
              payload: {
                comment_id: comment.id,
                score: effectiveNewScore,
              },
            });

            // Punkte vergeben
            await awardPoints(
              comment.author_id,
              'COMMENT_HIGH_BRIDGING',
              comment.id,
            );
          }
        }
      }
    }

    offset += PAGE_SIZE;
  }

  return { updated, highBridging };
}

/**
 * Neuberechnung des Bridging-Scores fuer einen einzelnen Kommentar.
 *
 * Wird inline nach einer neuen Bewertung aufgerufen, um den Score
 * sofort zu aktualisieren, ohne auf den naechsten Cron-Lauf zu warten.
 *
 * @param commentId - ID des Kommentars
 * @returns Der neue Bridging-Score oder null bei unzureichenden Daten
 */
export async function recalculateSingleComment(
  commentId: string,
): Promise<number | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Aktuellen Score laden
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .select('id, author_id, bridging_score')
    .eq('id', commentId)
    .single();

  if (commentError || !comment) {
    return null;
  }

  // Alle Bewertungen fuer diesen Kommentar laden
  const { data: ratings, error: ratingsError } = await supabase
    .from('comment_ratings')
    .select('rating, voter_position')
    .eq('comment_id', commentId);

  if (ratingsError || !ratings) {
    return null;
  }

  // Score berechnen
  const bridgingRatings: BridgingRating[] = ratings.map(dbRatingToBridging);
  const newScore = computeBridgingScore(bridgingRatings);

  const oldScore: number | null = comment.bridging_score ?? null;
  const effectiveNewScore = newScore ?? 0;
  const effectiveOldScore = oldScore ?? 0;

  // Nur aktualisieren wenn sich der Score geaendert hat
  if (effectiveNewScore !== effectiveOldScore) {
    await supabase
      .from('comments')
      .update({ bridging_score: effectiveNewScore })
      .eq('id', commentId);

    // Cache invalidieren
    await cache.del(`comment:${commentId}:bridging`);

    // High-Bridging erstmals erreicht?
    if (
      effectiveNewScore > HIGH_BRIDGING_THRESHOLD &&
      (oldScore === null || effectiveOldScore <= HIGH_BRIDGING_THRESHOLD)
    ) {
      await supabase.from('notifications').insert({
        user_id: comment.author_id,
        type: 'bridging_achievement',
        payload: {
          comment_id: commentId,
          score: effectiveNewScore,
        },
      });

      await awardPoints(
        comment.author_id,
        'COMMENT_HIGH_BRIDGING',
        commentId,
      );
    }
  }

  return newScore;
}
