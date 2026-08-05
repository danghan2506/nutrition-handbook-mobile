import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('analytics screen UI integration', () => {
  const source = readFileSync(join(process.cwd(), 'app/(tabs)/explore.tsx'), 'utf8');

  it('keeps the screen on local fixture data until API integration is explicitly enabled', () => {
    expect(source).toContain("from '../../data/mockAnalytics'");
    expect(source).not.toContain('useAnalyticsData');
    expect(source).not.toContain('useAuthSession');
  });

  it('keeps numeric 7/30 period controls accessible', () => {
    expect(source).toContain('const periods: AnalyticsPeriodDays[] = [7, 30]');
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityState={{ selected: periodDays === value }}');
    expect(source).toContain('min-h-[44px]');
  });

  it('composes the improved analytics cards and chart', () => {
    expect(source).toContain('<DailyHealthyScoreCard');
    expect(source).toContain('<WeeklyTrendsChart');
    expect(source).toContain('<WeightSummaryCard');
    expect(source).toContain('<NutrientDetailsList');
  });
});