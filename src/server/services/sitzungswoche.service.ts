import { createAdminClient } from '@/lib/supabase/admin';
import { cache } from '@/lib/redis/cache';

const REDIS_KEY = 'sitzungswoche:active';
const CACHE_TTL = 3600; // 1 hour

export interface Sitzungswoche {
  id: string;
  start_date: string;
  end_date: string;
  label: string | null;
  is_active: boolean;
}

/**
 * Prüft ob aktuell eine Sitzungswoche aktiv ist.
 * Cached in Redis für 1h.
 */
export async function isSitzungswocheActive(): Promise<boolean> {
  // Check Redis cache first
  const cached = await cache.get<boolean>(REDIS_KEY);
  if (cached !== null) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('sitzungswochen')
    .select('id')
    .lte('start_date', today)
    .gte('end_date', today)
    .limit(1);

  const isActive = (data?.length ?? 0) > 0;
  await cache.set(REDIS_KEY, isActive, CACHE_TTL);

  return isActive;
}

/**
 * Aktualisiert das is_active Flag für alle Sitzungswochen.
 * Aufgerufen vom täglichen Cron.
 */
export async function updateSitzungswochenStatus(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const today = new Date().toISOString().split('T')[0];

  // Deaktiviere abgelaufene
  await supabase
    .from('sitzungswochen')
    .update({ is_active: false })
    .lt('end_date', today);

  // Aktiviere aktuelle
  await supabase
    .from('sitzungswochen')
    .update({ is_active: true })
    .lte('start_date', today)
    .gte('end_date', today);

  // Invalidate cache
  await cache.del(REDIS_KEY);
}

/**
 * Importiert Sitzungswochen aus einer Liste von Datumsbereichen.
 * Für Admin-Nutzung.
 */
export async function importSitzungswochen(
  weeks: Array<{ start_date: string; end_date: string; label?: string }>,
): Promise<number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const rows = weeks.map((w) => ({
    start_date: w.start_date,
    end_date: w.end_date,
    label: w.label ?? null,
    is_active: false,
  }));

  const { data, error } = await supabase
    .from('sitzungswochen')
    .upsert(rows, { onConflict: 'start_date' })
    .select();

  if (error) {
    throw new Error(`Sitzungswochen import failed: ${error.message}`);
  }

  // Update active status
  await updateSitzungswochenStatus();

  return data?.length ?? 0;
}

/**
 * Gibt alle Sitzungswochen für ein Jahr zurück.
 */
export async function getSitzungswochen(year: number): Promise<Sitzungswoche[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from('sitzungswochen')
    .select('*')
    .gte('start_date', `${year}-01-01`)
    .lte('end_date', `${year}-12-31`)
    .order('start_date');

  if (error) {
    throw new Error(`Failed to fetch Sitzungswochen: ${error.message}`);
  }

  return (data ?? []) as Sitzungswoche[];
}
