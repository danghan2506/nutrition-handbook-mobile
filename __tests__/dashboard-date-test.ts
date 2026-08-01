import {
  formatBusinessDateLabel,
  formatMealTime,
  getBusinessDate,
  getCalendarWeek,
} from '@/lib/dashboard-date';

test('resolves the Vietnam business date near a UTC boundary', () => {
  expect(
    getBusinessDate(new Date('2026-07-29T18:30:00.000Z'), 'Asia/Ho_Chi_Minh'),
  ).toBe('2026-07-30');
});

test('returns a Monday-through-Sunday week across a month boundary', () => {
  expect(getCalendarWeek('2026-07-30').map((day) => day.date)).toEqual([
    '2026-07-27', '2026-07-28', '2026-07-29', '2026-07-30',
    '2026-07-31', '2026-08-01', '2026-08-02',
  ]);
});

test('handles leap day and formats Vietnamese labels', () => {
  expect(getCalendarWeek('2028-02-29').map((day) => day.date)).toContain('2028-02-29');
  expect(formatBusinessDateLabel('2026-07-30')).toContain('30');
  expect(formatMealTime('2026-07-30T12:30:00+07:00', 'Asia/Ho_Chi_Minh')).toBe('12:30');
});
