'use client';

import { useState } from 'react';
import {
  Globe,
  ExternalLink,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NewsLink {
  url: string;
  title: string;
  source: string;
  publishedAt: string;
}

interface NewsContextProps {
  topicId: string;
  newsLinks?: NewsLink[];
}

const WHITELISTED_DOMAINS = [
  'tagesschau.de',
  'zeit.de',
  'spiegel.de',
  'faz.net',
  'sueddeutsche.de',
  'bundestag.de',
  'bpb.de',
  'deutschlandfunk.de',
];

function getDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Strip www. prefix for matching
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isWhitelisted(url: string): boolean {
  const domain = getDomain(url);
  return WHITELISTED_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}

function formatRelativeDate(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return 'Gerade eben';

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return 'Gerade eben';
  if (diffMinutes < 60)
    return `Vor ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`;

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24)
    return `Vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7)
    return `Vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4)
    return `Vor ${diffWeeks} ${diffWeeks === 1 ? 'Woche' : 'Wochen'}`;

  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function InAppBrowser({
  url,
  source,
  onClose,
}: {
  url: string;
  source: string;
  onClose: () => void;
}) {
  const domain = getDomain(url);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Schließen"
        >
          <X className="size-4" />
        </Button>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium">{source}</span>
          <span className="truncate text-xs text-muted-foreground">
            {domain}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
        >
          Im Browser öffnen
          <ExternalLink className="size-3" />
        </a>
      </div>
      {/* Iframe */}
      <iframe
        src={url}
        title={`${source} Artikel`}
        className="flex-1 border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}

function NewsLinkItem({
  link,
  onOpenInApp,
}: {
  link: NewsLink;
  onOpenInApp: (url: string, source: string) => void;
}) {
  const whitelisted = isWhitelisted(link.url);

  const handleClick = () => {
    if (whitelisted) {
      onOpenInApp(link.url, link.source);
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Globe className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-foreground">
          {link.title}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{link.source}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={link.publishedAt}>
            {formatRelativeDate(link.publishedAt)}
          </time>
        </div>
      </div>
      <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function NewsContext({ topicId: _topicId, newsLinks }: NewsContextProps) {
  const hasLinks = newsLinks && newsLinks.length > 0;
  const [isExpanded, setIsExpanded] = useState(hasLinks);
  const [browserState, setBrowserState] = useState<{
    url: string;
    source: string;
  } | null>(null);

  const handleOpenInApp = (url: string, source: string) => {
    setBrowserState({ url, source });
  };

  const handleCloseBrowser = () => {
    setBrowserState(null);
  };

  return (
    <>
      {browserState && (
        <InAppBrowser
          url={browserState.url}
          source={browserState.source}
          onClose={handleCloseBrowser}
        />
      )}

      <Card>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-indigo-600" />
            <h3 className="text-sm font-semibold">Hintergrund lesen</h3>
            {hasLinks && (
              <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                {newsLinks.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <CardContent className={cn('pt-0', !hasLinks && 'pb-4')}>
            {hasLinks ? (
              <div className="-mx-1 divide-y">
                {newsLinks.map((link) => (
                  <NewsLinkItem
                    key={link.url}
                    link={link}
                    onOpenInApp={handleOpenInApp}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Für dieses Thema sind noch keine Hintergrundquellen verfügbar.
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </>
  );
}
