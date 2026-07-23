import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseOAuthCallback } from '../lib/oauth-callback';

describe('social OAuth', () => {
  it('extracts a one-time authorization code from a PKCE callback', () => {
    expect(
      parseOAuthCallback(
        'nutritionhandbook://auth/callback?code=authorization-code',
      ),
    ).toEqual({ status: 'success', code: 'authorization-code' });
  });

  it('treats provider access denial as cancellation', () => {
    expect(
      parseOAuthCallback(
        'nutritionhandbook://auth/callback?error=access_denied&error_description=cancelled',
      ),
    ).toEqual({ status: 'cancelled' });
  });

  it.each([
    'nutritionhandbook://auth/callback',
    'nutritionhandbook://auth/callback?error=server_error',
    'nutritionhandbook://auth/callback#access_token=access&refresh_token=refresh',
  ])('rejects an unsafe or incomplete callback: %s', (url) => {
    expect(parseOAuthCallback(url)).toEqual({ status: 'error' });
  });

  it('supports exactly Google and Facebook without installing URL tokens', () => {
    const root = process.cwd();
    const nativeSource = readFileSync(join(root, 'lib', 'auth-oauth.ts'), 'utf8');
    const typesSource = readFileSync(join(root, 'types', 'auth.ts'), 'utf8');

    expect(typesSource).toContain("'google' | 'facebook'");
    expect(nativeSource).toContain('skipBrowserRedirect: true');
    expect(nativeSource).toContain('openAuthSessionAsync');
    expect(nativeSource).toContain('exchangeCodeForSession');
    expect(nativeSource).not.toContain('setSession');
    expect(nativeSource).not.toContain('access_token');
    expect(nativeSource).not.toContain('refresh_token');
    expect(nativeSource).not.toContain('console.log');
    expect(nativeSource).not.toContain('console.debug');
  });
});
