/**
 * Where Settings sends people for help and for the legal pages.
 *
 * PLACEHOLDERS. These point at example.com (reserved, so they can never reach
 * a stranger) until the real support inbox, help site and privacy policy
 * exist. App Review follows every one of them: replace all three before
 * submitting, and use the same URLs in App Store Connect.
 */
export const SUPPORT_EMAIL = 'support@example.com';
export const SUPPORT_URL = 'https://example.com/support';
export const PRIVACY_POLICY_URL = 'https://example.com/privacy';

/**
 * A `mailto:` link with the version filled in, so the first reply can be
 * about the problem rather than a question about which build it was.
 *
 * Encoded with `encodeURIComponent` rather than `URLSearchParams`: the latter
 * writes spaces as `+`, which Mail shows literally.
 */
export function supportMailto(email: string, version: string): string {
  const subject = 'MoveMate support';
  const body = `\n\n\nMoveMate ${version}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
