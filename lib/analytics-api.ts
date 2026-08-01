import type {
  ApiError,
  DashboardTrendsData,
  DailyAssessmentData,
  WeightHistoryResponse,
} from '@/types/analytics';

type FetchLike = typeof fetch;

export class AnalyticsApiError extends Error {
  readonly status: number | null;
  readonly code: string;
  readonly correlationId: string | null;

  constructor(message: string, options: { status?: number | null; code?: string; correlationId?: string | null } = {}) {
    super(message);
    this.name = 'AnalyticsApiError';
    this.status = options.status ?? null;
    this.code = options.code ?? 'ANALYTICS_API_ERROR';
    this.correlationId = options.correlationId ?? null;
  }
}

export interface AnalyticsApiClientOptions { baseUrl: string; accessToken: string; fetchImpl?: FetchLike; }

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }

function readApiError(value: unknown): ApiError | null {
  if (!isRecord(value) || typeof value.code !== 'string' || typeof value.message !== 'string') return null;
  return {
    code: value.code,
    message: value.message,
    fieldErrors: Array.isArray(value.fieldErrors) ? value.fieldErrors as ApiError['fieldErrors'] : [],
    correlationId: typeof value.correlationId === 'string' ? value.correlationId : null,
  };
}

function throwEnvelopeError(body: unknown, status: number, label: string): never {
  const apiError = isRecord(body) ? readApiError(body.error) : null;
  if (apiError) throw new AnalyticsApiError(apiError.message, { status, code: apiError.code, correlationId: apiError.correlationId });
  throw new AnalyticsApiError(`Invalid ${label} response`, { status, code: 'INVALID_RESPONSE' });
}

function requireData<T>(body: unknown, status: number, label: string): T {
  if (!isRecord(body)) throwEnvelopeError(body, status, label);
  const apiError = readApiError(body.error);
  if (apiError) throw new AnalyticsApiError(apiError.message, { status, code: apiError.code, correlationId: apiError.correlationId });
  if (!("data" in body) || body.data === null || body.data === undefined) {
    throw new AnalyticsApiError(`Missing data in ${label} response`, { status, code: 'INVALID_RESPONSE' });
  }
  return body.data as T;
}

function requireWeightHistory(body: unknown, status: number): WeightHistoryResponse {
  if (!isRecord(body)) throwEnvelopeError(body, status, 'weight history');
  const apiError = readApiError(body.error);
  if (apiError) throw new AnalyticsApiError(apiError.message, { status, code: apiError.code, correlationId: apiError.correlationId });
  const meta = body.meta;
  const trend = body.trend;
  if (!Array.isArray(body.data) || !isRecord(meta) || !isRecord(trend)
    || typeof meta.page !== 'number' || typeof meta.size !== 'number'
    || typeof meta.totalElements !== 'number' || typeof meta.totalPages !== 'number'
    || typeof trend.latestWeightKg !== 'number' || typeof trend.changeFromFirstKg !== 'number'
    || !(trend.firstOccurredAt === null || typeof trend.firstOccurredAt === 'string')) {
    throw new AnalyticsApiError('Invalid weight history response', { status, code: 'INVALID_RESPONSE' });
  }
  return {
    data: body.data as WeightHistoryResponse['data'],
    meta: meta as WeightHistoryResponse['meta'],
    trend: trend as WeightHistoryResponse['trend'],
    error: null,
  };
}

export function createAnalyticsApiClient({ baseUrl, accessToken, fetchImpl = fetch }: AnalyticsApiClientOptions) {
  const origin = baseUrl.trim().replace(/\/+$/, '');
  if (!origin) throw new AnalyticsApiError('Analytics API base URL is not configured', { code: 'MISSING_API_BASE_URL' });

  async function request(path: string, label: string, signal?: AbortSignal): Promise<{ body: unknown; status: number }> {
    try {
      const response = await fetchImpl(`${origin}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` },
        signal,
      });
      let body: unknown;
      try { body = await response.json(); }
      catch { throw new AnalyticsApiError(`Invalid JSON from ${label}`, { status: response.status, code: 'INVALID_JSON' }); }
      if (!response.ok) {
        const apiError = isRecord(body) ? readApiError(body.error) : null;
        throw new AnalyticsApiError(apiError?.message ?? `Analytics request failed (${response.status})`, {
          status: response.status, code: apiError?.code ?? `HTTP_${response.status}`, correlationId: apiError?.correlationId ?? null,
        });
      }
      return { body, status: response.status };
    } catch (error) {
      if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) throw error;
      if (error instanceof AnalyticsApiError) throw error;
      throw new AnalyticsApiError(error instanceof Error ? error.message : `Unable to load ${label}`, { code: 'NETWORK_ERROR' });
    }
  }

  return {
    async getDailyAssessment(date: string, signal?: AbortSignal) {
      const result = await request(`/api/v1/nutrition-assessments/daily?date=${encodeURIComponent(date)}`, 'daily assessment', signal);
      return requireData<DailyAssessmentData>(result.body, result.status, 'daily assessment');
    },
    async getDashboardTrends(from: string, to: string, signal?: AbortSignal) {
      const result = await request(`/api/v1/dashboard/trends?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, 'dashboard trends', signal);
      return requireData<DashboardTrendsData>(result.body, result.status, 'dashboard trends');
    },
    async getWeightHistory(from: string, to: string, signal?: AbortSignal) {
      const result = await request(`/api/v1/tracking/weight?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&page=0&size=31`, 'weight history', signal);
      return requireWeightHistory(result.body, result.status);
    },
  };
}
