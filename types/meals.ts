export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export type ReferenceType = 'CATALOG' | 'CUSTOM';
export type InputSource = 'AI_DETECTED' | 'MANUAL_SEARCH' | 'CUSTOM_ENTRY' | 'COPIED_FROM_MEAL';
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'CONFIRMED' | 'FAILED' | 'EXPIRED';
export type MappingStatus = 'MAPPED' | 'REVIEW_REQUIRED' | 'UNMAPPED';

export interface Nutrients {
  caloriesKcal: number;
  proteinG: number;
  carbohydrateG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
}

export interface FoodServing {
  servingId: string;
  name: string;
  grams: number;
}

export interface CatalogFood {
  foodId: string;
  name: string;
  matchedName: string;
  category: string;
  defaultServing: FoodServing;
  servings: FoodServing[];
  nutritionPer100g: Nutrients;
}

export interface CustomFoodInput {
  name: string;
  servingName: string;
  servingGrams: number;
  nutritionPerServing: Nutrients;
}

export interface CustomFood extends CustomFoodInput {
  customFoodId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SelectedMealImage {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
  webFile?: File;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors: { field: string; code: string; message: string }[];
  correlationId: string | null;
}

export interface ApiEnvelope<T> {
  data: T | null;
  error: ApiError | null;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface FoodSearchEnvelope extends ApiEnvelope<CatalogFood[]> {
  meta: PageMeta;
}

export interface MealDraftItem {
  draftItemId: string;
  referenceType: ReferenceType;
  foodId?: string;
  customFoodId?: string;
  analysisItemId?: string;
  foodName: string;
  servingId?: string;
  servingName: string;
  quantity: number;
  totalGrams: number;
  nutrition: Nutrients;
}

export interface MealDraft {
  mealType: MealType;
  eatenAt: string;
  items: MealDraftItem[];
  previewNutrition: Nutrients;
}

export interface MealItem extends Omit<MealDraftItem, 'draftItemId'> {
  mealItemId: string;
  inputSource: InputSource;
}

export interface Meal {
  mealId: string;
  mealType: MealType;
  eatenAt: string;
  businessDate: string;
  imageUrl: string | null;
  items: MealItem[];
  nutritionSummary: Nutrients;
  healthyScore: { score: number; level: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisCandidate {
  foodId: string;
  name: string;
  matchScore: number;
}

export interface AnalysisItem {
  analysisItemId: string;
  detectedName: string;
  confidence: number;
  estimatedGrams: number | null;
  mappingStatus: MappingStatus;
  mappedFood: { foodId: string; name: string } | null;
  candidates: AnalysisCandidate[];
  servingId?: string;
  servingName?: string;
  quantity?: number;
  nutrition?: Nutrients;
}

export interface MealAnalysis {
  analysisId: string;
  status: AnalysisStatus;
  mealType: MealType;
  eatenAt: string;
  items: AnalysisItem[];
  nutritionSummary?: Nutrients;
  failure: { code: string; message: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMealItemInput {
  referenceType: ReferenceType;
  foodId?: string;
  customFoodId?: string;
  servingId?: string;
  quantity: number;
}

export interface CreateMealInput {
  mealType: MealType;
  eatenAt: string;
  items: CreateMealItemInput[];
}

export interface CreateAnalysisInput {
  image: SelectedMealImage;
  mealType?: MealType;
  eatenAt?: string;
}

export interface ReviewAnalysisItemInput extends CreateMealItemInput {
  analysisItemId: string | null;
}

export interface ReviewAnalysisInput {
  mealType: MealType;
  eatenAt: string;
  items: ReviewAnalysisItemInput[];
}

export interface ConfirmedAnalysis {
  analysisId: string;
  status: 'CONFIRMED';
  meal: Meal;
}
