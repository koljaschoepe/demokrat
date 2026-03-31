'use client';

import Link from 'next/link';
import {
  BarChart3,
  MessageCircle,
  Clock,
  Award,
  Flame,
  PlusCircle,
  Users,
  TrendingUp,
  Building2,
  Vote,
  Info,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NotificationItemProps {
  id: string;
  type:
    | 'vote_result'
    | 'comment_reply'
    | 'topic_closing'
    | 'badge_earned'
    | 'streak_reminder'
    | 'new_topic'
    | 'supporter_milestone'
    | 'privilege_upgrade'
    | 'sitzungswoche'
    | 'mdb_voted'
    | 'system';
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  href: string;
}

const TYPE_CONFIG: Record<
  NotificationItemProps['type'],
  { icon: LucideIcon; color: string; bg: string }
> = {
  vote_result: {
    icon: BarChart3,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  comment_reply: {
    icon: MessageCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  topic_closing: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  badge_earned: {
    icon: Award,
    color: 'text-yellow-600',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  streak_reminder: {
    icon: Flame,
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  new_topic: {
    icon: PlusCircle,
    color: 'text-green-600',
    bg: 'bg-green-100 dark:bg-green-900/30',
  },
  supporter_milestone: {
    icon: Users,
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  privilege_upgrade: {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  sitzungswoche: {
    icon: Building2,
    color: 'text-rose-600',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
  },
  mdb_voted: {
    icon: Vote,
    color: 'text-sky-600',
    bg: 'bg-sky-100 dark:bg-sky-900/30',
  },
  system: {
    icon: Info,
    color: 'text-gray-600',
    bg: 'bg-gray-100 dark:bg-gray-900/30',
  },
};

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Gerade eben';
  if (diffMinutes < 60)
    return `Vor ${diffMinutes} ${diffMinutes === 1 ? 'Minute' : 'Minuten'}`;
  if (diffHours < 24)
    return `Vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
  if (diffDays < 7)
    return `Vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Vor ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}`;
  }
  const months = Math.floor(diffDays / 30);
  return `Vor ${months} ${months === 1 ? 'Monat' : 'Monaten'}`;
}

export function NotificationItem({
  type,
  title,
  description,
  createdAt,
  isRead,
  href,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted/50',
        !isRead && 'bg-primary/5'
      )}
    >
      <div className="relative flex-shrink-0 pt-0.5">
        {!isRead && (
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
        )}
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-full',
            config.bg
          )}
        >
          <Icon className={cn('size-5', config.color)} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm leading-snug',
            !isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground'
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(createdAt)}
        </p>
      </div>
    </Link>
  );
}
