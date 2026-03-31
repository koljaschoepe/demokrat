'use client';

import Link from 'next/link';
import {
  Inbox,
  SearchX,
  MessageCircle,
  BellOff,
  Vote,
  MapPin,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <Icon className="size-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button
          className="mt-6"
          size="lg"
          render={<Link href={action.href} />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function FeedEmptyState() {
  return (
    <EmptyState
      icon={Inbox}
      title="Noch keine Themen"
      description="Es gibt noch keine Themen im Feed. Erstelle das erste Thema!"
      action={{ label: 'Thema erstellen', href: '/create' }}
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={SearchX}
      title={`Keine Ergebnisse für "${query}"`}
      description="Versuche es mit anderen Suchbegriffen."
    />
  );
}

export function CommentsEmptyState() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="Noch keine Kommentare"
      description="Sei der Erste, der einen Kommentar schreibt!"
    />
  );
}

export function NotificationsEmptyState() {
  return (
    <EmptyState
      icon={BellOff}
      title="Keine Benachrichtigungen"
      description="Du bist auf dem neuesten Stand!"
    />
  );
}

export function ProfileVotesEmptyState() {
  return (
    <EmptyState
      icon={Vote}
      title="Noch keine Abstimmungen"
      description="Du hast noch an keiner Abstimmung teilgenommen."
      action={{ label: 'Zum Feed', href: '/feed' }}
    />
  );
}

export function WahlkreisEmptyState() {
  return (
    <EmptyState
      icon={MapPin}
      title="Kein Wahlkreis ausgewählt"
      description="Wähle deinen Wahlkreis in den Einstellungen aus."
      action={{ label: 'Einstellungen', href: '/profile/settings' }}
    />
  );
}

export function StreakEmptyState() {
  return (
    <EmptyState
      icon={Flame}
      title="Starte deinen Streak!"
      description="Nimm täglich an einer Abstimmung teil, um deinen Streak aufzubauen."
      action={{ label: 'Zum Feed', href: '/feed' }}
    />
  );
}
