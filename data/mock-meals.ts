import type { CatalogFood, Meal, MealAnalysis, Nutrients } from '@/types/meals';

export const zeroNutrients: Nutrients = {
  caloriesKcal: 0,
  proteinG: 0,
  carbohydrateG: 0,
  fatG: 0,
  fiberG: 0,
  sugarG: 0,
  sodiumMg: 0,
};

export const mockCatalogFoods: CatalogFood[] = [
  {
    foodId: 'food-chicken-breast',
    name: 'Ức gà áp chảo',
    matchedName: 'ức gà',
    category: 'Thịt gia cầm',
    defaultServing: { servingId: 'serving-100g', name: '100 g', grams: 100 },
    servings: [
      { servingId: 'serving-100g', name: '100 g', grams: 100 },
      { servingId: 'serving-piece', name: '1 miếng vừa', grams: 150 },
    ],
    nutritionPer100g: { caloriesKcal: 165, proteinG: 31, carbohydrateG: 0, fatG: 3.6, fiberG: 0, sugarG: 0, sodiumMg: 74 },
  },
  {
    foodId: 'food-rice',
    name: 'Cơm trắng',
    matchedName: 'cơm',
    category: 'Ngũ cốc',
    defaultServing: { servingId: 'serving-bowl', name: '1 bát nhỏ', grams: 150 },
    servings: [{ servingId: 'serving-bowl', name: '1 bát nhỏ', grams: 150 }, { servingId: 'serving-100g', name: '100 g', grams: 100 }],
    nutritionPer100g: { caloriesKcal: 130, proteinG: 2.7, carbohydrateG: 28, fatG: 0.3, fiberG: 0.4, sugarG: 0.1, sodiumMg: 1 },
  },
  {
    foodId: 'food-salmon',
    name: 'Cá hồi nướng',
    matchedName: 'cá hồi',
    category: 'Hải sản',
    defaultServing: { servingId: 'serving-slice', name: '1 lát vừa', grams: 120 },
    servings: [{ servingId: 'serving-slice', name: '1 lát vừa', grams: 120 }, { servingId: 'serving-100g', name: '100 g', grams: 100 }],
    nutritionPer100g: { caloriesKcal: 208, proteinG: 20.4, carbohydrateG: 0, fatG: 13.4, fiberG: 0, sugarG: 0, sodiumMg: 59 },
  },
  {
    foodId: 'food-egg',
    name: 'Trứng gà luộc',
    matchedName: 'trứng',
    category: 'Trứng',
    defaultServing: { servingId: 'serving-egg', name: '1 quả', grams: 50 },
    servings: [{ servingId: 'serving-egg', name: '1 quả', grams: 50 }, { servingId: 'serving-100g', name: '100 g', grams: 100 }],
    nutritionPer100g: { caloriesKcal: 155, proteinG: 13, carbohydrateG: 1.1, fatG: 11, fiberG: 0, sugarG: 1.1, sodiumMg: 124 },
  },
  {
    foodId: 'food-salad',
    name: 'Salad rau củ',
    matchedName: 'salad',
    category: 'Rau củ',
    defaultServing: { servingId: 'serving-bowl', name: '1 bát', grams: 180 },
    servings: [{ servingId: 'serving-bowl', name: '1 bát', grams: 180 }, { servingId: 'serving-100g', name: '100 g', grams: 100 }],
    nutritionPer100g: { caloriesKcal: 42, proteinG: 1.5, carbohydrateG: 7, fatG: 1, fiberG: 2.2, sugarG: 3.2, sodiumMg: 35 },
  },
];

export const mockConfirmedMeal: Meal = {
  mealId: 'meal-confirmed-demo',
  mealType: 'LUNCH',
  eatenAt: '2026-08-01T12:15:00.000Z',
  businessDate: '2026-08-01',
  imageUrl: null,
  items: [{
    mealItemId: 'meal-item-demo', referenceType: 'CATALOG', foodId: 'food-chicken-breast',
    foodName: 'Ức gà áp chảo', servingId: 'serving-piece', servingName: '1 miếng vừa', quantity: 1,
    totalGrams: 150, nutrition: { caloriesKcal: 248, proteinG: 46.5, carbohydrateG: 0, fatG: 5.4, fiberG: 0, sugarG: 0, sodiumMg: 111 }, inputSource: 'MANUAL_SEARCH',
  }, { mealItemId: 'meal-item-demo-2', referenceType: 'CATALOG', foodId: 'food-rice', foodName: 'Cơm trắng', servingId: 'serving-bowl', servingName: '1 bát nhỏ', quantity: 1, totalGrams: 150, nutrition: { caloriesKcal: 195, proteinG: 4.1, carbohydrateG: 42, fatG: 0.5, fiberG: 0.6, sugarG: 0.2, sodiumMg: 2 }, inputSource: 'MANUAL_SEARCH' }],
  nutritionSummary: { caloriesKcal: 443, proteinG: 50.6, carbohydrateG: 42, fatG: 5.9, fiberG: 0.6, sugarG: 0.2, sodiumMg: 113 },
  healthyScore: { score: 82, level: 'BALANCED' }, createdAt: '2026-08-01T12:20:00.000Z', updatedAt: '2026-08-01T12:20:00.000Z',
};

export const mockAnalysis: MealAnalysis = {
  analysisId: 'analysis-demo', status: 'REVIEW_REQUIRED', mealType: 'DINNER', eatenAt: '2026-08-02T19:00:00.000Z',
  items: [{ analysisItemId: 'analysis-item-1', detectedName: 'ức gà', confidence: 0.96, estimatedGrams: 150, mappingStatus: 'MAPPED', mappedFood: { foodId: 'food-chicken-breast', name: 'Ức gà áp chảo' }, candidates: [{ foodId: 'food-chicken-breast', name: 'Ức gà áp chảo', matchScore: 0.96 }], servingId: 'serving-piece', servingName: '1 miếng vừa', quantity: 1, nutrition: { caloriesKcal: 248, proteinG: 46.5, carbohydrateG: 0, fatG: 5.4, fiberG: 0, sugarG: 0, sodiumMg: 111 } }, { analysisItemId: 'analysis-item-2', detectedName: 'cơm trắng', confidence: 0.91, estimatedGrams: 150, mappingStatus: 'MAPPED', mappedFood: { foodId: 'food-rice', name: 'Cơm trắng' }, candidates: [{ foodId: 'food-rice', name: 'Cơm trắng', matchScore: 0.91 }], servingId: 'serving-bowl', servingName: '1 bát nhỏ', quantity: 1, nutrition: { caloriesKcal: 195, proteinG: 4.1, carbohydrateG: 42, fatG: 0.5, fiberG: 0.6, sugarG: 0.2, sodiumMg: 2 } }],
  nutritionSummary: { caloriesKcal: 443, proteinG: 50.6, carbohydrateG: 42, fatG: 5.9, fiberG: 0.6, sugarG: 0.2, sodiumMg: 113 }, failure: null, createdAt: '2026-08-02T19:00:02.000Z', updatedAt: '2026-08-02T19:00:03.000Z',
};
