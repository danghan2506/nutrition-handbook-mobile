import { DailyAssessmentData, TrendPoint, WeightTrendData } from '../types/analytics';

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
  { date: '2026-07-26', dayLabel: 'T2', caloriesKcal: 1750, healthyScore: 70, goalAdherence: 0.85 },
  { date: '2026-07-27', dayLabel: 'T3', caloriesKcal: 1900, healthyScore: 78, goalAdherence: 0.92 },
  { date: '2026-07-28', dayLabel: 'T4', caloriesKcal: 1820, healthyScore: 75, goalAdherence: 0.88 },
  { date: '2026-07-29', dayLabel: 'T5', caloriesKcal: 2050, healthyScore: 68, goalAdherence: 0.80 },
  { date: '2026-07-30', dayLabel: 'T6', caloriesKcal: 1880, healthyScore: 82, goalAdherence: 0.95 },
  { date: '2026-07-31', dayLabel: 'T7', caloriesKcal: 1950, healthyScore: 72, goalAdherence: 0.86 },
  { date: '2026-08-01', dayLabel: 'CN', caloriesKcal: 1850, healthyScore: 74, goalAdherence: 0.90 },
];

export const mockWeightTrend: WeightTrendData = {
  latestWeightKg: 67.8,
  changeFromFirstKg: -0.7,
  periodDays: 30,
};
