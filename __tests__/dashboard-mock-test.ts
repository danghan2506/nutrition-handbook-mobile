import {
  DASHBOARD_MOCK_TIMEZONE,
  dashboardDataSource,
} from '@/data/dashboard-mock';
import { getBusinessDate } from '@/lib/dashboard-date';

describe('dashboard mock data source', () => {
  it('returns a defensive copy of a documented dashboard day', async () => {
    const first = await dashboardDataSource.getDashboard('2026-07-30');
    const second = await dashboardDataSource.getDashboard('2026-07-30');

    expect(DASHBOARD_MOCK_TIMEZONE).toBe('Asia/Ho_Chi_Minh');
    expect(first?.businessDate).toBe('2026-07-30');
    expect(first?.nutritionTotals.caloriesKcal).toBe(1850);
    expect(first?.targets.caloriesKcal).toEqual({ min: 1800, max: 2100 });
    expect(first?.topRecommendations[0]?.recommendationCode).toBe('ADD_FIBER');
    expect(first?.topRecommendations[0]?.text).toBe(
      'Thêm một món giàu chất xơ để ngày ăn uống cân bằng hơn.',
    );
    expect(first).not.toBe(second);
  });

  it('returns null for an unconfigured day instead of zero-filled nutrition', async () => {
    await expect(
      dashboardDataSource.getDashboard('2026-08-10'),
    ).resolves.toBeNull();
  });

  it("returns meal data for today's business date", async () => {
    const today = getBusinessDate(new Date(), DASHBOARD_MOCK_TIMEZONE);
    const data = await dashboardDataSource.getDashboard(today);

    expect(data).not.toBeNull();
    expect(data?.businessDate).toBe(today);
    expect(data?.meals.length).toBeGreaterThan(0);
  });
});
