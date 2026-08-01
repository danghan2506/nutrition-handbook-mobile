import {
  createAnalyticsDateRange,
  formatLocalDate,
  formatTrendDateLabel,
} from '../lib/analytics-date-range';

describe('analytics date range helpers', () => {
  it('formats the local calendar date without converting it to UTC', () => {
    expect(formatLocalDate(new Date(2026, 7, 1, 0, 30))).toBe('2026-08-01');
  });

  it.each([
    [7, '2026-07-26', '2026-08-01'],
    [30, '2026-07-03', '2026-08-01'],
  ] as const)(
    'creates an inclusive %d-day range ending today',
    (periodDays, from, to) => {
      expect(
        createAnalyticsDateRange(periodDays, new Date(2026, 7, 1, 12)),
      ).toEqual({ from, to });
    },
  );

  it('crosses a month boundary with local date arithmetic', () => {
    expect(createAnalyticsDateRange(7, new Date(2026, 2, 1, 12))).toEqual({
      from: '2026-02-23',
      to: '2026-03-01',
    });
  });

  it('crosses a year boundary with local date arithmetic', () => {
    expect(createAnalyticsDateRange(30, new Date(2026, 0, 1, 12))).toEqual({
      from: '2025-12-03',
      to: '2026-01-01',
    });
  });

  it('formats a compact Vietnamese weekday and date label for seven-day trends', () => {
    expect(formatTrendDateLabel('2026-08-03', 7)).toBe('T2, 03/08');
  });

  it('formats sparse-compatible dates without weekdays for thirty-day trends', () => {
    expect(formatTrendDateLabel('2026-08-03', 30)).toBe('03/08');
  });
});
