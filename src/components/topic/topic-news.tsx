import { ExternalLink, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsLink {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

interface TopicNewsProps {
  newsLinks: NewsLink[];
  className?: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function TopicNews({ newsLinks, className }: TopicNewsProps) {
  if (newsLinks.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Newspaper className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Nachrichtenkontext
        </h3>
      </div>
      <ul className="space-y-2">
        {newsLinks.map((link, index) => (
          <li key={index}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 rounded-md p-2 transition-colors hover:bg-muted"
            >
              <ExternalLink className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-primary">
                  {link.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {link.source} &middot; {formatDate(link.published_at)}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
