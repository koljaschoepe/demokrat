import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  return {
    locale: 'de',
    messages: (await import('@/messages/de.json')).default,
    timeZone: 'Europe/Berlin',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
        long: {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        },
      },
      number: {
        decimal: {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
        integer: {
          style: 'decimal',
          maximumFractionDigits: 0,
        },
      },
    },
  };
});
