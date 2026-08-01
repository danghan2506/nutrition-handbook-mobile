import { mockDailyAssessment, mockDashboardTrends, mockWeightHistory } from '@/data/mockAnalytics';
import { AnalyticsApiError, createAnalyticsApiClient } from '@/lib/analytics-api';
import { loadAnalyticsSections } from '@/hooks/use-analytics-data';

type AnalyticsClient = ReturnType<typeof createAnalyticsApiClient>;

function clientWith(overrides: Partial<AnalyticsClient>): AnalyticsClient {
  return {
    getDailyAssessment: jest.fn().mockResolvedValue(mockDailyAssessment),
    getDashboardTrends: jest.fn().mockResolvedValue(mockDashboardTrends),
    getWeightHistory: jest.fn().mockResolvedValue(mockWeightHistory),
    ...overrides,
  };
}

describe('loadAnalyticsSections', () => {
  it('keeps successful sections available when weight loading fails', async () => {
    const client = clientWith({
      getWeightHistory: jest.fn().mockRejectedValue(
        new AnalyticsApiError('Internal details must stay private', { status: 503 }),
      ),
    });

    const result = await loadAnalyticsSections(
      client,
      { from: '2026-07-26', to: '2026-08-01' },
    );

    expect(result.daily).toEqual({ status: 'success', data: mockDailyAssessment });
    expect(result.trends).toEqual({ status: 'success', data: mockDashboardTrends });
    expect(result.weight).toEqual({
      status: 'error',
      data: null,
      message: 'We could not load this information. Please try again.',
    });
  });

  it('marks an empty weight history as empty instead of inventing a value', async () => {
    const client = clientWith({
      getWeightHistory: jest.fn().mockResolvedValue({
        ...mockWeightHistory,
        data: [],
        trend: { latestWeightKg: 0, changeFromFirstKg: 0, firstOccurredAt: null },
      }),
    });

    const result = await loadAnalyticsSections(
      client,
      { from: '2026-07-26', to: '2026-08-01' },
    );

    expect(result.weight).toEqual({ status: 'empty', data: null });
  });

  it('does not turn an aborted request into a user-facing error', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const client = clientWith({
      getDashboardTrends: jest.fn().mockRejectedValue(abortError),
    });
    const controller = new AbortController();
    controller.abort();

    const result = await loadAnalyticsSections(
      client,
      { from: '2026-07-26', to: '2026-08-01' },
      controller.signal,
    );

    expect(result.trends).toEqual({ status: 'empty', data: null });
  });
});
