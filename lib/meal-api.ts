import { mockAnalysis, mockCatalogFoods, mockConfirmedMeal, zeroNutrients } from '@/data/mock-meals';
import type { ApiEnvelope, CatalogFood, ConfirmedAnalysis, CreateAnalysisInput, CreateMealInput, CustomFoodInput, CustomFood, FoodSearchEnvelope, Meal, MealAnalysis, Nutrients, ReviewAnalysisInput } from '@/types/meals';

export interface MealApi {
  searchFoods(query: string, page?: number, size?: number, signal?: AbortSignal): Promise<FoodSearchEnvelope>;
  getFood(foodId: string, signal?: AbortSignal): Promise<ApiEnvelope<CatalogFood>>;
  createCustomFood(input: CustomFoodInput): Promise<ApiEnvelope<CustomFood>>;
  createMeal(input: CreateMealInput, idempotencyKey: string): Promise<ApiEnvelope<Meal>>;
  listMeals(date: string, signal?: AbortSignal): Promise<ApiEnvelope<Meal[]>>;
  createAnalysis(input: CreateAnalysisInput, idempotencyKey: string): Promise<ApiEnvelope<MealAnalysis>>;
  getAnalysis(analysisId: string, signal?: AbortSignal): Promise<ApiEnvelope<MealAnalysis>>;
  reviewAnalysis(analysisId: string, input: ReviewAnalysisInput): Promise<ApiEnvelope<MealAnalysis>>;
  confirmAnalysis(analysisId: string, idempotencyKey: string): Promise<ApiEnvelope<ConfirmedAnalysis>>;
}

type ApiOptions = { latencyMs?: number };

const ok = <T>(data: T): ApiEnvelope<T> => ({ data, error: null });
const fail = <T>(code: string, message: string): ApiEnvelope<T> => ({ data: null, error: { code, message, fieldErrors: [], correlationId: `mock-${Date.now()}` } });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const createIdempotencyKey = (random = Math.random): string => {
  const section = () => Math.floor(random() * 0x100000000).toString(16).padStart(8, '0');
  return `${section()}-${section().slice(0, 4)}-4${section().slice(0, 3)}-a${section().slice(0, 3)}-${section()}${section().slice(0, 4)}`;
};

const add = (a: Nutrients, b: Nutrients): Nutrients => ({
  caloriesKcal: a.caloriesKcal + b.caloriesKcal, proteinG: a.proteinG + b.proteinG, carbohydrateG: a.carbohydrateG + b.carbohydrateG,
  fatG: a.fatG + b.fatG, fiberG: a.fiberG + b.fiberG, sugarG: a.sugarG + b.sugarG, sodiumMg: a.sodiumMg + b.sodiumMg,
});

export class MockMealApi implements MealApi {
  private readonly latencyMs: number;
  private readonly meals = new Map<string, Meal>();
  private readonly customFoods = new Map<string, CustomFood>();
  private readonly analyses = new Map<string, MealAnalysis>();
  private readonly idempotent = new Map<string, unknown>();

  constructor(options: ApiOptions = {}) {
    this.latencyMs = options.latencyMs ?? 250;
    this.meals.set(mockConfirmedMeal.mealId, clone(mockConfirmedMeal));
  }

  private async wait(signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    await new Promise<void>((resolve) => setTimeout(resolve, this.latencyMs));
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  }

  async searchFoods(query: string, page = 0, size = 10, signal?: AbortSignal): Promise<FoodSearchEnvelope> {
    await this.wait(signal);
    const normalized = query.trim().toLocaleLowerCase('vi');
    const matches = normalized ? mockCatalogFoods.filter((food) => `${food.name} ${food.matchedName}`.toLocaleLowerCase('vi').includes(normalized)) : mockCatalogFoods;
    const data = matches.slice(page * size, page * size + size).map(clone);
    return { ...ok(data), meta: { page, size, totalElements: matches.length, totalPages: Math.ceil(matches.length / size) } };
  }

  async getFood(foodId: string, signal?: AbortSignal): Promise<ApiEnvelope<CatalogFood>> {
    await this.wait(signal);
    const food = mockCatalogFoods.find((item) => item.foodId === foodId);
    return food ? ok(clone(food)) : fail('FOOD_NOT_FOUND', 'Không tìm thấy món ăn.');
  }

  async createCustomFood(input: CustomFoodInput): Promise<ApiEnvelope<CustomFood>> {
    await this.wait();
    const now = new Date().toISOString();
    const customFood = { ...clone(input), customFoodId: `custom-${Date.now()}`, createdAt: now, updatedAt: now }; this.customFoods.set(customFood.customFoodId, customFood); return ok(customFood);
  }

  async createMeal(input: CreateMealInput, idempotencyKey: string): Promise<ApiEnvelope<Meal>> {
    await this.wait();
    const existing = this.idempotent.get(`meal:${idempotencyKey}`) as ApiEnvelope<Meal> | undefined;
    if (existing) return clone(existing);
    const items = input.items.map((item, index) => {
      const food = item.foodId ? mockCatalogFoods.find((candidate) => candidate.foodId === item.foodId) : undefined;
      const customFood = item.customFoodId ? this.customFoods.get(item.customFoodId) : undefined;
      const serving = food?.servings.find((candidate) => candidate.servingId === item.servingId) ?? food?.defaultServing;
      const nutrition = customFood ? Object.fromEntries(Object.entries(customFood.nutritionPerServing).map(([key, value]) => [key, value * item.quantity])) as unknown as Nutrients : food && serving ? Object.fromEntries(Object.entries(food.nutritionPer100g).map(([key, value]) => [key, value * serving.grams * item.quantity / 100])) as unknown as Nutrients : zeroNutrients;
      return { mealItemId: `meal-item-${Date.now()}-${index}`, ...item, foodName: food?.name ?? customFood?.name ?? 'Món tự thêm', servingName: serving?.name ?? customFood?.servingName ?? '1 khẩu phần', totalGrams: serving?.grams ?? customFood?.servingGrams ?? 0, nutrition, inputSource: item.referenceType === 'CUSTOM' ? 'CUSTOM_ENTRY' as const : 'MANUAL_SEARCH' as const };
    });
    const nutritionSummary = items.reduce((sum, item) => add(sum, item.nutrition), zeroNutrients);
    const meal: Meal = { mealId: `meal-${Date.now()}`, mealType: input.mealType, eatenAt: input.eatenAt, businessDate: input.eatenAt.slice(0, 10), imageUrl: null, items, nutritionSummary, healthyScore: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const response = ok(meal);
    this.meals.set(meal.mealId, clone(meal));
    this.idempotent.set(`meal:${idempotencyKey}`, clone(response));
    return response;
  }

  async listMeals(date: string, signal?: AbortSignal): Promise<ApiEnvelope<Meal[]>> {
    await this.wait(signal);
    return ok([...this.meals.values()].filter((meal) => meal.businessDate === date).map(clone));
  }

  async createAnalysis(input: CreateAnalysisInput, idempotencyKey: string): Promise<ApiEnvelope<MealAnalysis>> {
    await this.wait();
    const existing = this.idempotent.get(`analysis:${idempotencyKey}`) as ApiEnvelope<MealAnalysis> | undefined;
    if (existing) return clone(existing);
    const analysis = clone({ ...mockAnalysis, analysisId: `analysis-${Date.now()}`, mealType: input.mealType ?? mockAnalysis.mealType, eatenAt: input.eatenAt ?? mockAnalysis.eatenAt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    this.analyses.set(analysis.analysisId, analysis);
    const response = ok(analysis);
    this.idempotent.set(`analysis:${idempotencyKey}`, clone(response));
    return response;
  }

  async getAnalysis(analysisId: string, signal?: AbortSignal): Promise<ApiEnvelope<MealAnalysis>> {
    await this.wait(signal);
    const analysis = this.analyses.get(analysisId);
    return analysis ? ok(clone(analysis)) : fail('ANALYSIS_NOT_FOUND', 'Không tìm thấy phiên nhận diện.');
  }

  async reviewAnalysis(analysisId: string, input: ReviewAnalysisInput): Promise<ApiEnvelope<MealAnalysis>> {
    await this.wait();
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return fail('ANALYSIS_NOT_FOUND', 'Không tìm thấy phiên nhận diện.');
    const reviewed = clone({ ...analysis, mealType: input.mealType, eatenAt: input.eatenAt, updatedAt: new Date().toISOString(), status: 'REVIEW_REQUIRED' as const });
    this.analyses.set(analysisId, reviewed);
    return ok(reviewed);
  }

  async confirmAnalysis(analysisId: string, idempotencyKey: string): Promise<ApiEnvelope<ConfirmedAnalysis>> {
    await this.wait();
    const existing = this.idempotent.get(`confirm:${idempotencyKey}`) as ApiEnvelope<ConfirmedAnalysis> | undefined;
    if (existing) return clone(existing);
    const analysis = this.analyses.get(analysisId);
    if (!analysis) return fail('ANALYSIS_NOT_FOUND', 'Không tìm thấy phiên nhận diện.');
    const mealResponse = await this.createMeal({ mealType: analysis.mealType, eatenAt: analysis.eatenAt, items: analysis.items.map((item) => ({ referenceType: 'CATALOG', foodId: item.mappedFood?.foodId, servingId: item.servingId, quantity: item.quantity ?? 1 })) }, `analysis-${analysisId}`);
    if (!mealResponse.data) return fail('MEAL_CREATE_FAILED', 'Không thể ghi lại bữa ăn.');
    const response = ok({ analysisId, status: 'CONFIRMED' as const, meal: mealResponse.data });
    this.analyses.set(analysisId, { ...analysis, status: 'CONFIRMED' });
    this.idempotent.set(`confirm:${idempotencyKey}`, clone(response));
    return response;
  }
}

export const mealApi = new MockMealApi();


