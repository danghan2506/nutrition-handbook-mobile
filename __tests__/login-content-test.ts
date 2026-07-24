import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function relativeLuminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)!
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe('approved login screen', () => {
  it('uses the approved copy, methods, wordmark, and interaction states', () => {
    const root = process.cwd();
    const screen = readFileSync(join(root, 'app', 'login.tsx'), 'utf8');
    const button = readFileSync(
      join(root, 'components', 'auth', 'social-login-button.tsx'),
      'utf8',
    );
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');
    const styles = readFileSync(join(root, 'global.css'), 'utf8');

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
    expect(button).toContain("from 'react-native-svg'");
    expect(button).toContain('#4285F4');
    expect(button).toContain('#34A853');
    expect(button).toContain('#FBBC05');
    expect(button).toContain('#EA4335');
    expect(button).not.toContain('name={provider}');
    expect(screen).toContain(
      'AccessibilityInfo.announceForAccessibility(message)',
    );
    expect(screen).toContain('accessibilityRole="alert"');
    expect(copy).toContain("legalEnd: '.'");
    expect(screen).toContain('{loginCopy.legalEnd}');
    expect(styles).toContain('--color-coral-notice: #9B4135');
    expect(contrastRatio('#9B4135', '#FFF9F0')).toBeGreaterThanOrEqual(4.5);
    expect(screen).toContain('max-w-[520px]');
    expect(screen).toContain('min-h-11');
  });
});
