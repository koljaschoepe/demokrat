import { Metadata } from 'next';
import { TopicDetailClient } from '@/components/topics/topic-detail-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Thema | Demokrat`,
    description: `Thema ${id} auf Demokrat - Deine Stimme zählt.`,
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TopicDetailClient topicId={id} />;
}
