import Link from 'next/link';
import {
  ArrowLeft,
  Clock,
  Landmark,
  MessageSquare,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TopicHeaderProps {
  title: string;
  category: string;
  tags: string[];
  source: 'BUNDESTAG' | 'BUERGER';
  status: 'draft' | 'pending' | 'active' | 'voting_closed' | 'archived';
  voteCount: number;
  commentCount: number;
  supporterCount: number;
  closesAt: string | null;
  bundetagVorgangId?: string | null;
}

function formatTimeRemaining(closesAt: string): string {
  const now = new Date();
  const end = new Date(closesAt);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return 'Abgelaufen';

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} Tag${days !== 1 ? 'e' : ''} ${hours} Std. verbleibend`;
  if (hours > 0) return `${hours} Std. verbleibend`;

  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} Min. verbleibend`;
}

export function TopicHeader({
  title,
  category,
  tags,
  source,
  status,
  voteCount,
  commentCount,
  supporterCount,
  closesAt,
  bundetagVorgangId,
}: TopicHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Back button */}
      <Link
        href="/feed"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Zurück
      </Link>

      {/* Source badge */}
      <div className="flex items-center gap-2">
        <Badge
          variant={source === 'BUNDESTAG' ? 'default' : 'secondary'}
          className={cn(
            source === 'BUNDESTAG' && 'bg-primary text-primary-foreground',
            source === 'BUERGER' && 'bg-muted text-muted-foreground'
          )}
        >
          {source === 'BUNDESTAG' ? (
            <>
              <Landmark className="size-3" />
              Bundestag
            </>
          ) : (
            'Bürger'
          )}
        </Badge>
        {status === 'active' && (
          <Badge variant="outline" className="border-green-500 text-green-600">
            Aktiv
          </Badge>
        )}
        {status === 'voting_closed' && (
          <Badge variant="outline" className="border-gray-400 text-gray-500">
            Beendet
          </Badge>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-foreground">{title}</h1>

      {/* Category + tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{category}</Badge>
        {tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ThumbsUp className="size-3.5" />
          {voteCount.toLocaleString('de-DE')} Stimmen
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="size-3.5" />
          {commentCount} Kommentare
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="size-3.5" />
          {supporterCount} Unterstützer
        </span>
      </div>

      {/* Time remaining */}
      {closesAt && status === 'active' && (
        <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          {formatTimeRemaining(closesAt)}
        </div>
      )}

      {/* Bundestag Vorgang link */}
      {bundetagVorgangId && (
        <div className="text-sm text-muted-foreground">
          BT-Vorgang:{' '}
          <span className="font-medium text-foreground">{bundetagVorgangId}</span>
        </div>
      )}
    </div>
  );
}
