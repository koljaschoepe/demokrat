import { useTranslations } from 'next-intl';

export default function FeedPage() {
  const t = useTranslations('feed');
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('empty')}</p>
    </div>
  );
}
