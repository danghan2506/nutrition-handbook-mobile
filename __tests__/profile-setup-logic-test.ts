import {
  clampHeight,
  heightToOffset,
  offsetToHeight,
  validateAge,
  validateName,
} from '@/lib/profile-setup';

describe('profile setup logic', () => {
  it('trims names and rejects an empty result', () => {
    expect(validateName('  Linh  ')).toEqual({ value: 'Linh' });
    expect(validateName('   ')).toEqual({ error: 'Vui lòng nhập tên của bạn.' });
  });

  it('accepts only whole-number ages from 5 through 120', () => {
    expect(validateAge('5')).toEqual({ value: 5 });
    expect(validateAge('120')).toEqual({ value: 120 });
    expect(validateAge('4')).toEqual({ error: 'Tuổi cần nằm trong khoảng 5–120.' });
    expect(validateAge('121')).toEqual({ error: 'Tuổi cần nằm trong khoảng 5–120.' });
    expect(validateAge('24.5')).toEqual({ error: 'Vui lòng nhập tuổi bằng số nguyên.' });
    expect(validateAge('abc')).toEqual({ error: 'Vui lòng nhập tuổi bằng số nguyên.' });
  });

  it('clamps and converts ruler values at a 12 px tick interval', () => {
    expect(clampHeight(99)).toBe(100);
    expect(clampHeight(165)).toBe(165);
    expect(clampHeight(221)).toBe(220);
    expect(heightToOffset(100)).toBe(0);
    expect(heightToOffset(165)).toBe(780);
    expect(offsetToHeight(0)).toBe(100);
    expect(offsetToHeight(780)).toBe(165);
    expect(offsetToHeight(2000)).toBe(220);
  });
});
