'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  NotificationItem,
  type NotificationItemProps,
} from '@/components/notifications/notification-item';

const MOCK_RECENT_NOTIFICATIONS: NotificationItemProps[] = [
  {
    id: '1',
    type: 'vote_result',
    title: 'Abstimmungsergebnis',
    description: 'Das Ergebnis zu "Cannabisgesetz" liegt vor.',
    createdAt: '2026-03-31T10:00:00Z',
    isRead: false,
    href: '/topic/1',
  },
  {
    id: '2',
    type: 'badge_earned',
    title: 'Neues Abzeichen!',
    description: 'Du hast das Abzeichen "Erste Stimme" erhalten.',
    createdAt: '2026-03-30T15:30:00Z',
    isRead: false,
    href: '/profile',
  },
  {
    id: '3',
    type: 'comment_reply',
    title: 'Neue Antwort',
    description: 'MaxMustermann hat auf deinen Kommentar geantwortet.',
    createdAt: '2026-03-30T12:00:00Z',
    isRead: true,
    href: '/topic/2',
  },
  {
    id: '4',
    type: 'streak_reminder',
    title: 'Streak-Erinnerung',
    description: 'Vergiss nicht, heute abzustimmen! Dein Streak: 7 Tage.',
    createdAt: '2026-03-30T08:00:00Z',
    isRead: true,
    href: '/feed',
  },
  {
    id: '5',
    type: 'sitzungswoche',
    title: 'Sitzungswoche!',
    description: 'Diese Woche tagt der Bundestag. Alle Stimmen zählen doppelt!',
    createdAt: '2026-03-29T06:00:00Z',
    isRead: true,
    href: '/feed',
  },
];

interface NotificationBellProps {
  unreadCount?: number;
}

export function NotificationBell({ unreadCount = 2 }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const displayCount =
    unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : null;

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ''}`}
      >
        <Bell className="size-5" />
        {displayCount && (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {displayCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-full max-w-sm min-w-[320px] overflow-hidden rounded-xl border bg-card shadow-lg"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Benachrichtigungen</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unreadCount} neu
              </span>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {MOCK_RECENT_NOTIFICATIONS.map((notification) => (
              <div key={notification.id} onClick={() => setIsOpen(false)}>
                <NotificationItem {...notification} />
              </div>
            ))}
          </div>
          <div className="border-t px-4 py-3">
            <Link
              href="/notifications"
              className="block text-center text-sm font-medium text-primary hover:underline"
              onClick={() => setIsOpen(false)}
            >
              Alle anzeigen
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
