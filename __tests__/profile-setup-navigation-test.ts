import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('profile setup navigation', () => {
  it('places profile setup immediately after successful login', () => {
    const root = process.cwd();
    const layout = readFileSync(join(root, 'app', '_layout.tsx'), 'utf8');
    const login = readFileSync(join(root, 'app', 'login.tsx'), 'utf8');
    const profile = readFileSync(join(root, 'app', 'profile-setup.tsx'), 'utf8');

    expect(layout).toContain('<Stack.Screen name="profile-setup"');
    expect(login).toContain("router.replace('/profile-setup')");
    expect(login).not.toContain("router.replace('/(tabs)')");
    expect(login).toContain("if (!isBusy && destination !== '/login')");
    expect(profile).toContain("router.replace('/(tabs)')");
    expect(profile).toMatch(
      /import\s+\{[^}]*Redirect[^}]*\}\s+from\s+'expo-router'/,
    );
    expect(profile).toContain("import { useAuthSession } from '@/hooks/use-auth-session'");
    expect(profile).toMatch(
      /const\s+\{\s*isLoading,\s*session\s*\}\s*=\s*useAuthSession\(\)/,
    );
    expect(profile).toMatch(
      /if\s*\(isLoading\)\s*\{\s*return null;\s*\}/,
    );
    expect(profile).toMatch(
      /if\s*\(!session\)\s*\{\s*return <Redirect href="\/login" \/>;\s*\}/,
    );
    expect(profile).not.toContain('useAccessDestination');
    expect(profile).not.toContain('AsyncStorage');
    expect(profile).not.toContain('supabase');
  });
});
