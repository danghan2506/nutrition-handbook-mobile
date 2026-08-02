import { mealApi } from '@/lib/meal-api';
import { useMealsStore } from '@/store/use-meals-store';

describe('meals store', () => {
  beforeEach(() => {
    useMealsStore.getState().reset();
  });

  it('loads daily history and exposes loading completion', async () => {
    await useMealsStore.getState().loadMeals('2026-08-01', mealApi);

    const state = useMealsStore.getState();
    expect(state.selectedDate).toBe('2026-08-01');
    expect(state.meals).toHaveLength(1);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('keeps a draft separate from confirmed history', () => {
    useMealsStore.getState().setDraft({ mealType: 'DINNER', eatenAt: '2026-08-02T19:00:00.000Z', items: [], previewNutrition: { caloriesKcal: 0, proteinG: 0, carbohydrateG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 } });

    expect(useMealsStore.getState().draft?.mealType).toBe('DINNER');
    expect(useMealsStore.getState().meals).toHaveLength(0);
  });
});
