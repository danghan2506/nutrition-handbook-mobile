import { getBusinessDate } from '@/lib/dashboard-date';
import type { DashboardData, DashboardDataSource } from '@/types/dashboard';

export const DASHBOARD_MOCK_TIMEZONE = 'Asia/Ho_Chi_Minh';

function getTodayMockFixture(todayDate: string): DashboardData {
  return {
    businessDate: todayDate,
    timezone: DASHBOARD_MOCK_TIMEZONE,
    nutritionTotals: {
      caloriesKcal: 1780,
      proteinG: 95,
      carbohydrateG: 190,
      fatG: 54,
      fiberG: 22,
      sugarG: 35,
      sodiumMg: 1520,
      dataCompleteness: 1.0,
    },
    targets: {
      caloriesKcal: { min: 1800, max: 2100 },
      proteinG: { min: 85, max: 120 },
    },
    dailyAssessment: {
      assessmentId: `assessment-${todayDate}`,
      status: 'READY',
      score: 82,
      level: 'GOOD',
    },
    meals: [
      {
        mealId: `meal-breakfast-${todayDate}`,
        mealType: 'BREAKFAST',
        eatenAt: `${todayDate}T07:30:00+07:00`,
        caloriesKcal: 420,
        assessmentStatus: 'READY',
        healthyScore: 85,
        imageThumbnailUrl: null,
      },
      {
        mealId: `meal-lunch-${todayDate}`,
        mealType: 'LUNCH',
        eatenAt: `${todayDate}T12:15:00+07:00`,
        caloriesKcal: 680,
        assessmentStatus: 'READY',
        healthyScore: 78,
        imageThumbnailUrl: null,
      },
      {
        mealId: `meal-snack-${todayDate}`,
        mealType: 'SNACK',
        eatenAt: `${todayDate}T15:30:00+07:00`,
        caloriesKcal: 150,
        assessmentStatus: 'READY',
        healthyScore: 90,
        imageThumbnailUrl: null,
      },
      {
        mealId: `meal-dinner-${todayDate}`,
        mealType: 'DINNER',
        eatenAt: `${todayDate}T18:45:00+07:00`,
        caloriesKcal: 530,
        assessmentStatus: 'READY',
        healthyScore: 80,
        imageThumbnailUrl: null,
      },
    ],
    latestWeight: {
      valueKg: 64.0,
      occurredAt: `${todayDate}T07:00:00+07:00`,
    },
    topRecommendations: [
      {
        recommendationCode: 'ADD_FIBER',
        priority: 'MEDIUM',
        text: 'Thêm một món giàu chất xơ để ngày ăn uống cân bằng hơn.',
      },
    ],
  };
}

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
        text: 'Thêm một món giàu chất xơ để ngày ăn uống cân bằng hơn.',
      },
    ],
  },
};

function cloneDashboard(data: DashboardData): DashboardData {
  return JSON.parse(JSON.stringify(data)) as DashboardData;
}

export const dashboardDataSource: DashboardDataSource = {
  async getDashboard(date) {
    const today = getBusinessDate(new Date(), DASHBOARD_MOCK_TIMEZONE);
    if (date === today) {
      return getTodayMockFixture(today);
    }
    const fixture = fixtures[date];
    return fixture ? cloneDashboard(fixture) : null;
  },
};
