import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ResultsView } from '@/components/voting/results-view';
import { ResultShareBar } from '@/components/voting/result-share-bar';
import { Badge } from '@/components/ui/badge';

interface ErgebnisPageProps {
  params: Promise<{ id: string }>;
}

interface TopicRow {
  id: string;
  title: string;
  status: string;
  voting_format: string | null;
  vote_count: number;
}

/** Fetch topic data server-side */
async function getTopic(id: string): Promise<TopicRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topics')
    .select('id, title, status, voting_format, vote_count')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as unknown as TopicRow;
}

export async function generateMetadata({
  params,
}: ErgebnisPageProps): Promise<Metadata> {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return { title: 'Ergebnis nicht gefunden' };
  }

  return {
    title: `Ergebnis: ${topic.title} — Demokrat`,
    description: `Abstimmungsergebnis für "${topic.title}" — Bürgervotum und Vergleich mit dem Bundestag.`,
    openGraph: {
      title: `Ergebnis: ${topic.title}`,
      description: `Abstimmungsergebnis für "${topic.title}" — Bürgervotum und Vergleich mit dem Bundestag.`,
      images: [
        {
          url: `/api/og/vote-result?id=${id}&title=${encodeURIComponent(topic.title)}`,
          width: 1200,
          height: 630,
          alt: `Abstimmungsergebnis: ${topic.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Ergebnis: ${topic.title}`,
      description: `Abstimmungsergebnis für "${topic.title}"`,
      images: [`/api/og/vote-result?id=${id}&title=${encodeURIComponent(topic.title)}`],
    },
  };
}

/** Status label mapping */
function statusLabel(status: string): string {
  switch (status) {
    case 'voting':
      return 'Abstimmung läuft';
    case 'closed':
      return 'Abgeschlossen';
    case 'draft':
      return 'Entwurf';
    default:
      return status;
  }
}

export default async function ErgebnisPage({ params }: ErgebnisPageProps) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Thema nicht gefunden
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Das Thema existiert nicht oder wurde entfernt.
        </p>
        <Link
          href="/themen"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/themen/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <span aria-hidden="true">&larr;</span>
          Zurück zum Thema
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {topic.title}
          </h1>
          <Badge variant="secondary">{statusLabel(topic.status)}</Badge>
        </div>
      </div>

      {/* Share bar */}
      <ResultShareBar topicId={id} topicTitle={topic.title} className="mb-6" />

      {/* Client-side results view with realtime updates */}
      <ResultsView topicId={id} topicTitle={topic.title} />
    </div>
  );
}
