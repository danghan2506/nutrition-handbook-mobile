import {
  maskVietnamesePhone,
  normalizeVietnamesePhone,
  sanitizeOtp,
} from '../lib/phone-number';

describe('Vietnamese phone helpers', () => {
  it.each([
    ['0912 345 678', '+84912345678'],
    ['912-345-678', '+84912345678'],
    ['+84 912 345 678', '+84912345678'],
    ['(0912) 345.678', '+84912345678'],
  ])('normalizes %s to E.164', (input, expected) => {
    expect(normalizeVietnamesePhone(input)).toBe(expected);
  });

  it.each([
    '',
    '0123',
    '+84123456789',
    '84912345678',
    '+849123456789',
    '0912abc678',
  ])('rejects invalid input %s', (input) => {
    expect(normalizeVietnamesePhone(input)).toBeNull();
  });

  it('masks the normalized number for OTP confirmation', () => {
    expect(maskVietnamesePhone('+84912345678')).toBe('+84 912 *** 678');
  });

  it('keeps only the first six OTP digits', () => {
    expect(sanitizeOtp('12a 34-5678')).toBe('123456');
  });
});
