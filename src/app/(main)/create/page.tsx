import { Metadata } from 'next';
import { CreateTopicForm } from '@/components/create/create-topic-form';

export const metadata: Metadata = {
  title: 'Thema erstellen — Demokrat',
};

export default function CreatePage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Thema erstellen</h1>
      <CreateTopicForm />
    </div>
  );
}
