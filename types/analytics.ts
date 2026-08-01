export type HealthyLevel = 'NEEDS_ATTENTION' | 'FAIR' | 'GOOD' | 'EXCELLENT';
export type RecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type AnalyticsPeriodDays = 7 | 30;
export type AssessmentStatus = 'READY' | 'PENDING' | 'FAILED' | 'SUPERSEDED';

export interface FieldError { field: string; code: string; message: string; }
export interface ApiError {
  code: string;
  message: string;
  fieldErrors: FieldError[];
  correlationId: string | null;
}
export interface ApiEnvelope<T> { data: T | null; error: ApiError | null; }
export interface PageMeta { page: number; size: number; totalElements: number; totalPages: number; }
export interface TargetItem { min?: number; max?: number; }

export interface NutritionSummary {
  caloriesKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
}

export interface DailyAssessmentData {
  assessmentId: string;
  scope: 'DAY';
  businessDate: string;
  status: AssessmentStatus;
  score: number | null;
  level: HealthyLevel | null;
  mealCount: number;
  nutritionSummary: NutritionSummary;
  assessmentVersion: number | null;
  breakdown: Array<{
    componentCode: string;
    actual: number | null;
    target: Record<string, unknown> | null;
    componentScore: number | null;
    contribution: number | null;
    dataStatus: string;
  }>;
  triggeredRules: Array<{
    ruleId: string;
    severity: string;
    effect: Record<string, unknown>;
    reasonCode: string;
  }>;
  scoreConfigVersion: string | null;
  ruleVersion: string | null;
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

export interface DashboardTrendPoint {
  date: string;
  caloriesKcal: number | null;
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  healthyScore: number | null;
  goalAdherence: number | null;
  dataCompleteness: number;
}
export type TrendPoint = DashboardTrendPoint;
export interface DashboardTrendsData { from: string; to: string; points: DashboardTrendPoint[]; }

export interface WeightEntry {
  trackingEntryId: string;
  entryType: 'WEIGHT';
  value: number;
  unit: 'KG';
  occurredAt: string;
  businessDate: string;
  note: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface WeightTrendData {
  latestWeightKg: number;
  changeFromFirstKg: number;
  firstOccurredAt: string | null;
}
export interface WeightHistoryResponse {
  data: WeightEntry[];
  meta: PageMeta;
  trend: WeightTrendData;
  error: ApiError | null;
}
