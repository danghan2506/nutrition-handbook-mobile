import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('approved login screen', () => {
  it('keeps the approved copy and phone-first hierarchy', () => {
    const root = process.cwd();
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');
    const screen = readFileSync(
      join(root, 'app', '(auth)', 'login.tsx'),
      'utf8',
    );

    expect(copy).toContain('Chào mừng bạn quay trở lại.');
    expect(copy).toContain('Số điện thoại');
    expect(copy).toContain('Nhập số điện thoại');
    expect(copy).toContain('Tiếp tục với Google');
    expect(copy).toContain('Tiếp tục với Facebook');
    expect(copy).toContain('Điều khoản');
    expect(copy).toContain('Chính sách quyền riêng tư');
    expect(screen).toContain('+84');
    expect(screen).toContain('accessibilityLabel={AUTH_COPY.phoneLabel}');
    expect(screen.indexOf('handlePhoneContinue')).toBeLessThan(
      screen.indexOf("handleSocialContinue('google')"),
    );
    expect(`${copy}\n${screen}`).not.toMatch(/mật khẩu|email|khách/i);
  });

  it('uses existing design-system colors and keyboard-safe layout', () => {
    const screen = readFileSync(
      join(process.cwd(), 'app', '(auth)', 'login.tsx'),
      'utf8',
    );

    expect(screen).toContain("backgroundColor: '#FFF9F0'");
    expect(screen).toContain('KeyboardAvoidingView');
    expect(screen).toContain('bg-apricot');
    expect(screen).toContain('text-ink-navy');
    expect(screen).toContain('text-soft-slate');
  });
});
