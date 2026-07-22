import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('mandatory login navigation', () => {
  it('routes onboarding to login and protects tabs with the Supabase session', () => {
    const root = process.cwd();
    const index = readFileSync(join(root, 'app', 'index.tsx'), 'utf8');
    const onboarding = readFileSync(join(root, 'app', 'onboarding.tsx'), 'utf8');
    const rootLayout = readFileSync(join(root, 'app', '_layout.tsx'), 'utf8');
    const tabsLayout = readFileSync(join(root, 'app', '(tabs)', '_layout.tsx'), 'utf8');
    const authHook = readFileSync(join(root, 'hooks', 'use-auth-session.ts'), 'utf8');

    expect(index).toContain('supabase.auth.getSession');
    expect(index).toContain('getInitialRoute(Boolean(session))');
    expect(onboarding).toContain("router.replace('/login')");
    expect(onboarding).not.toContain("router.replace('/(tabs)')");
    expect(rootLayout).toContain('<Stack.Screen name="login"');
    expect(tabsLayout).toContain('<Redirect href="/login" />');
    expect(authHook).toContain('supabase.auth.onAuthStateChange');
    expect(authHook).toContain('subscription.unsubscribe');
  });
});