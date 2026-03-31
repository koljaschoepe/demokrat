import { NextResponse } from 'next/server';

/**
 * Allgemeiner Webhook-Endpoint.
 * Spezifische Webhooks (z.B. Supabase Auth) sind unter /api/webhooks/supabase-auth.
 * Dieser Endpoint leitet unbekannte Webhooks weiter oder lehnt sie ab.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return NextResponse.json(
      { error: 'Content-Type must be application/json' },
      { status: 415 },
    );
  }

  try {
    const payload = await request.json();

    // Log unknown webhook for debugging
    console.info('[Webhook] Received unknown webhook:', {
      type: payload.type ?? 'unknown',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { received: true, message: 'Webhook received. Use specific endpoints for supported integrations.' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { status: 'ok', endpoints: ['/api/webhooks/supabase-auth'] },
    { status: 200 },
  );
}
