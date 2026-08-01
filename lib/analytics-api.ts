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

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function isDashboardTrendPoint(value: unknown): boolean {
  if (!isRecord(value) || typeof value.date !== 'string' || value.date.length === 0) return false;
  const numericFields = ['caloriesKcal', 'proteinG', 'carbohydrateG', 'fatG', 'healthyScore', 'goalAdherence'];
  return numericFields.every((field) => isNullableFiniteNumber(value[field]))
    && typeof value.dataCompleteness === 'number'
    && Number.isFinite(value.dataCompleteness)
    && value.dataCompleteness >= 0
    && value.dataCompleteness <= 1;
}

function requireDashboardTrends(body: unknown, status: number): DashboardTrendsData {
  const data = requireData<unknown>(body, status, 'dashboard trends');
  if (!isRecord(data)
    || typeof data.from !== 'string'
    || typeof data.to !== 'string'
    || data.from.length === 0
    || data.to.length === 0
    || !Array.isArray(data.points)
    || !data.points.every(isDashboardTrendPoint)) {
    throw new AnalyticsApiError('Invalid dashboard trends response', { status, code: 'INVALID_RESPONSE' });
  }
  return data as unknown as DashboardTrendsData;
}

function isTargetItem(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (value.min === undefined || (typeof value.min === 'number' && Number.isFinite(value.min)))
    && (value.max === undefined || (typeof value.max === 'number' && Number.isFinite(value.max)));
}

function isTargets(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return ['caloriesKcal', 'proteinG', 'fiberG', 'sodiumMg'].every((field) => field in value && isTargetItem(value[field]));
}

function isNutritionSummary(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const fields = ['caloriesKcal', 'proteinG', 'carbohydrateG', 'fatG', 'fiberG', 'sugarG', 'sodiumMg'];
  return fields.every((field) => field in value && isNullableFiniteNumber(value[field]));
}

function isDailyRecommendation(value: unknown): boolean {
  if (!isRecord(value) || typeof value.recommendationCode !== 'string' || typeof value.templateText !== 'string') return false;
  if (value.llmText !== undefined && value.llmText !== null && typeof value.llmText !== 'string') return false;
  return value.priority === 'HIGH' || value.priority === 'MEDIUM' || value.priority === 'LOW';
}

function requireDailyAssessment(body: unknown, status: number): DailyAssessmentData {
  const data = requireData<unknown>(body, status, 'daily assessment');
  const statuses = ['READY', 'PENDING', 'FAILED', 'SUPERSEDED'] as const;
  if (!isRecord(data)
    || !statuses.includes(data.status as typeof statuses[number])
    || !isNutritionSummary(data.nutritionSummary)
    || !isTargets(data.targets)
    || !Array.isArray(data.recommendations)
    || !data.recommendations.every(isDailyRecommendation)) {
    throw new AnalyticsApiError('Invalid daily assessment response', { status, code: 'INVALID_RESPONSE' });
  }
  if ('score' in data && !isNullableFiniteNumber(data.score)) {
    throw new AnalyticsApiError('Invalid daily assessment response', { status, code: 'INVALID_RESPONSE' });
  }
  if ('mealCount' in data && (typeof data.mealCount !== 'number' || !Number.isFinite(data.mealCount))) {
    throw new AnalyticsApiError('Invalid daily assessment response', { status, code: 'INVALID_RESPONSE' });
  }
  return data as unknown as DailyAssessmentData;
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
    meta: meta as unknown as WeightHistoryResponse['meta'],
    trend: trend as unknown as WeightHistoryResponse['trend'],
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
      return requireDailyAssessment(result.body, result.status);
    },
    async getDashboardTrends(from: string, to: string, signal?: AbortSignal) {
      const result = await request(`/api/v1/dashboard/trends?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, 'dashboard trends', signal);
      return requireDashboardTrends(result.body, result.status);
    },
    async getWeightHistory(from: string, to: string, signal?: AbortSignal) {
      const result = await request(`/api/v1/tracking/weight?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&page=0&size=31`, 'weight history', signal);
      return requireWeightHistory(result.body, result.status);
    },
  };
}
