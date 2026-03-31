/**
 * Phase 151 -- Email Service (Resend HTTP API)
 *
 * Versendet transaktionale Emails ueber die Resend API.
 * Kein npm-Paket — nutzt direkten fetch-Aufruf.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const EMAIL_FROM = 'Demokrat <noreply@demokrat.app>';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  id: string;
}

/**
 * Versendet eine Email ueber die Resend API.
 *
 * @returns Objekt mit der Resend-Message-ID oder null bei Fehler.
 */
export async function sendEmail(
  params: SendEmailParams,
): Promise<SendEmailResult | null> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('[email] RESEND_API_KEY ist nicht konfiguriert');
    return null;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: params.from ?? EMAIL_FROM,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[email] Resend API Fehler:', response.status, errorBody);
      return null;
    }

    const data = (await response.json()) as { id: string };
    return { id: data.id };
  } catch (err) {
    console.error('[email] sendEmail fehlgeschlagen:', err);
    return null;
  }
}
