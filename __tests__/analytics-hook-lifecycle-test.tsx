import React from 'react';

import { mockDailyAssessment, mockDashboardTrends, mockWeightHistory } from '@/data/mockAnalytics';
import { useAnalyticsData } from '@/hooks/use-analytics-data';

type AnalyticsData = ReturnType<typeof useAnalyticsData>;

const TestRenderer = require('react-test-renderer') as {
  act(callback: () => void | Promise<void>): Promise<void>;
  create(element: React.ReactElement): {
    update(element: React.ReactElement): void;
  };
};

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function successfulResponseFor(url: string): Response {
  if (url.includes('nutrition-assessments')) return response({ data: mockDailyAssessment, error: null });
  if (url.includes('dashboard/trends')) return response({ data: mockDashboardTrends, error: null });
  return response(mockWeightHistory);
}

function AnalyticsHarness({ accessToken, periodDays, onUpdate }: {
  accessToken: string | null;
  periodDays: 7 | 30;
  onUpdate: (data: AnalyticsData) => void;
}) {
  onUpdate(useAnalyticsData({ accessToken, periodDays }));
  return null;
}

describe('useAnalyticsData lifecycle', () => {
  const originalBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_BASE_URL = originalBaseUrl;
    global.fetch = originalFetch;
    console.error = originalConsoleError;
  });

  it('retries a failed daily request when refresh is called', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(response({ data: null, error: { code: 'UNAUTHORIZED', message: 'JWT detail', fieldErrors: [], correlationId: 'hidden' } }, 401))
      .mockResolvedValueOnce(successfulResponseFor('dashboard/trends'))
      .mockResolvedValueOnce(successfulResponseFor('tracking/weight'))
      .mockImplementation((url: string) => Promise.resolve(successfulResponseFor(url)));
    global.fetch = fetchMock as typeof fetch;
    let latest: AnalyticsData | null = null;

    await TestRenderer.act(async () => {
      TestRenderer.create(
        <AnalyticsHarness accessToken="token" periodDays={7} onUpdate={(data) => { latest = data; }} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latest?.daily).toEqual({
      status: 'error',
      data: null,
      message: 'Your session has ended. Please sign in again.',
    });

    await TestRenderer.act(async () => {
      latest?.refresh();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latest?.daily).toEqual({ status: 'success', data: mockDailyAssessment });
  });

  it('ignores an older request after the period changes', async () => {
    let resolveOldDaily: ((value: Response) => void) | undefined;
    let resolveOldTrends: ((value: Response) => void) | undefined;
    let resolveOldWeight: ((value: Response) => void) | undefined;
    const oldRequests = [
      new Promise<Response>((resolve) => { resolveOldDaily = resolve; }),
      new Promise<Response>((resolve) => { resolveOldTrends = resolve; }),
      new Promise<Response>((resolve) => { resolveOldWeight = resolve; }),
    ];
    const fetchMock = jest.fn((url: string) =>
      oldRequests.shift() ?? Promise.resolve(successfulResponseFor(url)),
    );
    global.fetch = fetchMock as typeof fetch;
    let latest: AnalyticsData | null = null;
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(
        <AnalyticsHarness accessToken="token" periodDays={7} onUpdate={(data) => { latest = data; }} />,
      );
      await Promise.resolve();
    });

    await TestRenderer.act(async () => {
      renderer!.update(
        <AnalyticsHarness accessToken="token" periodDays={30} onUpdate={(data) => { latest = data; }} />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latest?.daily).toEqual({ status: 'success', data: mockDailyAssessment });

    await TestRenderer.act(async () => {
      resolveOldDaily!(response({ data: { ...mockDailyAssessment, assessmentId: 'old-load' }, error: null }));
      resolveOldTrends!(response({ data: mockDashboardTrends, error: null }));
      resolveOldWeight!(response(mockWeightHistory));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(latest?.daily).toEqual({ status: 'success', data: mockDailyAssessment });
  });
});
