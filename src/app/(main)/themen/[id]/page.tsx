import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { TopicDetailClient } from '@/components/topics/topic-detail-client';
import Link from 'next/link';

interface TopicPageProps {
  params: Promise<{ id: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = any;

async function getTopic(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('topics')
    .select('id, title, description')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as AnyRow;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return { title: 'Thema nicht gefunden' };
  }

  return {
    title: `${topic.title} — Demokrat`,
    description: topic.description
      ? (topic.description as string).slice(0, 160)
      : `Diskutiere und stimme ab: ${topic.title}`,
    openGraph: {
      title: topic.title as string,
      description: topic.description
        ? (topic.description as string).slice(0, 160)
        : `Diskutiere und stimme ab: ${topic.title}`,
    },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { id } = await params;
  const topic = await getTopic(id);

  if (!topic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-foreground">Thema nicht gefunden</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Das Thema existiert nicht oder wurde entfernt.
        </p>
        <Link
          href="/feed"
          className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          Zurück zum Feed
        </Link>
      </div>
    );
  }

  return <TopicDetailClient topicId={topic.id as string} />;
}
