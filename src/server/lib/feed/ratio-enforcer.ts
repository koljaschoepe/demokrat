/**
 * Phase 143 -- Feed Ratio Enforcer
 *
 * Erzwingt das 80/20 Bundestag/Buerger-Verhaeltnis in Feed-Ergebnissen.
 * Themen sind bereits nach Score sortiert; diese Funktion verschachtelt sie
 * um das Zielverhaeltnis innerhalb jeder Seite einzuhalten.
 */

import { BUNDESTAG_RATIO } from './constants';
import type { ScoredTopic } from './score';

// ─── Types ──────────────────────────────────────────────────────────

export type { ScoredTopic };

// ─── Ratio Enforcement ──────────────────────────────────────────────

/**
 * Erzwingt das 80/20 Bundestag/Buerger-Verhaeltnis innerhalb einer Seite.
 *
 * Algorithmus (Greedy):
 * 1. Trennt die Score-sortierten Themen nach Quelle (BUNDESTAG / BUERGER)
 * 2. Berechnet Ziel-Anzahlen basierend auf pageSize und BUNDESTAG_RATIO
 * 3. Fuellt Slots abwechselnd auf, um das Verhaeltnis einzuhalten
 * 4. Falls eine Quelle nicht genuegend Themen hat, werden die restlichen
 *    Slots mit der anderen Quelle aufgefuellt
 *
 * @param topics - Nach Score sortierte Themen (absteigend)
 * @param pageSize - Anzahl der Themen pro Seite
 * @returns Verschachtelte Themen mit approximiertem Zielverhaeltnis
 */
export function enforceRatio(
  topics: ScoredTopic[],
  pageSize: number,
): ScoredTopic[] {
  if (topics.length === 0) return [];

  // Begrenze auf Seitengroesse
  const available = topics.slice(0, Math.max(topics.length, pageSize * 3));

  // Trenne nach Quelle, behalte Score-Reihenfolge bei
  const bundestag: ScoredTopic[] = [];
  const buerger: ScoredTopic[] = [];

  for (const topic of available) {
    if (topic.source === 'BUNDESTAG') {
      bundestag.push(topic);
    } else {
      buerger.push(topic);
    }
  }

  // Berechne Ziel-Anzahlen
  const targetBundestagCount = Math.round(pageSize * BUNDESTAG_RATIO);
  const targetBuergerCount = pageSize - targetBundestagCount;

  // Bestimme tatsaechliche Anzahlen basierend auf Verfuegbarkeit
  let actualBundestag = Math.min(bundestag.length, targetBundestagCount);
  let actualBuerger = Math.min(buerger.length, targetBuergerCount);

  // Fuege uebrige Slots mit der anderen Quelle auf
  const filledSlots = actualBundestag + actualBuerger;
  const remainingSlots = Math.min(pageSize, topics.length) - filledSlots;

  if (remainingSlots > 0) {
    const bundestagSurplus = bundestag.length - actualBundestag;
    const buergerSurplus = buerger.length - actualBuerger;

    if (bundestagSurplus > 0) {
      const extra = Math.min(bundestagSurplus, remainingSlots);
      actualBundestag += extra;
      const stillRemaining = remainingSlots - extra;
      if (stillRemaining > 0 && buergerSurplus > 0) {
        actualBuerger += Math.min(buergerSurplus, stillRemaining);
      }
    } else if (buergerSurplus > 0) {
      const extra = Math.min(buergerSurplus, remainingSlots);
      actualBuerger += extra;
      const stillRemaining = remainingSlots - extra;
      if (stillRemaining > 0 && bundestagSurplus > 0) {
        actualBundestag += Math.min(bundestagSurplus, stillRemaining);
      }
    }
  }

  // Waehle Themen aus jedem Pool
  const selectedBundestag = bundestag.slice(0, actualBundestag);
  const selectedBuerger = buerger.slice(0, actualBuerger);

  // Spezialfaelle
  if (selectedBuerger.length === 0) return selectedBundestag;
  if (selectedBundestag.length === 0) return selectedBuerger;

  // Greedy-Verschachtelung: verteile Buerger-Themen gleichmaessig
  const result: ScoredTopic[] = [];
  const totalSelected = selectedBundestag.length + selectedBuerger.length;

  // Berechne Abstand: fuege ein Buerger-Thema alle N Positionen ein
  const buergerInterval =
    selectedBuerger.length > 0
      ? totalSelected / selectedBuerger.length
      : totalSelected + 1;

  let bIdx = 0;
  let btIdx = 0;

  for (let i = 0; i < totalSelected; i++) {
    // Bestimme ob dieser Slot ein Buerger-Thema sein soll
    const nextBuergerSlot = Math.round((bIdx + 1) * buergerInterval - 1);

    if (i === nextBuergerSlot && bIdx < selectedBuerger.length) {
      result.push(selectedBuerger[bIdx]!);
      bIdx++;
    } else if (btIdx < selectedBundestag.length) {
      result.push(selectedBundestag[btIdx]!);
      btIdx++;
    } else if (bIdx < selectedBuerger.length) {
      result.push(selectedBuerger[bIdx]!);
      bIdx++;
    }
  }

  return result;
}
