'use client';

import {
  NotificationItem,
  type NotificationItemProps,
} from '@/components/notifications/notification-item';
import { NotificationsEmptyState } from '@/components/shared/empty-state';

const MOCK_NOTIFICATIONS: NotificationItemProps[] = [
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
    description:
      'Vergiss nicht, heute abzustimmen! Dein Streak: 7 Tage.',
    createdAt: '2026-03-30T08:00:00Z',
    isRead: true,
    href: '/feed',
  },
  {
    id: '5',
    type: 'sitzungswoche',
    title: 'Sitzungswoche!',
    description:
      'Diese Woche tagt der Bundestag. Alle Stimmen zählen doppelt!',
    createdAt: '2026-03-29T06:00:00Z',
    isRead: true,
    href: '/feed',
  },
  {
    id: '6',
    type: 'topic_closing',
    title: 'Abstimmung endet bald',
    description: '"Tempolimit auf Autobahnen" endet in 24 Stunden.',
    createdAt: '2026-03-28T18:00:00Z',
    isRead: true,
    href: '/topic/2',
  },
  {
    id: '7',
    type: 'new_topic',
    title: 'Neues Thema',
    description:
      'Ein neues Bundestag-Thema wurde hinzugefügt: "Wehrpflicht-Debatte"',
    createdAt: '2026-03-28T10:00:00Z',
    isRead: true,
    href: '/topic/5',
  },
  {
    id: '8',
    type: 'mdb_voted',
    title: 'Dein Abgeordneter hat abgestimmt',
    description:
      'Max Müller (SPD, WK 42) hat zum Cannabisgesetz abgestimmt.',
    createdAt: '2026-03-27T14:00:00Z',
    isRead: true,
    href: '/topic/1',
  },
];

interface NotificationListProps {
  filter: 'all' | 'unread';
}

export function NotificationList({ filter }: NotificationListProps) {
  const notifications =
    filter === 'unread'
      ? MOCK_NOTIFICATIONS.filter((n) => !n.isRead)
      : MOCK_NOTIFICATIONS;

  if (notifications.length === 0) {
    return <NotificationsEmptyState />;
  }

  return (
    <div className="flex flex-col gap-1">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} {...notification} />
      ))}
    </div>
  );
}
