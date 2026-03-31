export const siteConfig = {
  name: 'Demokrat',
  description: 'Digitale Demokratie-Plattform für politische Teilhabe',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;
