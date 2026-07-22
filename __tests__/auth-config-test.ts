import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('authentication configuration', () => {
  it('declares the approved dependencies, plugins, scheme, and public variables', () => {
    const root = process.cwd();
    const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
    const envExample = readFileSync(join(root, '.env.example'), 'utf8');

    expect(packageJson.dependencies['@supabase/supabase-js']).toBeTruthy();
    expect(packageJson.dependencies['expo-secure-store']).toBe('~15.0.8');
    expect(appJson.expo.scheme).toBe('nutritionhandbook');
    expect(appJson.expo.plugins).toContain('expo-secure-store');
    expect(appJson.expo.plugins).toContainEqual([
      'expo-web-browser',
      { experimentalLauncherActivity: false },
    ]);
    expect(envExample).toContain('EXPO_PUBLIC_SUPABASE_URL=');
    expect(envExample).toContain('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=');
    expect(envExample).toContain('EXPO_PUBLIC_TERMS_URL=');
    expect(envExample).toContain('EXPO_PUBLIC_PRIVACY_URL=');
  });
});
