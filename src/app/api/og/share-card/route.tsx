import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const FORMATS = {
  instagram: { width: 1080, height: 1920 }, // 9:16
  whatsapp: { width: 1080, height: 1080 }, // 1:1
  twitter: { width: 1200, height: 675 }, // 16:9
} as const;

type FormatKey = keyof typeof FORMATS;

/**
 * Phase 161 — "Ich habe abgestimmt" Share Card
 *
 * Generates personalized share cards in 3 formats.
 * URL: /api/og/share-card?title=xxx&choice=ja&format=twitter
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') ?? 'Ein wichtiges Thema';
  const choice = searchParams.get('choice') ?? 'ja';
  const format = (searchParams.get('format') ?? 'twitter') as FormatKey;

  const dimensions = FORMATS[format] ?? FORMATS.twitter;

  const choiceLabel = choice === 'ja' ? 'Ja' : choice === 'nein' ? 'Nein' : 'Enthaltung';
  const choiceColor = choice === 'ja' ? '#4f46e5' : choice === 'nein' ? '#9ca3af' : '#d1d5db';
  const isVertical = dimensions.height > dimensions.width;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: isVertical ? '120px 60px' : '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '40px',
            fontWeight: 700,
            marginBottom: '40px',
          }}
        >
          D
        </div>

        {/* Main text */}
        <div
          style={{
            fontSize: isVertical ? '64px' : '56px',
            fontWeight: 800,
            color: '#111827',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          Ich habe abgestimmt!
        </div>

        {/* Topic title */}
        <div
          style={{
            fontSize: isVertical ? '32px' : '28px',
            color: '#4b5563',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          {title}
        </div>

        {/* Choice badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 40px',
            borderRadius: '16px',
            backgroundColor: 'white',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: choiceColor,
            }}
          />
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
            Meine Stimme: {choiceLabel}
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: isVertical ? '120px' : '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px', color: '#6b7280' }}>
            Stimme auch ab auf
          </span>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#4f46e5' }}>
            demokrat.app
          </span>
        </div>
      </div>
    ),
    {
      width: dimensions.width,
      height: dimensions.height,
    },
  );
}
