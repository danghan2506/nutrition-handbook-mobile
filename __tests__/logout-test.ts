import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('temporary logout control', () => {
  it('signs out only the current session without clearing onboarding', () => {
    const root = process.cwd();
    const main = readFileSync(
      join(root, 'app', '(tabs)', 'index.tsx'),
      'utf8',
    );
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');

    expect(main).toContain("signOut({ scope: 'local' })");
    expect(main).toContain('logoutCopy.label');
    expect(main).toContain('accessibilityRole="button"');
    expect(main).toContain('accessibilityRole="alert"');
    expect(main).not.toContain('AsyncStorage');
    expect(main).not.toContain('markOnboardingCompleted');
    expect(copy).toContain("label: 'Đăng xuất'");
    expect(copy).toContain("loading: 'Đang đăng xuất…'");
  });
});
