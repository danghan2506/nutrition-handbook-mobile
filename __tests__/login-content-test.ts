import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('approved login screen', () => {
  it('uses the approved copy, methods, wordmark, and interaction states', () => {
    const root = process.cwd();
    const screen = readFileSync(join(root, 'app', 'login.tsx'), 'utf8');
    const button = readFileSync(
      join(root, 'components', 'auth', 'social-login-button.tsx'),
      'utf8',
    );
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');

    expect(copy).toContain('Chào mừng bạn quay trở lại.');
    expect(copy).toContain('Tiếp tục với Google');
    expect(copy).toContain('Tiếp tục với Facebook');
    expect(copy).toContain('Chưa thể đăng nhập. Vui lòng thử lại.');
    expect(copy).toContain('Cần kết nối internet để đăng nhập.');
    expect(screen).toContain('AURALE');
    expect(screen).toContain("signInWithProvider('google')");
    expect(screen).toContain("signInWithProvider('facebook')");
    expect(screen).not.toContain('Connected');
    expect(screen).not.toContain('Bỏ qua');
    expect(screen).not.toContain('Email');
    expect(button).toContain('accessibilityRole="button"');
    expect(button).toContain('accessibilityState');
    expect(button).toContain('min-h-[54px]');
    expect(button).toContain('useReducedMotion');
    expect(screen).toContain('max-w-[520px]');
    expect(screen).toContain('min-h-11');
  });
});
