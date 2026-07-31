import { Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp, useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import {
  getAssessmentLabel,
  getCalorieProgress,
  getCalorieTargetLabel,
  getCompletenessMessage,
} from '@/lib/dashboard-display';
import type { DashboardData, NumericTarget } from '@/types/dashboard';

type DailyNutritionSummaryProps = Pick<
  DashboardData,
  'nutritionTotals' | 'targets' | 'dailyAssessment'
>;

const RING_RADIUS = 38;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function shouldStackMacros(width: number, fontScale: number): boolean {
  return width < 380 || fontScale >= 1.35;
}

function formatRange(target?: NumericTarget, unit = ''): string | null {
  if (target?.min !== undefined && target.max !== undefined) {
    return `${target.min}–${target.max}${unit}`;
  }

  if (target?.max !== undefined) return `${target.max}${unit}`;
  if (target?.min !== undefined) return `${target.min}${unit}`;

  return null;
}

function formatNutrient(value: number | null): string {
  return value === null ? 'Chưa có dữ liệu' : `${value} g`;
}

export function DailyNutritionSummary({
  nutritionTotals,
  targets,
  dailyAssessment,
}: DailyNutritionSummaryProps) {
  const { fontScale, width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const stackMacros = shouldStackMacros(width, fontScale);
  const calorieProgress = getCalorieProgress(
    nutritionTotals.caloriesKcal,
    targets.caloriesKcal,
  );
  const calorieTargetLabel = getCalorieTargetLabel(targets.caloriesKcal);
  const hasCalorieMaximum = (targets.caloriesKcal?.max ?? 0) > 0;
  const proteinTarget = formatRange(targets.proteinG, ' g');
  const completenessMessage = getCompletenessMessage(nutritionTotals.dataCompleteness);
  const assessmentLabel = dailyAssessment
    ? getAssessmentLabel(dailyAssessment.status, dailyAssessment.score)
    : 'Điểm chưa có';
  const strokeDashoffset =
    RING_CIRCUMFERENCE * (1 - (calorieProgress ?? 0));

  return (
    <View accessibilityRole="summary" className="rounded-[20px] bg-surface p-5">
      <Text className="text-[13px] font-bold text-soft-slate">
        Dinh dưỡng hôm nay
      </Text>

      <View className="mt-4 flex-row items-center gap-4">
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.duration(220)}>
          <Svg width={96} height={96} viewBox="0 0 100 100" accessible={false}>
            <Circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke="#EAF0ED"
              strokeWidth="9"
            />
            {calorieProgress !== null ? (
              <Circle
                cx="50"
                cy="50"
                r={RING_RADIUS}
                fill="none"
                rotation="-90"
                origin="50, 50"
                stroke="#9BCB8D"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="9"
              />
            ) : null}
          </Svg>
        </Animated.View>

        <View className="min-w-0 flex-1 gap-1">
          <Text
            className="text-[25px] font-bold text-ink-navy"
            style={{ fontVariant: ['tabular-nums'] }}>
            {nutritionTotals.caloriesKcal === null
              ? 'Chưa có dữ liệu'
              : `${nutritionTotals.caloriesKcal} kcal`}
          </Text>
          <Text
            className="text-[13px] text-soft-slate"
            style={{ fontVariant: ['tabular-nums'] }}>
            {calorieTargetLabel}
          </Text>
          {hasCalorieMaximum ? (
            <Text className="text-[13px] text-soft-slate">so với mức tối đa</Text>
          ) : null}
        </View>
      </View>

      <View className="mt-5 rounded-[14px] bg-leaf-wash px-4 py-3">
        <Text className="text-[12px] font-bold text-soft-slate">Đánh giá ngày</Text>
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontVariant: ['tabular-nums'] }}
          className="mt-1 text-[15px] font-bold text-ink-navy">
          {assessmentLabel}
        </Text>
      </View>

      <View
        className={`mt-5 ${
          stackMacros ? 'flex-col gap-4' : 'flex-row gap-3'
        }`}>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[12px] font-bold text-soft-slate">Protein</Text>
          <Text
            className="text-[15px] font-bold text-ink-navy"
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatNutrient(nutritionTotals.proteinG)}
          </Text>
          {proteinTarget ? (
            <Text
              className="text-[12px] text-soft-slate"
              style={{ fontVariant: ['tabular-nums'] }}>
              Mục tiêu {proteinTarget}
            </Text>
          ) : null}
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[12px] font-bold text-soft-slate">Carb</Text>
          <Text
            className="text-[15px] font-bold text-ink-navy"
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatNutrient(nutritionTotals.carbohydrateG)}
          </Text>
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[12px] font-bold text-soft-slate">Chất béo</Text>
          <Text
            className="text-[15px] font-bold text-ink-navy"
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatNutrient(nutritionTotals.fatG)}
          </Text>
        </View>
      </View>

      {completenessMessage ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-5 text-[13px] leading-5 text-soft-slate">
          {completenessMessage}
        </Text>
      ) : null}
    </View>
  );
}
