import { NextResponse } from 'next/server';

/**
 * Cron-Job Index-Endpoint.
 * Listet alle verfuegbaren Cron-Jobs auf.
 * Einzelne Cron-Jobs sind unter /api/cron/[name] erreichbar.
 */

const CRON_JOBS = [
  { name: 'sync-bundestag', schedule: '0 3 * * *', description: 'Bundestag-Daten synchronisieren' },
  { name: 'check-sitzungswoche', schedule: '0 6 * * 1', description: 'Sitzungswoche prüfen' },
  { name: 'close-votes', schedule: '*/15 * * * *', description: 'Abgelaufene Abstimmungen schließen' },
  { name: 'update-search', schedule: '*/30 * * * *', description: 'Suchindex aktualisieren' },
  { name: 'streaks', schedule: '0 0 * * *', description: 'Nutzer-Streaks aktualisieren' },
  { name: 'session-content', schedule: '0 5 * * *', description: 'Session-Inhalte generieren' },
  { name: 'platform-metrics', schedule: '0 */6 * * *', description: 'Plattform-Metriken aktualisieren' },
  { name: 'wahlkreis-stats', schedule: '0 4 * * *', description: 'Wahlkreis-Statistiken aktualisieren' },
  { name: 'bridging', schedule: '0 2 * * *', description: 'Bridging-Scores berechnen' },
  { name: 'comment-counts', schedule: '*/10 * * * *', description: 'Kommentar-Zähler aktualisieren' },
  { name: 'weekly-digest', schedule: '0 8 * * 1', description: 'Wöchentlichen Digest versenden' },
  { name: 'health-check', schedule: '*/5 * * * *', description: 'System-Gesundheitscheck' },
  { name: 'preload-bundestag', schedule: '0 4 * * *', description: 'Bundestag-Daten vorladen' },
];

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Nur mit gueltigem Secret oder in Development
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    status: 'ok',
    cron_jobs: CRON_JOBS,
    total: CRON_JOBS.length,
  });
}
