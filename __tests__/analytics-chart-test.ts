import {
  buildTrendSeries,
  getTrendMetricConfig,
  summarizeWeightTrend,
} from '../lib/analytics-chart';
import type { DashboardTrendPoint } from '../types/analytics';

const point = (
  date: string,
  overrides: Partial<DashboardTrendPoint> = {},
): DashboardTrendPoint => ({
  date,
  caloriesKcal: 1200,
  proteinG: null,
  carbohydrateG: null,
  fatG: null,
  healthyScore: 70,
  goalAdherence: 0.7,
  dataCompleteness: 1,
  ...overrides,
});

describe('analytics chart model', () => {
  it('keeps null calories as a gap instead of drawing them at zero', () => {
    const series = buildTrendSeries(
      [
        point('2026-07-30', { caloriesKcal: 1000 }),
        point('2026-07-31', { caloriesKcal: null }),
        point('2026-08-01', { caloriesKcal: 1400 }),
      ],
      'calories',
      200,
      100,
    );

    expect(series.points[1]).toMatchObject({ value: null, y: null });
    expect(series.pathSegments).toHaveLength(2);
    expect(series.pathSegments.every((path) => !path.includes('NaN'))).toBe(true);
    expect(series.accessibilitySummary).toContain('2 điểm đo');
    expect(series.accessibilitySummary).toContain('1 điểm thiếu');
  });

  it('centres a single measured value at finite SVG coordinates', () => {
    const series = buildTrendSeries(
      [point('2026-08-01', { caloriesKcal: 1800 })],
      'calories',
      240,
      120,
    );

    expect(series.points[0]).toMatchObject({ x: 120, value: 1800 });
    expect(Number.isFinite(series.points[0].y)).toBe(true);
    expect(series.pathSegments).toEqual([`M 120 ${series.points[0].y}`]);
  });

  it('uses a padded calorie domain when all measured values are equal', () => {
    const series = buildTrendSeries(
      [
        point('2026-07-31', { caloriesKcal: 1500 }),
        point('2026-08-01', { caloriesKcal: 1500 }),
      ],
      'calories',
      100,
      80,
    );

    expect(series.domain.min).toBeLessThan(1500);
    expect(series.domain.max).toBeGreaterThan(1500);
    expect(series.points.every(({ y }) => y !== null && Number.isFinite(y))).toBe(true);
  });

  it('draws Healthy Score on a fixed 0 to 100 domain', () => {
    const series = buildTrendSeries(
      [point('2026-08-01', { healthyScore: 75 })],
      'healthyScore',
      100,
      100,
    );

    expect(series.domain).toEqual({ min: 0, max: 100 });
    expect(series.points[0]).toMatchObject({ value: 75, y: 25 });
  });

  it('converts goal adherence to a percent display value without changing the input point', () => {
    const input = point('2026-08-01', { goalAdherence: 0.725 });
    const series = buildTrendSeries([input], 'goalAdherence', 100, 100);

    expect(input.goalAdherence).toBe(0.725);
    expect(series.domain).toEqual({ min: 0, max: 100 });
    expect(series.points[0]).toMatchObject({ value: 72.5, y: 27.5 });
    expect(getTrendMetricConfig('goalAdherence').formatValue(72.5)).toBe('72.5%');
  });

  it('shows all seven-day labels and limits a 30-day series to six labels', () => {
    const week = Array.from({ length: 7 }, (_, index) =>
      point(`2026-07-${String(index + 26).padStart(2, '0')}`),
    );
    const month = Array.from({ length: 30 }, (_, index) =>
      point(`2026-07-${String(index + 1).padStart(2, '0')}`),
    );

    expect(buildTrendSeries(week, 'calories', 210, 100).xAxisLabels).toHaveLength(7);
    expect(buildTrendSeries(month, 'calories', 300, 100).xAxisLabels).toHaveLength(6);
  });

  it.each([
    [-0.7, 'Giảm 0,7 kg trong 7 ngày qua'],
    [0, 'Không đổi trong 7 ngày qua'],
    [0.7, 'Tăng 0,7 kg trong 7 ngày qua'],
  ] as const)('describes a %s kg weight change neutrally', (changeFromFirstKg, description) => {
    const summary = summarizeWeightTrend(
      { latestWeightKg: 61.2, changeFromFirstKg, firstOccurredAt: '2026-07-26T07:00:00Z' },
      7,
    );

    expect(summary.description).toBe(description);
    expect(summary).not.toHaveProperty('status');
    expect(summary).not.toHaveProperty('color');
  });
});
