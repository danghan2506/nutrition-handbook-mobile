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

  it('uses SecureStore natively and browser storage on web without secret keys', () => {
    const root = process.cwd();
    const nativeSource = readFileSync(join(root, 'lib', 'supabase.ts'), 'utf8');
    const webSource = readFileSync(join(root, 'lib', 'supabase.web.ts'), 'utf8');

    expect(nativeSource).toContain("from 'expo-secure-store'");
    expect(nativeSource).toContain('ExpoSecureStoreAdapter');
    expect(nativeSource).toContain('persistSession: true');
    expect(nativeSource).toContain('detectSessionInUrl: false');
    expect(webSource).toContain('persistSession: true');
    expect(webSource).toContain('detectSessionInUrl: true');
    expect(`${nativeSource}\n${webSource}`).not.toContain('service_role');
    expect(`${nativeSource}\n${webSource}`).not.toContain('SUPABASE_SECRET');
  });
});
