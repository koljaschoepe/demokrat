const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'E-Mail oder Passwort ist falsch',
  'Email not confirmed': 'Bitte bestätige zuerst deine E-Mail-Adresse',
  'User already registered': 'Diese E-Mail-Adresse ist bereits registriert',
  'Password should be at least 8 characters':
    'Das Passwort muss mindestens 8 Zeichen lang sein',
  'Email rate limit exceeded':
    'Zu viele Versuche. Bitte warte einen Moment.',
  'For security purposes, you can only request this after':
    'Aus Sicherheitsgründen kannst du dies erst nach einer Wartezeit erneut anfordern',
  'New password should be different from the old password':
    'Das neue Passwort muss sich vom alten unterscheiden',
  'Unable to validate email address: invalid format':
    'Ungültiges E-Mail-Format',
  'Signups not allowed for this instance':
    'Die Registrierung ist derzeit nicht möglich',
  'Email link is invalid or has expired':
    'Der E-Mail-Link ist ungültig oder abgelaufen',
  'Token has expired or is invalid':
    'Der Link ist abgelaufen oder ungültig. Bitte fordere einen neuen an.',
  'User not found': 'Kein Konto mit dieser E-Mail-Adresse gefunden',
  'Invalid Refresh Token: Already Used':
    'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  'Invalid Refresh Token: Refresh Token Not Found':
    'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  'Only an email address or phone number should be provided on signup':
    'Bitte gib nur eine E-Mail-Adresse an',
  'A user with this email address has already been registered':
    'Diese E-Mail-Adresse ist bereits registriert',
};

export function getAuthErrorMessage(error: string): string {
  // Direkte Übereinstimmung prüfen
  if (ERROR_MAP[error]) {
    return ERROR_MAP[error];
  }

  // Teilübereinstimmung prüfen
  for (const [key, message] of Object.entries(ERROR_MAP)) {
    if (error.includes(key)) {
      return message;
    }
  }

  return 'Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.';
}
