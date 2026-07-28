import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('authentication route gates', () => {
  it('registers the auth group in the root stack', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', '_layout.tsx'),
      'utf8',
    );

    expect(source).toContain('<Stack.Screen name="(auth)"');
  });

  it('protects main tabs from unauthenticated access', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', '(tabs)', '_layout.tsx'),
      'utf8',
    );

    expect(source).toContain('useAuthSession()');
    expect(source).toContain('if (isLoading)');
    expect(source).toContain('if (!session)');
    expect(source).toContain("'/(auth)/login' as Href");
  });

  it('replaces OTP with tabs after valid verification', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', '(auth)', 'verify-otp.tsx'),
      'utf8',
    );

    expect(source).toContain("router.replace('/(tabs)')");
  });
});
