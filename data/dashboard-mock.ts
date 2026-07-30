import type { DashboardData, DashboardDataSource } from '@/types/dashboard';

export const DASHBOARD_MOCK_TIMEZONE = 'Asia/Ho_Chi_Minh';

const fixtures: Record<string, DashboardData> = {
  '2026-07-30': {
    businessDate: '2026-07-30',
    timezone: DASHBOARD_MOCK_TIMEZONE,
    nutritionTotals: {
      caloriesKcal: 1850,
      proteinG: 92,
      carbohydrateG: 215,
      fatG: 58,
      fiberG: 19,
      sugarG: 42,
      sodiumMg: 1670,
      dataCompleteness: 0.9,
    },
    targets: {
      caloriesKcal: { min: 1800, max: 2100 },
      proteinG: { min: 85, max: 120 },
    },
    dailyAssessment: {
      assessmentId: 'assessment-2026-07-30',
      status: 'READY',
      score: 74,
      level: 'GOOD',
    },
    meals: [
      {
        mealId: 'meal-breakfast-2026-07-30',
        mealType: 'BREAKFAST',
        eatenAt: '2026-07-30T07:30:00+07:00',
        caloriesKcal: 480,
        assessmentStatus: 'READY',
        healthyScore: 78,
        imageThumbnailUrl: null,
      },
      {
        mealId: 'meal-lunch-2026-07-30',
        mealType: 'LUNCH',
        eatenAt: '2026-07-30T12:15:00+07:00',
        caloriesKcal: 730,
        assessmentStatus: 'READY',
        healthyScore: 72,
        imageThumbnailUrl: null,
      },
      {
        mealId: 'meal-dinner-2026-07-30',
        mealType: 'DINNER',
        eatenAt: '2026-07-30T18:45:00+07:00',
        caloriesKcal: 640,
        assessmentStatus: 'PENDING',
        healthyScore: null,
        imageThumbnailUrl: null,
      },
    ],
    latestWeight: {
      valueKg: 64.2,
      occurredAt: '2026-07-30T06:45:00+07:00',
    },
    topRecommendations: [
      {
        recommendationCode: 'ADD_FIBER',
        priority: 'MEDIUM',
        text: 'Add a fiber-rich food to support a more balanced day.',
      },
    ],
  },
};

function cloneDashboard(data: DashboardData): DashboardData {
  return JSON.parse(JSON.stringify(data)) as DashboardData;
}

export const dashboardDataSource: DashboardDataSource = {
  async getDashboard(date) {
    const fixture = fixtures[date];
    return fixture ? cloneDashboard(fixture) : null;
  },
};
