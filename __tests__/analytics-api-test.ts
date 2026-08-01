import { AnalyticsApiError, createAnalyticsApiClient } from '@/lib/analytics-api';
import { ApiEnvelope, DashboardTrendsData, NutritionSummary } from '@/types/analytics';
import {
  mockDailyAssessment,
  mockTrendPoints,
  mockWeightHistory,
} from '@/data/mockAnalytics';

describe('analytics API fixtures', () => {
  it('preserves the documented daily assessment fields', () => {
    expect(mockDailyAssessment).toMatchObject({
      assessmentVersion: 1,
      breakdown: [],
      triggeredRules: [],
      scoreConfigVersion: 'score-v1',
      ruleVersion: 'rules-v1',
    });
  });

  it('accepts a nullable data error envelope', () => {
    const envelope: ApiEnvelope<DashboardTrendsData> = { data: null, error: { code: 'UNAVAILABLE', message: 'Unavailable', fieldErrors: [], correlationId: null } };
    expect(envelope.data).toBeNull();
    expect(envelope.error?.code).toBe('UNAVAILABLE');
  });

  it('keeps the daily nutrition summary object while allowing unknown nutrients', () => {
    const summary: NutritionSummary = { caloriesKcal: null, proteinG: null, carbohydrateG: null, fatG: null, fiberG: null, sugarG: null, sodiumMg: null };
    expect(summary.caloriesKcal).toBeNull();
    expect(mockDailyAssessment.nutritionSummary).toBeDefined();
  });

  it('uses only the documented trend-point fields for measured days', () => {
    const measuredPoint = mockTrendPoints.find(
      (point) => point.dataCompleteness > 0,
    );

    expect(measuredPoint).toBeDefined();
    expect(Object.keys(measuredPoint ?? {}).sort()).toEqual([
      'caloriesKcal',
      'carbohydrateG',
      'dataCompleteness',
      'date',
      'fatG',
      'goalAdherence',
      'healthyScore',
      'proteinG',
    ]);
  });

  it('represents no-meal days with nullable totals and scores', () => {
    const noMealPoint = mockTrendPoints.find(
      (point) => point.dataCompleteness === 0,
    );

    expect(noMealPoint).toEqual({
      date: expect.any(String),
      caloriesKcal: null,
      proteinG: null,
      carbohydrateG: null,
      fatG: null,
      healthyScore: null,
      goalAdherence: null,
      dataCompleteness: 0,
    });
    expect(mockDailyAssessment.status).toBe('READY');
  });

  it('provides paginated weight history with the documented trend metadata', () => {
    expect(mockWeightHistory).toEqual({
      data: [
        expect.objectContaining({
          trackingEntryId: expect.any(String),
          entryType: 'WEIGHT',
          value: expect.any(Number),
          unit: 'KG',
          occurredAt: expect.any(String),
          businessDate: expect.any(String),
          note: expect.any(String),
          version: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      ],
      meta: {
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      },
      trend: {
        latestWeightKg: 67.8,
        changeFromFirstKg: -0.7,
        firstOccurredAt: '2026-07-01T07:00:00+07:00',
      },
      error: null,
    });
  });
});

describe('analytics API client', () => {
  const response = (body: unknown, status = 200, ok = status >= 200 && status < 300) => ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as unknown as Response;

  const validWeightBody = {
    data: [],
    meta: { page: 0, size: 31, totalElements: 0, totalPages: 0 },
    trend: { latestWeightKg: 67.8, changeFromFirstKg: -0.7, firstOccurredAt: '2026-07-01T07:00:00+07:00' },
    error: null,
  };

  it('builds authenticated trend URL with documented headers', async () => {
    const fetchMock = jest.fn().mockResolvedValue(response({ data: { from: '2026-07-26', to: '2026-08-01', points: [] }, error: null }));
    await createAnalyticsApiClient({ baseUrl: 'https://api.example.test///', accessToken: 'test-jwt', fetchImpl: fetchMock }).getDashboardTrends('2026-07-26', '2026-08-01');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/v1/dashboard/trends?from=2026-07-26&to=2026-08-01',
      { method: 'GET', headers: { Accept: 'application/json', Authorization: 'Bearer test-jwt' }, signal: undefined },
    );
  });

  it('encodes query values and uses documented daily/weight routes', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(response({ data: {}, error: null }))
      .mockResolvedValueOnce(response(validWeightBody));
    const client = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: fetchMock });
    await client.getDailyAssessment('2026-08-01/unsafe');
    const weight = await client.getWeightHistory('2026-07-03', '2026-08-01');
    expect(weight.meta.size).toBe(31);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/api/v1/nutrition-assessments/daily?date=2026-08-01%2Funsafe');
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.example.test/api/v1/tracking/weight?from=2026-07-03&to=2026-08-01&page=0&size=31');
  });

  it('surfaces 401 and 503 API error metadata', async () => {
    const body = { data: null, error: { code: 'UNAUTHORIZED', message: 'Not allowed', fieldErrors: [], correlationId: 'corr-1' } };
    const errorClient = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: jest.fn().mockResolvedValue(response(body, 401, false)) });
    await expect(errorClient.getDashboardTrends('2026-07-26', '2026-08-01')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED', correlationId: 'corr-1' });
    const unavailableClient = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: jest.fn().mockResolvedValue(response({ data: null, error: { code: 'DEPENDENCY_UNAVAILABLE', message: 'Try later', fieldErrors: [], correlationId: null } }, 503, false)) });
    await expect(unavailableClient.getDashboardTrends('2026-07-26', '2026-08-01')).rejects.toMatchObject({ status: 503, code: 'DEPENDENCY_UNAVAILABLE' });
  });

  it('rejects malformed JSON and missing data', async () => {
    const invalidClient = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: jest.fn().mockResolvedValue({ ok: true, status: 200, json: jest.fn().mockRejectedValue(new Error('bad json')) } as unknown as Response) });
    await expect(invalidClient.getDashboardTrends('2026-07-26', '2026-08-01')).rejects.toBeInstanceOf(AnalyticsApiError);
    const missingClient = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: jest.fn().mockResolvedValue(response({ error: null })) });
    await expect(missingClient.getDashboardTrends('2026-07-26', '2026-08-01')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('validates and returns the complete weight envelope', async () => {
    const fetchMock = jest.fn().mockResolvedValue(response(validWeightBody));
    const client = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: fetchMock });
    const result = await client.getWeightHistory('2026-07-03', '2026-08-01');
    expect(result).toEqual(validWeightBody);
    const invalidClient = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: jest.fn().mockResolvedValue(response({ data: {}, meta: {}, trend: {}, error: null })) });
    await expect(invalidClient.getWeightHistory('2026-07-03', '2026-08-01')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  });

  it('preserves abort identity and forwards AbortSignal', async () => {
    const abortError = Object.assign(new Error('aborted'), { name: 'AbortError' });
    const fetchMock = jest.fn().mockRejectedValue(abortError);
    const client = createAnalyticsApiClient({ baseUrl: 'https://api.example.test', accessToken: 'jwt', fetchImpl: fetchMock });
    const controller = new AbortController();
    await expect(client.getDashboardTrends('2026-07-26', '2026-08-01', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal);
  });
});
