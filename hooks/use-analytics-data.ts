import { useCallback, useEffect, useMemo, useState } from 'react';

import { AnalyticsApiError, createAnalyticsApiClient } from '@/lib/analytics-api';
import { createAnalyticsDateRange } from '@/lib/analytics-date-range';
import type {
  DashboardTrendsData,
  DailyAssessmentData,
  AnalyticsPeriodDays,
  WeightHistoryResponse,
} from '@/types/analytics';

type AnalyticsClient = ReturnType<typeof createAnalyticsApiClient>;
export type AnalyticsRange = { from: string; to: string };

export type AnalyticsSection<T> =
  | { status: 'loading'; data: null }
  | { status: 'success'; data: T }
  | { status: 'empty'; data: null }
  | { status: 'error'; data: null; message: string };

export type AnalyticsSections = {
  daily: AnalyticsSection<DailyAssessmentData>;
  trends: AnalyticsSection<DashboardTrendsData>;
  weight: AnalyticsSection<WeightHistoryResponse>;
};

const loadingSections = (): AnalyticsSections => ({
  daily: { status: 'loading', data: null },
  trends: { status: 'loading', data: null },
  weight: { status: 'loading', data: null },
});

const emptySections = (): AnalyticsSections => ({
  daily: { status: 'empty', data: null },
  trends: { status: 'empty', data: null },
  weight: { status: 'empty', data: null },
});

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
  return signal?.aborted === true || (error instanceof Error && error.name === 'AbortError');
}

function getSafeErrorMessage(error: unknown): string {
  if (error instanceof AnalyticsApiError && error.status === 401) {
    return 'Your session has ended. Please sign in again.';
  }

  if (
    (error instanceof AnalyticsApiError && error.code === 'NETWORK_ERROR') ||
    error instanceof TypeError
  ) {
    return 'Unable to connect. Check your connection and try again.';
  }

  return 'We could not load this information. Please try again.';
}

function toSection<T>(
  result: PromiseSettledResult<T>,
  isEmpty: (value: T) => boolean,
  signal?: AbortSignal,
): AnalyticsSection<T> {
  if (signal?.aborted || (result.status === 'rejected' && isAbortError(result.reason, signal))) {
    return { status: 'empty', data: null };
  }

  if (result.status === 'rejected') {
    return { status: 'error', data: null, message: getSafeErrorMessage(result.reason) };
  }

  if (isEmpty(result.value)) {
    return { status: 'empty', data: null };
  }

  return { status: 'success', data: result.value };
}

export async function loadAnalyticsSections(
  client: AnalyticsClient,
  range: AnalyticsRange,
  signal?: AbortSignal,
): Promise<AnalyticsSections> {
  const [daily, trends, weight] = await Promise.allSettled([
    client.getDailyAssessment(range.to, signal),
    client.getDashboardTrends(range.from, range.to, signal),
    client.getWeightHistory(range.from, range.to, signal),
  ]);

  return {
    daily: toSection(daily, () => false, signal),
    trends: toSection(trends, (value) => value.points.length === 0, signal),
    weight: toSection(weight, (value) => value.data.length === 0, signal),
  };
}

function errorSections(error: unknown): AnalyticsSections {
  const message = getSafeErrorMessage(error);
  return {
    daily: { status: 'error', data: null, message },
    trends: { status: 'error', data: null, message },
    weight: { status: 'error', data: null, message },
  };
}

export function useAnalyticsData({
  accessToken,
  periodDays,
}: {
  accessToken: string | null;
  periodDays: AnalyticsPeriodDays;
}) {
  const range = useMemo(() => createAnalyticsDateRange(periodDays), [periodDays]);
  const [sections, setSections] = useState<AnalyticsSections>(() =>
    accessToken ? loadingSections() : emptySections(),
  );
  const [reloadKey, setReloadKey] = useState(0);

  const refresh = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setSections(emptySections());
      return;
    }

    const controller = new AbortController();
    let isCurrent = true;
    setSections(loadingSections());

    try {
      const client = createAnalyticsApiClient({
        baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL?.trim() ?? '',
        accessToken,
      });

      void loadAnalyticsSections(client, range, controller.signal).then((nextSections) => {
        if (isCurrent && !controller.signal.aborted) {
          setSections(nextSections);
        }
      });
    } catch (error) {
      if (isCurrent) {
        setSections(errorSections(error));
      }
    }

    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [accessToken, range, reloadKey]);

  return { range, ...sections, refresh };
}
