export type AssessmentStatus = 'READY' | 'PENDING' | 'FAILED';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type NumericTarget = { min?: number; max?: number };

export type NutrientTotals = {
  caloriesKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
  dataCompleteness: number;
};

export type DashboardMeal = {
  mealId: string;
  mealType: MealType;
  eatenAt: string;
  caloriesKcal: number | null;
  assessmentStatus: AssessmentStatus;
  healthyScore: number | null;
  imageThumbnailUrl: string | null;
};

export type DashboardRecommendation = {
  recommendationCode: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  text: string;
};

export type DashboardData = {
  businessDate: string;
  timezone: string;
  nutritionTotals: NutrientTotals;
  targets: { caloriesKcal?: NumericTarget; proteinG?: NumericTarget };
  dailyAssessment: {
    assessmentId: string;
    status: AssessmentStatus;
    score: number | null;
    level: 'NEEDS_ATTENTION' | 'FAIR' | 'GOOD' | 'EXCELLENT' | null;
  } | null;
  meals: DashboardMeal[];
  latestWeight: { valueKg: number; occurredAt: string } | null;
  topRecommendations: DashboardRecommendation[];
};

export interface DashboardDataSource {
  getDashboard(date: string): Promise<DashboardData | null>;
}
