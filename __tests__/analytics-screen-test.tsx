import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('analytics screen API integration', () => {
  const source = readFileSync(join(process.cwd(), 'app/(tabs)/insights.tsx'), 'utf8');

  it('uses the auth session and analytics data hook instead of fixtures', () => {
    expect(source).toContain("from '@/hooks/use-auth-session'");
    expect(source).toContain("from '@/hooks/use-analytics-data'");
    expect(source).toContain('session?.access_token');
    expect(source).not.toContain('mockAnalytics');
  });

  it('keeps period values numeric and accessible', () => {
    expect(source).toContain('const periods: AnalyticsPeriodDays[] = [7, 30]');
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityState={{ selected: periodDays === value }}');
    expect(source).toContain('min-h-[44px]');
    expect(source).toContain('periodDays }');
  });

  it('renders daily, trends, and weight sections independently', () => {
    expect(source).toContain('<DailyHealthyScoreCard');
    expect(source).toContain('<WeeklyTrendsChart');
    expect(source).toContain('<WeightSummaryCard');
    expect(source).toContain('<AnalyticsSectionState');
    expect(source).toContain('onRetry={refresh}');
  });
});
