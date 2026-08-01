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
