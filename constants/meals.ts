import type { MealType } from '@/types/meals';

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MEAL_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const mealTypeLabels: Record<MealType, string> = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
  SNACK: 'Bữa phụ',
};
