/**
 * Input sanitization helpers for user-provided content.
 */

/** Strip HTML tags from user input */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/** Sanitize display name: allow letters (incl. umlauts), numbers, spaces, hyphens */
export function sanitizeDisplayName(name: string): string {
  // Remove anything that isn't a letter, number, space, hyphen, or common special chars
  const sanitized = name
    .replace(/[^\p{L}\p{N}\s\-]/gu, '')
    .trim()
    .replace(/\s+/g, ' ');

  // Limit length to 50 characters
  return sanitized.slice(0, 50);
}

/** Validate and sanitize URL — returns null if invalid */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}
