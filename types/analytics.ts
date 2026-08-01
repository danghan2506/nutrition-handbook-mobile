export type HealthyLevel = 'NEEDS_ATTENTION' | 'FAIR' | 'GOOD' | 'EXCELLENT';

export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface TargetItem {
  min?: number;
  max?: number;
}

export interface DailyAssessmentData {
  assessmentId: string;
  scope: 'DAY';
  businessDate: string;
  status: 'READY' | 'PENDING' | 'FAILED';
  score: number;
  level: HealthyLevel;
  mealCount: number;
  nutritionSummary: {
    caloriesKcal: number;
    proteinG: number;
    carbohydrateG: number;
    fatG: number;
    fiberG: number;
    sugarG: number;
    sodiumMg: number;
  };
  targets: {
    caloriesKcal: TargetItem;
    proteinG: TargetItem;
    fiberG: TargetItem;
    sodiumMg: TargetItem;
  };
  recommendations: Array<{
    recommendationCode: string;
    priority: RecommendationPriority;
    templateText: string;
    llmText?: string | null;
  }>;
}

export interface TrendPoint {
  date: string;
  dayLabel: string;
  caloriesKcal: number;
  healthyScore: number;
  goalAdherence: number;
}

export interface WeightTrendData {
  latestWeightKg: number;
  changeFromFirstKg: number;
  periodDays: number;
}
