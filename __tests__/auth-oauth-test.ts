import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { extractOAuthTokens } from '../lib/auth-oauth';

jest.mock('../lib/supabase', () => ({
  supabase: { auth: {} },
}));

describe('social OAuth', () => {
  it('extracts the Supabase session tokens from the callback fragment', () => {
    expect(
      extractOAuthTokens(
        'nutritionhandbook://auth/callback#access_token=access-123&refresh_token=refresh-456',
      ),
    ).toEqual({ accessToken: 'access-123', refreshToken: 'refresh-456' });
  });

  it('rejects callbacks that do not contain both tokens', () => {
    expect(
      extractOAuthTokens(
        'nutritionhandbook://auth/callback#access_token=access-123',
      ),
    ).toBeNull();
  });

  it('supports exactly Google and Facebook without logging tokens', () => {
    const root = process.cwd();
    const nativeSource = readFileSync(join(root, 'lib', 'auth-oauth.ts'), 'utf8');
    const typesSource = readFileSync(join(root, 'types', 'auth.ts'), 'utf8');

    expect(typesSource).toContain("'google' | 'facebook'");
    expect(nativeSource).toContain('skipBrowserRedirect: true');
    expect(nativeSource).toContain('openAuthSessionAsync');
    expect(nativeSource).toContain('supabase.auth.setSession');
    expect(nativeSource).not.toContain('console.log');
    expect(nativeSource).not.toContain('console.debug');
  });
});
