import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Phase 161 — Vote Result OG Image
 *
 * Generates a 1200x630 OG image for vote result sharing.
 * URL: /api/og/vote-result?id=xxx&title=xxx&ja=60&nein=30&enthaltung=10
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') ?? 'Abstimmungsergebnis';
  const ja = parseInt(searchParams.get('ja') ?? '0', 10);
  const nein = parseInt(searchParams.get('nein') ?? '0', 10);
  const enthaltung = parseInt(searchParams.get('enthaltung') ?? '0', 10);
  const total = ja + nein + enthaltung;

  const jaPercent = total > 0 ? Math.round((ja / total) * 100) : 0;
  const neinPercent = total > 0 ? Math.round((nein / total) * 100) : 0;
  const enthaltungPercent = total > 0 ? Math.round((enthaltung / total) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafafa',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            D
          </div>
          <span style={{ fontSize: '24px', color: '#6b7280' }}>Demokrat</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '42px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1.2,
            marginBottom: '40px',
            maxWidth: '900px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </div>

        {/* Result bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {/* Ja */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ width: '120px', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
              Ja
            </span>
            <div
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${jaPercent}%`,
                  height: '100%',
                  backgroundColor: '#4f46e5',
                  borderRadius: '8px',
                }}
              />
            </div>
            <span style={{ width: '80px', fontSize: '24px', fontWeight: 700, color: '#4f46e5', textAlign: 'right' }}>
              {jaPercent}%
            </span>
          </div>

          {/* Nein */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ width: '120px', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
              Nein
            </span>
            <div
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${neinPercent}%`,
                  height: '100%',
                  backgroundColor: '#9ca3af',
                  borderRadius: '8px',
                }}
              />
            </div>
            <span style={{ width: '80px', fontSize: '24px', fontWeight: 700, color: '#6b7280', textAlign: 'right' }}>
              {neinPercent}%
            </span>
          </div>

          {/* Enthaltung */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ width: '120px', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
              Enthaltung
            </span>
            <div
              style={{
                flex: 1,
                height: '40px',
                backgroundColor: '#e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${enthaltungPercent}%`,
                  height: '100%',
                  backgroundColor: '#d1d5db',
                  borderRadius: '8px',
                }}
              />
            </div>
            <span style={{ width: '80px', fontSize: '24px', fontWeight: 700, color: '#9ca3af', textAlign: 'right' }}>
              {enthaltungPercent}%
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '2px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: '18px', color: '#6b7280' }}>
            {total.toLocaleString('de-DE')} Stimmen
          </span>
          <span style={{ fontSize: '18px', color: '#4f46e5', fontWeight: 600 }}>
            demokrat.app
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
