'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationList } from '@/components/notifications/notification-list';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <h1 className="text-xl font-bold">Benachrichtigungen</h1>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          <CheckCheck className="size-4" />
          Alle als gelesen markieren
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
          className={cn(
            'rounded-full',
            filter === 'all' && 'bg-primary/10 text-primary hover:bg-primary/20'
          )}
        >
          Alle
        </Button>
        <Button
          variant={filter === 'unread' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
          className={cn(
            'rounded-full',
            filter === 'unread' && 'bg-primary/10 text-primary hover:bg-primary/20'
          )}
        >
          Ungelesen
        </Button>
      </div>

      {/* Notification list */}
      <NotificationList filter={filter} />
    </div>
  );
}
