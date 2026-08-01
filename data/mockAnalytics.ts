import {
  DailyAssessmentData,
  DashboardTrendsData,
  TrendPoint,
  WeightHistoryResponse,
  WeightTrendData,
} from '../types/analytics';

export const mockDailyAssessment: DailyAssessmentData = {
  assessmentId: 'daily-assessment-001',
  scope: 'DAY',
  businessDate: '2026-08-01',
  status: 'READY',
  score: 74,
  level: 'GOOD',
  mealCount: 3,
  nutritionSummary: {
    caloriesKcal: 1850,
    proteinG: 92,
    carbohydrateG: 215,
    fatG: 58,
    fiberG: 24,
    sugarG: 31,
    sodiumMg: 2150,
  },
  assessmentVersion: 1,
  breakdown: [],
  triggeredRules: [],
  scoreConfigVersion: 'score-v1',
  ruleVersion: 'rules-v1',
  targets: {
    caloriesKcal: { min: 1800, max: 2100 },
    proteinG: { min: 85, max: 120 },
    fiberG: { min: 25 },
    sodiumMg: { max: 2000 },
  },
  recommendations: [
    {
      recommendationCode: 'ADD_FIBER',
      priority: 'HIGH',
      templateText: 'Bổ sung rau hoặc thực phẩm giàu chất xơ cho bữa tiếp theo.',
    },
    {
      recommendationCode: 'REDUCE_SODIUM',
      priority: 'MEDIUM',
      templateText: 'Hạn chế nước chấm và gia vị mặn ở bữa tối.',
    },
  ],
};

export const mockTrendPoints: TrendPoint[] = [
  { date: '2026-07-26', caloriesKcal: 1750, proteinG: 84, carbohydrateG: 198, fatG: 56, healthyScore: 70, goalAdherence: 0.85, dataCompleteness: 0.95 },
  { date: '2026-07-27', caloriesKcal: 1900, proteinG: 90, carbohydrateG: 210, fatG: 60, healthyScore: 78, goalAdherence: 0.92, dataCompleteness: 1 },
  { date: '2026-07-28', caloriesKcal: null, proteinG: null, carbohydrateG: null, fatG: null, healthyScore: null, goalAdherence: null, dataCompleteness: 0 },
  { date: '2026-07-29', caloriesKcal: 2050, proteinG: 95, carbohydrateG: 232, fatG: 65, healthyScore: 68, goalAdherence: 0.8, dataCompleteness: 0.9 },
  { date: '2026-07-30', caloriesKcal: 1880, proteinG: 88, carbohydrateG: 205, fatG: 58, healthyScore: 82, goalAdherence: 0.95, dataCompleteness: 1 },
  { date: '2026-07-31', caloriesKcal: 1950, proteinG: 91, carbohydrateG: 214, fatG: 61, healthyScore: 72, goalAdherence: 0.86, dataCompleteness: 0.98 },
  { date: '2026-08-01', caloriesKcal: 1850, proteinG: 92, carbohydrateG: 215, fatG: 58, healthyScore: 74, goalAdherence: 0.9, dataCompleteness: 0.96 },
];

export const mockDashboardTrends: DashboardTrendsData = {
  from: '2026-07-26',
  to: '2026-08-01',
  points: mockTrendPoints,
};

export const mockWeightTrend: WeightTrendData = {
  latestWeightKg: 67.8,
  changeFromFirstKg: -0.7,
  firstOccurredAt: '2026-07-01T07:00:00+07:00',
};

export const mockWeightHistory: WeightHistoryResponse = {
  data: [
    {
      trackingEntryId: 'tracking-weight-001',
      entryType: 'WEIGHT',
      value: 67.8,
      unit: 'KG',
      occurredAt: '2026-07-29T07:00:00+07:00',
      businessDate: '2026-07-29',
      note: 'Cân buổi sáng',
      version: 1,
      createdAt: '2026-07-29T07:01:00+07:00',
      updatedAt: '2026-07-29T07:01:00+07:00',
    },
  ],
  meta: { page: 0, size: 20, totalElements: 1, totalPages: 1 },
  trend: mockWeightTrend,
  error: null,
};
