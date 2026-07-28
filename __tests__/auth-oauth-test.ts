import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('social OAuth orchestration', () => {
  it('uses the system auth browser and handles both callback shapes on native', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib', 'auth-oauth.ts'),
      'utf8',
    );

    expect(source).toContain("Linking.createURL('auth/callback')");
    expect(source).toContain('skipBrowserRedirect: true');
    expect(source).toContain('WebBrowser.openAuthSessionAsync');
    expect(source).toContain('exchangeCodeForSession');
    expect(source).toContain('setSession');
    expect(source).toContain("status: 'cancelled'");
  });

  it('allows browser redirect on web', () => {
    const source = readFileSync(
      join(process.cwd(), 'lib', 'auth-oauth.web.ts'),
      'utf8',
    );

    expect(source).toContain('signInWithOAuth');
    expect(source).not.toContain('skipBrowserRedirect: true');
  });

  it('observes persisted sessions and unsubscribes on cleanup', () => {
    const source = readFileSync(
      join(process.cwd(), 'hooks', 'use-auth-session.ts'),
      'utf8',
    );

    expect(source).toContain('getSession');
    expect(source).toContain('onAuthStateChange');
    expect(source).toContain('subscription.unsubscribe()');
    expect(source).toContain('.catch(() =>');
  });
});
