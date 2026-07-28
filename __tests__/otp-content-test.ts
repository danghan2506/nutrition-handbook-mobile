import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('approved OTP screen', () => {
  it('renders the approved verification content without a change-phone action', () => {
    const root = process.cwd();
    const copy = readFileSync(join(root, 'constants', 'auth.ts'), 'utf8');
    const screen = readFileSync(
      join(root, 'app', '(auth)', 'verify-otp.tsx'),
      'utf8',
    );

    expect(copy).toContain('Xác minh số điện thoại');
    expect(copy).toContain('Mã xác thực chỉ dùng một lần.');
    expect(screen).toContain('OTP_LENGTH');
    expect(screen).toContain('RESEND_SECONDS');
    expect(screen).toContain('mt-6');
    expect(`${copy}\n${screen}`).not.toContain('Đổi số điện thoại');
    expect(`${copy}\n${screen}`).not.toMatch(/đã gửi|tin nhắn/i);
  });

  it('supports one-time-code autofill with one accessible input', () => {
    const input = readFileSync(
      join(process.cwd(), 'components', 'auth', 'otp-input.tsx'),
      'utf8',
    );

    expect(input).toContain('Array.from({ length: OTP_LENGTH }');
    expect(input).toContain('textContentType="oneTimeCode"');
    expect(input).toContain('autoComplete="sms-otp"');
    expect(input).toContain('keyboardType="number-pad"');
    expect(input).toContain('accessibilityLabel="Mã xác thực gồm 6 chữ số"');
  });
});
