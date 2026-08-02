import { createIdempotencyKey, MockMealApi } from '@/lib/meal-api';

describe('mock meal api', () => {
  it('searches catalog foods with pagination metadata', async () => {
    const api = new MockMealApi({ latencyMs: 0 });

    const response = await api.searchFoods('ức gà', 0, 10);

    expect(response.error).toBeNull();
    expect(response.data?.[0].name).toContain('Ức gà');
    expect(response.meta.totalElements).toBeGreaterThan(0);
  });

  it('returns the same meal for a repeated idempotency key', async () => {
    const api = new MockMealApi({ latencyMs: 0 });
    const input = {
      mealType: 'LUNCH' as const,
      eatenAt: '2026-08-02T12:00:00.000Z',
      items: [{ referenceType: 'CATALOG' as const, foodId: 'food-chicken-breast', servingId: 'serving-100g', quantity: 1 }],
    };
    const key = createIdempotencyKey(() => 0.5);

    const first = await api.createMeal(input, key);
    const second = await api.createMeal(input, key);

    expect(first.data?.mealId).toBe(second.data?.mealId);
    expect(first.data?.nutritionSummary.caloriesKcal).toBeGreaterThan(0);
  });

  it('supports AI analysis lifecycle through review and confirmation', async () => {
    const api = new MockMealApi({ latencyMs: 0 });
    const analysis = await api.createAnalysis({
      image: { uri: 'file:///meal.jpg', fileName: 'meal.jpg', mimeType: 'image/jpeg', fileSize: 1000 },
      mealType: 'DINNER',
      eatenAt: '2026-08-02T19:00:00.000Z',
    }, createIdempotencyKey());

    expect(analysis.data?.status).toBe('REVIEW_REQUIRED');
    const reviewed = await api.reviewAnalysis(analysis.data!.analysisId, {
      mealType: 'DINNER',
      eatenAt: '2026-08-02T19:00:00.000Z',
      items: analysis.data!.items.map((item) => ({
        analysisItemId: item.analysisItemId,
        referenceType: 'CATALOG' as const,
        foodId: item.mappedFood?.foodId,
        servingId: item.servingId,
        quantity: item.quantity ?? 1,
      })),
    });
    expect(reviewed.data?.status).toBe('REVIEW_REQUIRED');

    const confirmed = await api.confirmAnalysis(analysis.data!.analysisId, createIdempotencyKey());
    expect(confirmed.data?.status).toBe('CONFIRMED');
    expect(confirmed.data?.meal.nutritionSummary.caloriesKcal).toBeCloseTo(442.5);
  });
});



