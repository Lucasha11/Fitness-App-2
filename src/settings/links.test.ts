/**
 * Boundary shapes - tier 3.
 *
 * The support email crosses into Mail as a URL, and a wrongly encoded one
 * still opens: it just arrives garbled. Nobody would notice until a user did.
 */

import { describe, expect, it } from 'vitest';
import { supportMailto } from './links';

function parse(href: string): { to: string; subject: string; body: string } {
  const [to, query] = href.replace(/^mailto:/, '').split('?');
  const params = Object.fromEntries(
    query.split('&').map((pair) => {
      const [key, value] = pair.split('=');
      return [key, decodeURIComponent(value)];
    }),
  );
  return { to, subject: params.subject, body: params.body };
}

describe('the support email', () => {
  it('opens a draft addressed to the support inbox', () => {
    const { to } = parse(supportMailto('help@movemate.test', '1.0 (1)'));
    expect(to).toBe('help@movemate.test');
  });

  it('carries the app version so the first reply can be about the problem', () => {
    const { body } = parse(supportMailto('help@movemate.test', '1.2 (34)'));
    expect(body).toContain('MoveMate 1.2 (34)');
  });

  it('encodes spaces so Mail shows them as spaces, never as plus signs', () => {
    const href = supportMailto('help@movemate.test', '1.0 (1)');
    expect(href).not.toContain('+');
    expect(parse(href).subject).toBe('MoveMate support');
  });
});
