import { Text, View } from 'react-native';

import { formatMealTime } from '@/lib/dashboard-date';
import type { DashboardMeal, MealType } from '@/types/dashboard';

type MealSummaryListProps = {
  meals: DashboardMeal[];
  timezone: string;
};

const mealTypeLabels: Record<MealType, string> = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
  SNACK: 'Bữa phụ',
};

function getMealAssessmentText(meal: DashboardMeal): string {
  switch (meal.assessmentStatus) {
    case 'READY':
      return meal.healthyScore === null
        ? 'Chưa có dữ liệu'
        : `Điểm ${meal.healthyScore}`;
    case 'PENDING':
      return 'Đang cập nhật';
    case 'FAILED':
      return 'Chưa thể phân tích';
  }
}

export function MealSummaryList({ meals, timezone }: MealSummaryListProps) {
  const orderedMeals = [...meals].sort((left, right) =>
    left.eatenAt.localeCompare(right.eatenAt),
  );

  return (
    <View className="gap-3">
      {orderedMeals.map((meal) => (
        <View
          key={meal.mealId}
          accessibilityLabel={`${mealTypeLabels[meal.mealType]}, ${formatMealTime(
            meal.eatenAt,
            timezone,
          )}, ${
            meal.caloriesKcal === null
              ? 'Chưa có dữ liệu'
              : `${meal.caloriesKcal} kcal`
          }, ${getMealAssessmentText(meal)}`}
          className="rounded-[18px] bg-surface p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-[16px] font-bold text-ink-navy">
                {mealTypeLabels[meal.mealType]}
              </Text>
              <Text className="mt-1 text-[13px] text-soft-slate">
                {formatMealTime(meal.eatenAt, timezone)}
              </Text>
            </View>
            <Text className="text-[14px] font-bold text-ink-navy">
              {meal.caloriesKcal === null
                ? 'Chưa có dữ liệu'
                : `${meal.caloriesKcal} kcal`}
            </Text>
          </View>
          <Text className="mt-3 text-[13px] text-soft-slate">
            {getMealAssessmentText(meal)}
          </Text>
        </View>
      ))}
    </View>
  );
}