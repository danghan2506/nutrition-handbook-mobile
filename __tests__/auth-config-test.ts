import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Supabase authentication configuration', () => {
  it('declares only the approved public environment contract', () => {
    const envExample = readFileSync(
      join(process.cwd(), '.env.example'),
      'utf8',
    );

    expect(envExample).toContain('EXPO_PUBLIC_SUPABASE_URL=');
    expect(envExample).toContain('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=');
    expect(envExample).not.toContain('service_role');
    expect(envExample).not.toMatch(/OTP|TEST_PHONE|SECRET/);
  });

  it('uses the approved dependencies and secure native storage', () => {
    const root = process.cwd();
    const packageJson = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8'),
    );
    const appJson = JSON.parse(readFileSync(join(root, 'app.json'), 'utf8'));
    const nativeSource = readFileSync(join(root, 'lib', 'supabase.ts'), 'utf8');
    const webSource = readFileSync(join(root, 'lib', 'supabase.web.ts'), 'utf8');

    expect(packageJson.dependencies['@supabase/supabase-js']).toBeTruthy();
    expect(packageJson.dependencies['expo-secure-store']).toBe('~15.0.8');
    expect(appJson.expo.scheme).toBe('nutritionhandbook');
    expect(appJson.expo.plugins).toContain('expo-secure-store');
    expect(nativeSource).toContain("from 'expo-secure-store'");
    expect(nativeSource).toContain('processLock');
    expect(nativeSource).toContain('persistSession: true');
    expect(nativeSource).toContain('detectSessionInUrl: false');
    expect(webSource).toContain('persistSession: true');
    expect(webSource).toContain('detectSessionInUrl: true');
    expect(`${nativeSource}\n${webSource}`).not.toContain('service_role');
  });
});
