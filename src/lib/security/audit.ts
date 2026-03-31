import * as Sentry from '@sentry/nextjs';

interface SecurityEvent {
  type: string;
  userId?: string;
  ip?: string;
  details: string;
}

/** Log security-relevant events to console and Sentry */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Always log to console for server logs
  console.warn('[security]', JSON.stringify(logEntry));

  // Send to Sentry as a breadcrumb + message for alerting
  Sentry.addBreadcrumb({
    category: 'security',
    message: `${event.type}: ${event.details}`,
    level: 'warning',
    data: {
      userId: event.userId,
      ip: event.ip,
    },
  });

  // For critical events, capture as a Sentry message
  if (
    event.type === 'rate_limit_exceeded' ||
    event.type === 'unauthorized_access' ||
    event.type === 'suspicious_activity'
  ) {
    Sentry.captureMessage(`Security: ${event.type} — ${event.details}`, {
      level: 'warning',
      tags: { securityEvent: event.type },
      extra: { userId: event.userId, ip: event.ip },
    });
  }
}
