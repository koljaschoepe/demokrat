import { z } from 'zod/v4';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

/**
 * Beratungsstand zu Timeline-Stage Mapping
 */
function beratungsstandToStage(beratungsstand: string | null): number {
  if (!beratungsstand) return 0;
  const lower = beratungsstand.toLowerCase();
  if (lower.includes('verkündet') || lower.includes('abgeschlossen')) return 4;
  if (lower.includes('2. beratung') || lower.includes('3. beratung')) return 3;
  if (lower.includes('ausschuss') || lower.includes('beschlussempfehlung')) return 2;
  if (lower.includes('1. beratung')) return 1;
  return 0;
}

export const bundestagRouter = router({
  /**
   * Paginierte Liste von Bundestagsvorgängen mit optionaler Topic-Verknüpfung
   */
  vorgaenge: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        category: z.string().optional(),
        vorgangstyp: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, category, vorgangstyp, search } = input;
      const supabase = ctx.supabase;

      // Basis-Query: Vorgänge mit optionalem Topic-Join
      let query = supabase
        .from('bundestag_vorgaenge')
        .select(
          `
          *,
          topics (
            id,
            title,
            status,
            vote_count,
            comment_count,
            category,
            voting_opens_at,
            voting_closes_at
          )
        `,
          { count: 'exact' },
        )
        .order('datum', { ascending: false })
        .limit(limit + 1);

      // Cursor-basierte Paginierung über Datum + ID
      if (cursor) {
        const [cursorDate, cursorId] = cursor.split('::');
        query = query.or(
          `datum.lt.${cursorDate},and(datum.eq.${cursorDate},id.lt.${cursorId})`,
        );
      }

      // Filter: Sachgebiet / Kategorie
      if (category) {
        query = query.contains('sachgebiet', [category]);
      }

      // Filter: Vorgangstyp
      if (vorgangstyp) {
        query = query.eq('vorgangstyp', vorgangstyp);
      }

      // Volltextsuche über Titel und Abstract
      if (search && search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        query = query.or(`titel.ilike.${term},abstract.ilike.${term}`);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden der Vorgänge: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      // Nächsten Cursor berechnen
      let nextCursor: string | null = null;
      if (hasMore && items.length > 0) {
        const last = items[items.length - 1];
        nextCursor = `${last.datum}::${last.id}`;
      }

      return {
        items: items.map((item: AnyRow) => ({
          id: item.id as string,
          dipId: item.dip_id as string,
          titel: item.titel as string | null,
          abstract: item.abstract as string | null,
          sachgebiet: item.sachgebiet as string[] | null,
          vorgangstyp: item.vorgangstyp as string | null,
          beratungsstand: item.beratungsstand as string | null,
          initiative: item.initiative as string[] | null,
          datum: item.datum as string | null,
          deskriptor: item.deskriptor as string[] | null,
          stage: beratungsstandToStage(item.beratungsstand),
          topic: item.topics
            ? {
                id: item.topics.id as string,
                title: item.topics.title as string | null,
                status: item.topics.status as string | null,
                voteCount: (item.topics.vote_count ?? 0) as number,
                commentCount: (item.topics.comment_count ?? 0) as number,
                category: item.topics.category as string | null,
                votingOpensAt: item.topics.voting_opens_at as string | null,
                votingClosesAt: item.topics.voting_closes_at as string | null,
              }
            : null,
        })),
        nextCursor,
      };
    }),

  /**
   * Einzelner Vorgang mit allen Relationen (Topic, News-Links, Abstimmungen)
   */
  vorgang: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = ctx.supabase;

      const { data, error } = await supabase
        .from('bundestag_vorgaenge')
        .select(
          `
          *,
          topics (
            *,
            topic_news_links (*)
          )
        `,
        )
        .eq('id', input.id)
        .single();

      if (error || !data) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vorgang nicht gefunden',
        });
      }

      const row = data as AnyRow;

      // Abstimmungen separat laden, da sie über topic_id verknüpft sind
      let abstimmungen: AnyRow[] = [];
      if (row.topic_id) {
        const { data: abstData } = await supabase
          .from('bundestag_abstimmungen')
          .select('*')
          .eq('topic_id', row.topic_id)
          .order('datum', { ascending: false });
        abstimmungen = (abstData ?? []) as AnyRow[];
      }

      return {
        id: row.id as string,
        dipId: row.dip_id as string,
        titel: row.titel as string | null,
        abstract: row.abstract as string | null,
        sachgebiet: row.sachgebiet as string[] | null,
        vorgangstyp: row.vorgangstyp as string | null,
        beratungsstand: row.beratungsstand as string | null,
        initiative: row.initiative as string[] | null,
        datum: row.datum as string | null,
        deskriptor: row.deskriptor as string[] | null,
        aktualisiert: row.aktualisiert as string | null,
        rawData: row.raw_data,
        stage: beratungsstandToStage(row.beratungsstand),
        topic: row.topics
          ? {
              id: row.topics.id as string,
              title: row.topics.title as string | null,
              description: row.topics.description as string | null,
              summary: row.topics.summary as string | null,
              status: row.topics.status as string | null,
              category: row.topics.category as string | null,
              voteCount: (row.topics.vote_count ?? 0) as number,
              commentCount: (row.topics.comment_count ?? 0) as number,
              votingOpensAt: row.topics.voting_opens_at as string | null,
              votingClosesAt: row.topics.voting_closes_at as string | null,
              newsLinks: (row.topics.topic_news_links ?? []).map(
                (link: AnyRow) => ({
                  id: link.id as string,
                  sourceName: link.source_name as string | null,
                  sourceIcon: link.source_icon as string | null,
                  title: link.title as string | null,
                  url: link.url as string | null,
                  publishedAt: link.published_at as string | null,
                }),
              ),
            }
          : null,
        abstimmungen: abstimmungen.map((a: AnyRow) => ({
          id: a.id as string,
          titel: a.titel as string | null,
          datum: a.datum as string | null,
          ergebnis: a.ergebnis,
          fieldIntro: a.field_intro as string | null,
          fieldAccepted: a.field_accepted as boolean | null,
        })),
      };
    }),

  /**
   * Paginierte Liste von Abgeordneten (MdBs)
   */
  mdbList: publicProcedure
    .input(
      z.object({
        fraktion: z.string().optional(),
        wahlkreisId: z.number().optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { fraktion, wahlkreisId, search, cursor, limit } = input;
      const supabase = ctx.supabase;

      let query = supabase
        .from('bundestag_mdb')
        .select('*', { count: 'exact' })
        .order('nachname', { ascending: true })
        .order('id', { ascending: true })
        .limit(limit + 1);

      if (cursor) {
        const [cursorName, cursorId] = cursor.split('::');
        query = query.or(
          `nachname.gt.${cursorName},and(nachname.eq.${cursorName},id.gt.${cursorId})`,
        );
      }

      if (fraktion) {
        query = query.eq('fraktion', fraktion);
      }

      if (wahlkreisId) {
        query = query.eq('wahlkreis_id', wahlkreisId);
      }

      if (search && search.trim().length > 0) {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},vorname.ilike.${term},nachname.ilike.${term}`);
      }

      const { data, error } = await query;

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden der Abgeordneten: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];
      const hasMore = rows.length > limit;
      const items = hasMore ? rows.slice(0, limit) : rows;

      let nextCursor: string | null = null;
      if (hasMore && items.length > 0) {
        const last = items[items.length - 1];
        nextCursor = `${last.nachname}::${last.id}`;
      }

      return {
        items: items.map((mdb: AnyRow) => ({
          id: mdb.id as string,
          name: mdb.name as string,
          vorname: mdb.vorname as string | null,
          nachname: mdb.nachname as string | null,
          fraktion: mdb.fraktion as string | null,
          wahlkreisId: mdb.wahlkreis_id as number | null,
          wahlkreisName: mdb.wahlkreis_name as string | null,
          fotoUrl: mdb.foto_url as string | null,
        })),
        nextCursor,
      };
    }),

  /**
   * Einzelner Abgeordneter mit Abstimmungshistorie
   */
  mdb: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const supabase = ctx.supabase;

      // MdB-Basisdaten laden
      const { data: mdb, error: mdbError } = await supabase
        .from('bundestag_mdb')
        .select('*')
        .eq('id', input.id)
        .single();

      if (mdbError || !mdb) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Abgeordneter nicht gefunden',
        });
      }

      const row = mdb as AnyRow;

      // Abstimmungshistorie laden (MdB-Votes mit Abstimmungs-Details)
      const { data: votes } = await supabase
        .from('mdb_votes')
        .select(
          `
          id,
          vote,
          bundestag_abstimmungen (
            id,
            titel,
            datum,
            ergebnis,
            field_accepted
          )
        `,
        )
        .eq('mdb_id', input.id)
        .order('id', { ascending: false })
        .limit(50);

      const voteRows = (votes ?? []) as AnyRow[];

      return {
        id: row.id as string,
        dipPersonId: row.dip_person_id as string | null,
        abgeordnetenwatchId: row.abgeordnetenwatch_id as string | null,
        name: row.name as string,
        vorname: row.vorname as string | null,
        nachname: row.nachname as string | null,
        fraktion: row.fraktion as string | null,
        wahlkreisId: row.wahlkreis_id as number | null,
        wahlkreisName: row.wahlkreis_name as string | null,
        fotoUrl: row.foto_url as string | null,
        votes: voteRows.map((v: AnyRow) => ({
          id: v.id as string,
          vote: v.vote as 'ja' | 'nein' | 'enthaltung' | 'nicht_abgegeben',
          abstimmung: v.bundestag_abstimmungen
            ? {
                id: v.bundestag_abstimmungen.id as string,
                titel: v.bundestag_abstimmungen.titel as string | null,
                datum: v.bundestag_abstimmungen.datum as string | null,
                ergebnis: v.bundestag_abstimmungen.ergebnis,
                fieldAccepted: v.bundestag_abstimmungen.field_accepted as boolean | null,
              }
            : null,
        })),
      };
    }),

  /**
   * Abgeordnete eines Wahlkreises finden
   */
  mdbByWahlkreis: publicProcedure
    .input(z.object({ wahlkreisId: z.number() }))
    .query(async ({ ctx, input }) => {
      const supabase = ctx.supabase;

      const { data, error } = await supabase
        .from('bundestag_mdb')
        .select('*')
        .eq('wahlkreis_id', input.wahlkreisId)
        .order('nachname', { ascending: true });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Fehler beim Laden der Wahlkreis-Abgeordneten: ${error.message}`,
        });
      }

      const rows = (data ?? []) as AnyRow[];

      return rows.map((mdb: AnyRow) => ({
        id: mdb.id as string,
        name: mdb.name as string,
        vorname: mdb.vorname as string | null,
        nachname: mdb.nachname as string | null,
        fraktion: mdb.fraktion as string | null,
        wahlkreisId: mdb.wahlkreis_id as number | null,
        wahlkreisName: mdb.wahlkreis_name as string | null,
        fotoUrl: mdb.foto_url as string | null,
      }));
    }),

  /**
   * Alle Fraktionen mit Anzahl der Abgeordneten
   */
  fraktionen: publicProcedure.query(async ({ ctx }) => {
    const supabase = ctx.supabase;

    // Distinct Fraktionen mit Count ermitteln
    const { data, error } = await supabase
      .from('bundestag_mdb')
      .select('fraktion');

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Fehler beim Laden der Fraktionen: ${error.message}`,
      });
    }

    const rows = (data ?? []) as AnyRow[];

    // Fraktionen zählen und gruppieren
    const counts = new Map<string, number>();
    for (const row of rows) {
      const f = (row.fraktion as string | null) ?? 'Fraktionslos';
      counts.set(f, (counts.get(f) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([fraktion, count]) => ({ fraktion, count }))
      .sort((a, b) => b.count - a.count);
  }),
});
