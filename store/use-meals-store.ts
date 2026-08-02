import { create } from 'zustand';
import { mealApi as defaultMealApi } from '@/lib/meal-api';
import type { MealApi } from '@/lib/meal-api';
import type { Meal, MealAnalysis, MealDraft } from '@/types/meals';

interface MealsState {
  selectedDate: string;
  meals: Meal[];
  draft: MealDraft | null;
  analysis: MealAnalysis | null;
  isLoading: boolean;
  error: string | null;
  loadMeals: (date: string, api?: MealApi) => Promise<void>;
  setDraft: (draft: MealDraft | null) => void;
  setAnalysis: (analysis: MealAnalysis | null) => void;
  appendMeal: (meal: Meal) => void;
  reset: () => void;
}

const initialState = { selectedDate: new Date().toISOString().slice(0, 10), meals: [], draft: null, analysis: null, isLoading: false, error: null };

export const useMealsStore = create<MealsState>((set) => ({
  ...initialState,
  loadMeals: async (date, api = defaultMealApi) => {
    set({ selectedDate: date, isLoading: true, error: null });
    try {
      const response = await api.listMeals(date);
      if (response.error || !response.data) throw new Error(response.error?.message ?? 'Không thể tải lịch sử bữa ăn.');
      set({ meals: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Không thể tải lịch sử bữa ăn.' });
    }
  },
  setDraft: (draft) => set({ draft }),
  setAnalysis: (analysis) => set({ analysis }),
  appendMeal: (meal) => set((state) => ({ meals: [...state.meals, meal] })),
  reset: () => set(initialState),
}));

