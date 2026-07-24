import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('mandatory login navigation', () => {
  it('routes onboarding to login and protects every entry route', () => {
    const root = process.cwd();
    const index = readFileSync(join(root, 'app', 'index.tsx'), 'utf8');
    const onboarding = readFileSync(join(root, 'app', 'onboarding.tsx'), 'utf8');
    const modal = readFileSync(join(root, 'app', 'modal.tsx'), 'utf8');
    const rootLayout = readFileSync(join(root, 'app', '_layout.tsx'), 'utf8');
    const login = readFileSync(join(root, 'app', 'login.tsx'), 'utf8');
    const tabsLayout = readFileSync(join(root, 'app', '(tabs)', '_layout.tsx'), 'utf8');
    const authHook = readFileSync(join(root, 'hooks', 'use-auth-session.ts'), 'utf8');
    const accessHook = readFileSync(
      join(root, 'hooks', 'use-access-destination.ts'),
      'utf8',
    );

    expect(index).toContain('supabase.auth.getSession');
    expect(index).toContain('getInitialRoute(Boolean(session))');
    expect(onboarding).toContain("router.replace('/login')");
    expect(onboarding).not.toContain("router.replace('/(tabs)')");
    expect(onboarding).toContain('useAccessDestination');
    expect(onboarding).toContain("destination !== '/onboarding'");
    expect(onboarding).toContain('<Redirect href={destination} />');
    expect(modal).toContain('useAccessDestination');
    expect(modal).toContain("destination !== '/(tabs)'");
    expect(modal).toContain('<Redirect href={destination} />');
    expect(rootLayout).toContain('<Stack.Screen name="login"');
    expect(login).toContain('useAccessDestination');
    expect(login).toContain('<Redirect href={destination} />');
    expect(tabsLayout).toContain('useAccessDestination');
    expect(tabsLayout).toContain('<Redirect href={destination} />');
    expect(authHook).toContain('supabase.auth.onAuthStateChange');
    expect(authHook).toContain('subscription.unsubscribe');
    expect(accessHook).toContain("setDestination('/(tabs)')");
    expect(accessHook).toContain('setDestination(null)');
    expect(accessHook).toContain('getInitialRoute(false)');
  });
});
