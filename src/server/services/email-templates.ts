/**
 * Phase 151 -- Email Templates
 *
 * 9 transaktionale Email-Vorlagen mit Inline-CSS.
 * Alle Templates sind email-client-kompatibel (Tabellen-Layout).
 */

// ---------------------------------------------------------------------------
// Gemeinsames Layout
// ---------------------------------------------------------------------------

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demokrat</title>
</head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1f2937;line-height:1.6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<!-- Header -->
<tr><td style="background-color:#4f46e5;padding:24px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Demokrat</td></tr>
</table>
</td></tr>
<!-- Content -->
<tr><td style="padding:32px;">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e5e7eb;background-color:#f9fafb;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="color:#6b7280;font-size:13px;text-align:center;">
Demokrat &mdash; Deine Stimme z&auml;hlt<br>
<span style="font-size:12px;">Du erh&auml;ltst diese Email, weil du ein Demokrat-Konto hast.<br>
E-Mail-Einstellungen kannst du jederzeit in deinem Profil &auml;ndern.</span>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
<tr><td style="background-color:#4f46e5;border-radius:8px;">
<a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${text}</a>
</td></tr>
</table>`;
}

// ---------------------------------------------------------------------------
// Template-Interface
// ---------------------------------------------------------------------------

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// ---------------------------------------------------------------------------
// 1. Willkommen
// ---------------------------------------------------------------------------

export function welcomeEmail(name: string): EmailTemplate {
  const subject = 'Willkommen bei Demokrat!';
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Sch&ouml;n, dass du dabei bist! Bei Demokrat kannst du &uuml;ber aktuelle politische Themen abstimmen und deine Meinung mit den Entscheidungen des Bundestags vergleichen.</p>
<p style="margin:0 0 16px;font-size:15px;"><strong>So startest du am besten:</strong></p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
<tr><td style="padding:4px 0;font-size:15px;">1. Schau dir die aktuellen Abstimmungen an</td></tr>
<tr><td style="padding:4px 0;font-size:15px;">2. Gib deine erste Stimme ab</td></tr>
<tr><td style="padding:4px 0;font-size:15px;">3. Vergleiche dein Ergebnis mit dem Bundestag</td></tr>
</table>
${ctaButton('Jetzt loslegen', 'https://demokrat.app/topics')}
<p style="margin:0;font-size:15px;color:#6b7280;">Viel Spa&szlig; beim Mitbestimmen!</p>
`);
  const text = `Hallo ${name},

Schön, dass du dabei bist! Bei Demokrat kannst du über aktuelle politische Themen abstimmen und deine Meinung mit den Entscheidungen des Bundestags vergleichen.

So startest du am besten:
1. Schau dir die aktuellen Abstimmungen an
2. Gib deine erste Stimme ab
3. Vergleiche dein Ergebnis mit dem Bundestag

Jetzt loslegen: https://demokrat.app/topics

Viel Spaß beim Mitbestimmen!

--
Demokrat — Deine Stimme zählt
E-Mail-Einstellungen kannst du jederzeit in deinem Profil ändern.`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 2. Verifizierung
// ---------------------------------------------------------------------------

export function verificationEmail(name: string, code: string): EmailTemplate {
  const subject = 'Dein Verifizierungscode';
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Bitte gib den folgenden Code ein, um deine E-Mail-Adresse zu best&auml;tigen:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="background-color:#f3f4f6;border-radius:8px;padding:16px 32px;text-align:center;">
<span style="font-size:32px;font-weight:700;letter-spacing:0.15em;color:#4f46e5;">${code}</span>
</td></tr>
</table>
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Der Code ist 15 Minuten g&uuml;ltig.</p>
<p style="margin:0;font-size:14px;color:#6b7280;">Falls du diese Verifizierung nicht angefordert hast, kannst du diese Email ignorieren.</p>
`);
  const text = `Hallo ${name},

Bitte gib den folgenden Code ein, um deine E-Mail-Adresse zu bestätigen:

${code}

Der Code ist 15 Minuten gültig.

Falls du diese Verifizierung nicht angefordert hast, kannst du diese Email ignorieren.

--
Demokrat — Deine Stimme zählt`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 3. Magic Link
// ---------------------------------------------------------------------------

export function magicLinkEmail(name: string, link: string): EmailTemplate {
  const subject = 'Dein Anmeldelink';
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Klicke auf den Button, um dich bei Demokrat anzumelden:</p>
${ctaButton('Jetzt anmelden', link)}
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Oder kopiere diesen Link in deinen Browser:</p>
<p style="margin:0 0 16px;font-size:13px;color:#4f46e5;word-break:break-all;">${link}</p>
<p style="margin:0;font-size:14px;color:#6b7280;">Der Link ist 30 Minuten g&uuml;ltig. Falls du die Anmeldung nicht angefordert hast, kannst du diese Email ignorieren.</p>
`);
  const text = `Hallo ${name},

Klicke auf den folgenden Link, um dich bei Demokrat anzumelden:

${link}

Der Link ist 30 Minuten gültig. Falls du die Anmeldung nicht angefordert hast, kannst du diese Email ignorieren.

--
Demokrat — Deine Stimme zählt`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 4. Passwort zuruecksetzen
// ---------------------------------------------------------------------------

export function passwordResetEmail(name: string, link: string): EmailTemplate {
  const subject = 'Passwort zurücksetzen';
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Du hast eine Passwort-Zur&uuml;cksetzung angefordert. Klicke auf den Button, um ein neues Passwort zu w&auml;hlen:</p>
${ctaButton('Passwort zurücksetzen', link)}
<p style="margin:0 0 8px;font-size:14px;color:#6b7280;">Oder kopiere diesen Link in deinen Browser:</p>
<p style="margin:0 0 16px;font-size:13px;color:#4f46e5;word-break:break-all;">${link}</p>
<p style="margin:0;font-size:14px;color:#6b7280;">Der Link ist 60 Minuten g&uuml;ltig. Falls du diese Zur&uuml;cksetzung nicht angefordert hast, kannst du diese Email ignorieren — dein Passwort bleibt unver&auml;ndert.</p>
`);
  const text = `Hallo ${name},

Du hast eine Passwort-Zurücksetzung angefordert. Klicke auf den folgenden Link, um ein neues Passwort zu wählen:

${link}

Der Link ist 60 Minuten gültig. Falls du diese Zurücksetzung nicht angefordert hast, kannst du diese Email ignorieren — dein Passwort bleibt unverändert.

--
Demokrat — Deine Stimme zählt`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 5. Woechentlicher Digest
// ---------------------------------------------------------------------------

export interface WeeklyDigestStats {
  votesThisWeek: number;
  topTopics: Array<{ title: string; voteCount: number }>;
  streakDays: number;
}

export function weeklyDigestEmail(
  name: string,
  stats: WeeklyDigestStats,
): EmailTemplate {
  const subject = 'Dein wöchentlicher Überblick';

  const topicsHtml = stats.topTopics
    .map(
      (t) =>
        `<tr><td style="padding:8px 0;font-size:14px;border-bottom:1px solid #f3f4f6;">${t.title}</td><td style="padding:8px 0 8px 16px;font-size:14px;border-bottom:1px solid #f3f4f6;text-align:right;color:#4f46e5;font-weight:600;">${t.voteCount} Stimmen</td></tr>`,
    )
    .join('\n');

  const topicsText = stats.topTopics
    .map((t) => `  - ${t.title} (${t.voteCount} Stimmen)`)
    .join('\n');

  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 24px;font-size:15px;">Hier ist dein w&ouml;chentlicher &Uuml;berblick:</p>

<!-- Stats -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr>
<td style="background-color:#eef2ff;border-radius:8px;padding:16px;text-align:center;width:50%;">
<div style="font-size:28px;font-weight:700;color:#4f46e5;">${stats.votesThisWeek}</div>
<div style="font-size:13px;color:#6b7280;margin-top:4px;">Abstimmungen</div>
</td>
<td style="width:12px;"></td>
<td style="background-color:#eef2ff;border-radius:8px;padding:16px;text-align:center;width:50%;">
<div style="font-size:28px;font-weight:700;color:#4f46e5;">${stats.streakDays}</div>
<div style="font-size:13px;color:#6b7280;margin-top:4px;">Tage Streak</div>
</td>
</tr>
</table>

${
  stats.topTopics.length > 0
    ? `<!-- Top Themen -->
<p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#374151;">Top-Themen dieser Woche:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
${topicsHtml}
</table>`
    : ''
}

${ctaButton('Weiter abstimmen', 'https://demokrat.app/topics')}
<p style="margin:0;font-size:14px;color:#6b7280;">Danke, dass du mitmachst!</p>
`);

  const text = `Hallo ${name},

Hier ist dein wöchentlicher Überblick:

Abstimmungen diese Woche: ${stats.votesThisWeek}
Aktuelle Streak: ${stats.streakDays} Tage

${stats.topTopics.length > 0 ? `Top-Themen dieser Woche:\n${topicsText}\n` : ''}
Weiter abstimmen: https://demokrat.app/topics

Danke, dass du mitmachst!

--
Demokrat — Deine Stimme zählt
E-Mail-Einstellungen kannst du jederzeit in deinem Profil ändern.`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 6. Abstimmungsergebnis
// ---------------------------------------------------------------------------

export function voteResultEmail(
  name: string,
  topicTitle: string,
  result: string,
  yourVote: string,
): EmailTemplate {
  const subject = `Abstimmungsergebnis: ${topicTitle}`;
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Die Abstimmung zu folgendem Thema ist abgeschlossen:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:0;margin:0 0 24px;">
<tr><td style="padding:20px;">
<p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">${topicTitle}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="font-size:14px;color:#6b7280;padding:4px 0;">Ergebnis:</td>
<td style="font-size:14px;font-weight:600;color:#4f46e5;padding:4px 0;text-align:right;">${result}</td>
</tr>
<tr>
<td style="font-size:14px;color:#6b7280;padding:4px 0;">Deine Stimme:</td>
<td style="font-size:14px;font-weight:600;color:#374151;padding:4px 0;text-align:right;">${yourVote}</td>
</tr>
</table>
</td></tr>
</table>

${ctaButton('Details ansehen', 'https://demokrat.app/topics')}
`);

  const text = `Hallo ${name},

Die Abstimmung zu folgendem Thema ist abgeschlossen:

${topicTitle}
Ergebnis: ${result}
Deine Stimme: ${yourVote}

Details ansehen: https://demokrat.app/topics

--
Demokrat — Deine Stimme zählt
E-Mail-Einstellungen kannst du jederzeit in deinem Profil ändern.`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 7. Bundestag-Vergleich
// ---------------------------------------------------------------------------

export function bundestagComparisonEmail(
  name: string,
  topicTitle: string,
  buergerResult: string,
  bundestagResult: string,
  agreement: number,
): EmailTemplate {
  const subject = `Bundestag-Vergleich: ${topicTitle}`;
  const agreementColor = agreement >= 70 ? '#059669' : agreement >= 40 ? '#d97706' : '#dc2626';

  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Der Bundestag hat ebenfalls &uuml;ber dieses Thema abgestimmt. So sieht der Vergleich aus:</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;margin:0 0 16px;">
<tr><td style="padding:20px;">
<p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#111827;">${topicTitle}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="font-size:14px;color:#6b7280;padding:6px 0;">B&uuml;rger-Ergebnis:</td>
<td style="font-size:14px;font-weight:600;color:#4f46e5;padding:6px 0;text-align:right;">${buergerResult}</td>
</tr>
<tr>
<td style="font-size:14px;color:#6b7280;padding:6px 0;">Bundestag-Ergebnis:</td>
<td style="font-size:14px;font-weight:600;color:#374151;padding:6px 0;text-align:right;">${bundestagResult}</td>
</tr>
</table>
</td></tr>
</table>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="background-color:#eef2ff;border-radius:8px;padding:16px;text-align:center;">
<div style="font-size:13px;color:#6b7280;margin-bottom:4px;">&Uuml;bereinstimmung</div>
<div style="font-size:32px;font-weight:700;color:${agreementColor};">${agreement}%</div>
</td></tr>
</table>

${ctaButton('Vergleich ansehen', 'https://demokrat.app/topics')}
`);

  const text = `Hallo ${name},

Der Bundestag hat ebenfalls über dieses Thema abgestimmt. So sieht der Vergleich aus:

${topicTitle}
Bürger-Ergebnis: ${buergerResult}
Bundestag-Ergebnis: ${bundestagResult}
Übereinstimmung: ${agreement}%

Vergleich ansehen: https://demokrat.app/topics

--
Demokrat — Deine Stimme zählt
E-Mail-Einstellungen kannst du jederzeit in deinem Profil ändern.`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 8. Account-Loeschung
// ---------------------------------------------------------------------------

export function accountDeletionEmail(
  name: string,
  deletionDate: string,
): EmailTemplate {
  const subject = 'Dein Demokrat-Konto wird gelöscht';
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Wir best&auml;tigen, dass dein Demokrat-Konto und alle zugehörigen Daten gel&ouml;scht werden.</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;margin:0 0 24px;">
<tr><td style="padding:16px 20px;">
<p style="margin:0;font-size:14px;color:#991b1b;"><strong>L&ouml;schungsdatum:</strong> ${deletionDate}</p>
</td></tr>
</table>

<p style="margin:0 0 16px;font-size:15px;">Bis zu diesem Datum kannst du die L&ouml;schung noch r&uuml;ckg&auml;ngig machen, indem du dich erneut anmeldest.</p>
<p style="margin:0 0 16px;font-size:15px;">Folgende Daten werden unwiderruflich entfernt:</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
<tr><td style="padding:3px 0;font-size:14px;color:#374151;">&#8226; Dein Profil und deine Einstellungen</td></tr>
<tr><td style="padding:3px 0;font-size:14px;color:#374151;">&#8226; Alle Abstimmungen und Kommentare</td></tr>
<tr><td style="padding:3px 0;font-size:14px;color:#374151;">&#8226; Gamification-Fortschritt (Punkte, Badges, Streak)</td></tr>
</table>
<p style="margin:0;font-size:14px;color:#6b7280;">Es tut uns leid, dich gehen zu sehen. Falls du Feedback hast, antworte einfach auf diese Email.</p>
`);

  const text = `Hallo ${name},

Wir bestätigen, dass dein Demokrat-Konto und alle zugehörigen Daten gelöscht werden.

Löschungsdatum: ${deletionDate}

Bis zu diesem Datum kannst du die Löschung noch rückgängig machen, indem du dich erneut anmeldest.

Folgende Daten werden unwiderruflich entfernt:
- Dein Profil und deine Einstellungen
- Alle Abstimmungen und Kommentare
- Gamification-Fortschritt (Punkte, Badges, Streak)

Es tut uns leid, dich gehen zu sehen. Falls du Feedback hast, antworte einfach auf diese Email.

--
Demokrat — Deine Stimme zählt`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 9. Datenexport
// ---------------------------------------------------------------------------

export function dataExportEmail(
  name: string,
  downloadLink: string,
): EmailTemplate {
  const subject = 'Dein Datenexport ist bereit';
  const html = layout(`
<p style="margin:0 0 16px;font-size:16px;">Hallo ${name},</p>
<p style="margin:0 0 16px;font-size:15px;">Dein angeforderter Datenexport ist fertig und steht zum Download bereit.</p>

${ctaButton('Daten herunterladen', downloadLink)}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:8px;margin:0 0 16px;">
<tr><td style="padding:12px 16px;">
<p style="margin:0;font-size:13px;color:#92400e;"><strong>Hinweis:</strong> Der Download-Link ist 48 Stunden g&uuml;ltig. Danach wird die Datei automatisch gel&ouml;scht.</p>
</td></tr>
</table>

<p style="margin:0;font-size:14px;color:#6b7280;">Der Export enth&auml;lt alle deine pers&ouml;nlichen Daten gem&auml;&szlig; DSGVO Art. 20 (Recht auf Daten&uuml;bertragbarkeit).</p>
`);

  const text = `Hallo ${name},

Dein angeforderter Datenexport ist fertig und steht zum Download bereit.

Daten herunterladen: ${downloadLink}

Hinweis: Der Download-Link ist 48 Stunden gültig. Danach wird die Datei automatisch gelöscht.

Der Export enthält alle deine persönlichen Daten gemäß DSGVO Art. 20 (Recht auf Datenübertragbarkeit).

--
Demokrat — Deine Stimme zählt`;

  return { subject, html, text };
}
